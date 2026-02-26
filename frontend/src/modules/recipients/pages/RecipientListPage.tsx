import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import BlockUnblockRecipientDialog from "../components/BlockUnblockRecipientDialog";
import DeleteRecipientDialog from "../components/DeleteRecipientDialog";
import RecipientFilters from "../components/RecipientFilters";
import RecipientTable from "../components/RecipientTable";
import { useRecipientFilters } from "../hooks/useRecipientFilters";
import {
  useBlockRecipient,
  useDeleteRecipient,
  useRecipientsList,
  useUnblockRecipient,
} from "../queries/useRecipientQueries";
import type { RecipientStatus } from "../types/recipient.types";

export default function RecipientListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const [deleteRecipientId, setDeleteRecipientId] = useState<number | null>(null);
  const [statusActionTarget, setStatusActionTarget] = useState<{ id: number; status: RecipientStatus } | null>(null);

  const {
    search,
    bloodGroup,
    emergencyLevel,
    city,
    status,
    page,
    pageSize,
    setSearch,
    setBloodGroup,
    setEmergencyLevel,
    setCity,
    setStatus,
    setPage,
    resetFilters,
    queryParams,
  } = useRecipientFilters();

  const { data, isLoading, error } = useRecipientsList(queryParams);
  const deleteMutation = useDeleteRecipient();
  const blockMutation = useBlockRecipient();
  const unblockMutation = useUnblockRecipient();

  const recipients = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  const handleDelete = async () => {
    if (!deleteRecipientId) return;
    await deleteMutation.mutateAsync(deleteRecipientId);
    setDeleteRecipientId(null);
  };

  const handleStatusChange = async () => {
    if (!statusActionTarget) return;
    if (statusActionTarget.status === "blocked") {
      await unblockMutation.mutateAsync(statusActionTarget.id);
    } else {
      await blockMutation.mutateAsync(statusActionTarget.id);
    }
    setStatusActionTarget(null);
  };

  if (!can("recipients")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("recipients.errors.noPermission", "You do not have permission to access recipients.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("recipients.title", "Recipients")}
        subtitle={t("recipients.subtitle", "Manage recipient records with emergency requirements")}
        actions={[
          {
            label: t("recipients.actions.add", "Add Recipient"),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate("/recipients/new"),
          },
        ]}
      />

      <Card>
        <CardContent>
          <RecipientFilters
            search={search}
            bloodGroup={bloodGroup}
            emergencyLevel={emergencyLevel}
            city={city}
            status={status}
            onSearchChange={setSearch}
            onBloodGroupChange={setBloodGroup}
            onEmergencyLevelChange={setEmergencyLevel}
            onCityChange={setCity}
            onStatusChange={setStatus}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="text-sm text-error">
            {t("recipients.errors.loadFailed", "Failed to load recipients list")}
          </CardContent>
        </Card>
      ) : (
        <RecipientTable
          recipients={recipients}
          isLoading={isLoading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onView={(id) => navigate(`/recipients/${id}`)}
          onEdit={(id) => navigate(`/recipients/${id}/edit`)}
          onDelete={(id) => setDeleteRecipientId(id)}
          onToggleBlock={(id, currentStatus) => setStatusActionTarget({ id, status: currentStatus })}
        />
      )}

      <DeleteRecipientDialog
        isOpen={deleteRecipientId !== null}
        onClose={() => setDeleteRecipientId(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      <BlockUnblockRecipientDialog
        isOpen={statusActionTarget !== null}
        onClose={() => setStatusActionTarget(null)}
        onConfirm={handleStatusChange}
        isBlocked={statusActionTarget?.status === "blocked"}
        loading={blockMutation.isPending || unblockMutation.isPending}
      />
    </div>
  );
}

