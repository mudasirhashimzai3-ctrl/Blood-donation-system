import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import DeleteHospitalDialog from "../components/DeleteHospitalDialog";
import HospitalFilters from "../components/HospitalFilters";
import HospitalTable from "../components/HospitalTable";
import { useHospitalFilters } from "../hooks/useHospitalFilters";
import { useDeleteHospital, useHospitalsList } from "../queries/useHospitalQueries";

export default function HospitalListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const [deleteHospitalId, setDeleteHospitalId] = useState<number | null>(null);

  const {
    search,
    province,
    page,
    pageSize,
    setSearch,
    setProvince,
    setPage,
    resetFilters,
    queryParams,
  } = useHospitalFilters();

  const { data, isLoading, error } = useHospitalsList(queryParams);
  const deleteMutation = useDeleteHospital();

  const hospitals = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  const handleDelete = async () => {
    if (!deleteHospitalId) return;
    await deleteMutation.mutateAsync(deleteHospitalId);
    setDeleteHospitalId(null);
  };

  if (!can("hospitals")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("hospitals.errors.noPermission", "You do not have permission to access hospitals.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospitals.title", "Hospitals")}
        subtitle={t("hospitals.subtitle", "Manage hospital records for recipient assignments")}
        actions={[
          {
            label: t("hospitals.actions.add", "Add Hospital"),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate("/hospitals/new"),
          },
        ]}
      />

      <Card>
        <CardContent>
          <HospitalFilters
            search={search}
            province={province}
            onSearchChange={setSearch}
            onProvinceChange={setProvince}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="text-sm text-error">
            {t("hospitals.errors.loadFailed", "Failed to load hospitals list")}
          </CardContent>
        </Card>
      ) : (
        <HospitalTable
          hospitals={hospitals}
          isLoading={isLoading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onView={(id) => navigate(`/hospitals/${id}`)}
          onEdit={(id) => navigate(`/hospitals/${id}/edit`)}
          onDelete={(id) => setDeleteHospitalId(id)}
        />
      )}

      <DeleteHospitalDialog
        isOpen={deleteHospitalId !== null}
        onClose={() => setDeleteHospitalId(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
