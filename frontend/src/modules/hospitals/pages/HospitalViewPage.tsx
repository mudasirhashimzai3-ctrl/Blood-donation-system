import { ArrowLeft, Ban, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { Button, Card, CardContent } from "@components/ui";
import DeleteHospitalDialog from "../components/DeleteHospitalDialog";
import HospitalStatusBadge from "../components/HospitalStatusBadge";
import ToggleHospitalStatusDialog from "../components/ToggleHospitalStatusDialog";
import { useActivateHospital, useDeactivateHospital, useDeleteHospital, useHospital } from "../queries/useHospitalQueries";

export default function HospitalViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const hospitalId = Number(id);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const { data: hospital, isLoading, error } = useHospital(hospitalId, { enabled: Number.isFinite(hospitalId) });
  const deleteMutation = useDeleteHospital();
  const activateMutation = useActivateHospital();
  const deactivateMutation = useDeactivateHospital();

  const handleDelete = async () => {
    if (!hospital) return;
    await deleteMutation.mutateAsync(hospital.id);
    setIsDeleteOpen(false);
    navigate("/hospitals");
  };

  const handleToggleStatus = async () => {
    if (!hospital) return;
    if (hospital.is_active) {
      await deactivateMutation.mutateAsync(hospital.id);
    } else {
      await activateMutation.mutateAsync(hospital.id);
    }
    setIsStatusDialogOpen(false);
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

  if (!Number.isFinite(hospitalId)) {
    return (
      <Card>
        <CardContent className="text-sm text-error">{t("hospitals.errors.notFound", "Hospital not found")}</CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t("hospitals.loading", "Loading hospital details...")}</CardContent>
      </Card>
    );
  }

  if (error || !hospital) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("hospitals.errors.loadFailed", "Failed to load hospital details")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospitals.view.title", "Hospital Details")}
        subtitle={t("hospitals.view.subtitle", "View hospital information")}
      />

      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{hospital.name}</h2>
              <p className="text-sm text-text-secondary">{hospital.city}</p>
            </div>
            <HospitalStatusBadge isActive={hospital.is_active} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("hospitals.form.phone", "Phone")}</p>
              <p className="text-sm text-text-primary">{hospital.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("hospitals.form.email", "Email")}</p>
              <p className="text-sm text-text-primary">{hospital.email || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase text-text-secondary">{t("hospitals.form.address", "Address")}</p>
              <p className="text-sm text-text-primary">{hospital.address || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("hospitals.form.latitude", "Latitude")}</p>
              <p className="text-sm text-text-primary">{hospital.latitude || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("hospitals.form.longitude", "Longitude")}</p>
              <p className="text-sm text-text-primary">{hospital.longitude || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("hospitals.form.createdAt", "Created At")}</p>
              <p className="text-sm text-text-primary">{formatLocalDateTime(hospital.created_at)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("hospitals.form.updatedAt", "Updated At")}</p>
              <p className="text-sm text-text-primary">{formatLocalDateTime(hospital.updated_at)}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => navigate("/hospitals")} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              {t("hospitals.actions.backToList", "Back to list")}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/hospitals/${hospital.id}/edit`)}
              leftIcon={<Pencil className="h-4 w-4" />}
            >
              {t("hospitals.actions.edit", "Edit")}
            </Button>
            <Button
              variant={hospital.is_active ? "danger" : "primary"}
              onClick={() => setIsStatusDialogOpen(true)}
              leftIcon={hospital.is_active ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            >
              {hospital.is_active
                ? t("hospitals.actions.deactivate", "Deactivate")
                : t("hospitals.actions.activate", "Activate")}
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)} leftIcon={<Trash2 className="h-4 w-4" />}>
              {t("hospitals.actions.delete", "Delete")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteHospitalDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      <ToggleHospitalStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleToggleStatus}
        isActive={hospital.is_active}
        loading={activateMutation.isPending || deactivateMutation.isPending}
      />
    </div>
  );
}

