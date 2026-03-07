import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import BloodRequestFilters from "../components/BloodRequestFilters";
import BloodRequestTable from "../components/BloodRequestTable";
import { useBloodRequestFilters } from "../hooks/useBloodRequestFilters";
import {
  useBloodRequestsList,
  useDeleteBloodRequest,
  useRunAutoMatch,
} from "../queries/useBloodRequestQueries";

export default function BloodRequestListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const {
    search,
    status,
    bloodGroup,
    requestType,
    priority,
    isActive,
    page,
    pageSize,
    setSearch,
    setStatus,
    setBloodGroup,
    setRequestType,
    setPriority,
    setIsActive,
    setPage,
    resetFilters,
    queryParams,
  } = useBloodRequestFilters();

  const { data, isLoading, error } = useBloodRequestsList(queryParams);
  const deleteMutation = useDeleteBloodRequest();
  const runAutoMatchMutation = useRunAutoMatch();

  const requests = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  if (!can("blood_requests")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t(
            "bloodRequests.errors.noPermission",
            "You do not have permission to access blood requests."
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bloodRequests.title", "Blood Requests")}
        subtitle={t(
          "bloodRequests.subtitle",
          "Manage blood request workflow from pending to completion"
        )}
        actions={[
          {
            label: t("bloodRequests.actions.add", "Add Request"),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate("/blood-requests/new"),
          },
        ]}
      />

      <Card>
        <CardContent>
          <BloodRequestFilters
            search={search}
            status={status}
            bloodGroup={bloodGroup}
            requestType={requestType}
            priority={priority}
            isActive={isActive}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onBloodGroupChange={setBloodGroup}
            onRequestTypeChange={setRequestType}
            onPriorityChange={setPriority}
            onIsActiveChange={setIsActive}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="text-sm text-error">
            {t("bloodRequests.errors.loadFailed", "Failed to load blood requests")}
          </CardContent>
        </Card>
      ) : (
        <BloodRequestTable
          bloodRequests={requests}
          isLoading={isLoading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onView={(id) => navigate(`/blood-requests/${id}`)}
          onEdit={(id) => navigate(`/blood-requests/${id}/edit`)}
          onDelete={async (id) => {
            if (!window.confirm(t("bloodRequests.delete.confirm", "Delete this blood request?"))) return;
            await deleteMutation.mutateAsync(id);
          }}
          onRunAutoMatch={async (id) => {
            await runAutoMatchMutation.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}
