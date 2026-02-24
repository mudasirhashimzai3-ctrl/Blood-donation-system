import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import useCan from "@/hooks/useCan";
import DeleteDonorDialog from "../components/DeleteDonorDialog";
import DonorFilters from "../components/DonorFilters";
import DonorTable from "../components/DonorTable";
import { useDonorFilters } from "../hooks/useDonorFilters";
import { useDeleteDonor, useDonorsList } from "../queries/useDonorQueries";

export default function DonorListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const [deleteDonorId, setDeleteDonorId] = useState<number | null>(null);

  const { search, bloodGroup, status, page, pageSize, setSearch, setBloodGroup, setStatus, setPage, resetFilters, queryParams } =
    useDonorFilters();

  const { data, isLoading, error } = useDonorsList(queryParams);
  const deleteMutation = useDeleteDonor();

  const donors = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  const handleDelete = async () => {
    if (!deleteDonorId) return;
    await deleteMutation.mutateAsync(deleteDonorId);
    setDeleteDonorId(null);
  };

  if (!can("donors")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("donors.errors.noPermission", "You do not have permission to access donors.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donors.title", "Donors")}
        subtitle={t("donors.subtitle", "Manage donor records with blood group and status")}
        actions={[
          {
            label: t("donors.actions.add", "Add Donor"),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate("/donors/new"),
          },
        ]}
      />

      <Card>
        <CardContent>
          <DonorFilters
            search={search}
            bloodGroup={bloodGroup}
            status={status}
            onSearchChange={setSearch}
            onBloodGroupChange={setBloodGroup}
            onStatusChange={setStatus}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="text-sm text-error">
            {t("donors.errors.loadFailed", "Failed to load donors list")}
          </CardContent>
        </Card>
      ) : (
        <DonorTable
          donors={donors}
          isLoading={isLoading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onView={(id) => navigate(`/donors/${id}`)}
          onEdit={(id) => navigate(`/donors/${id}/edit`)}
          onDelete={(id) => setDeleteDonorId(id)}
        />
      )}

      <DeleteDonorDialog
        isOpen={deleteDonorId !== null}
        onClose={() => setDeleteDonorId(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
