import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import { Avatar, Badge, Button, Card, CardContent } from "@components/ui";
import useCan from "@/hooks/useCan";
import DeleteDonorDialog from "../components/DeleteDonorDialog";
import DonorStatusBadge from "../components/DonorStatusBadge";
import { useDeleteDonor, useDonor } from "../queries/useDonorQueries";

export default function DonorViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const donorId = Number(id);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: donor, isLoading, error } = useDonor(donorId, { enabled: Number.isFinite(donorId) });
  const deleteMutation = useDeleteDonor();

  const handleDelete = async () => {
    if (!donor) return;
    await deleteMutation.mutateAsync(donor.id);
    setIsDeleteOpen(false);
    navigate("/donors");
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

  if (!Number.isFinite(donorId)) {
    return (
      <Card>
        <CardContent className="text-sm text-error">{t("donors.errors.notFound", "Donor not found")}</CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t("donors.loading", "Loading donor details...")}</CardContent>
      </Card>
    );
  }

  if (error || !donor) {
    return (
      <Card>
        <CardContent className="text-sm text-error">{t("donors.errors.loadFailed", "Failed to load donor details")}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donors.view.title", "Donor Details")}
        subtitle={t("donors.view.subtitle", "View donor profile information")}
      />

      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={donor.profile_picture_url}
                name={`${donor.first_name} ${donor.last_name}`}
                size="xl"
              />
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {donor.first_name} {donor.last_name}
                </h2>
                <p className="text-sm text-text-secondary">{donor.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{donor.blood_group}</Badge>
              <DonorStatusBadge status={donor.status} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("donors.form.email", "Email")}</p>
              <p className="text-sm text-text-primary">{donor.email || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("donors.form.dateOfBirth", "Date of Birth")}</p>
              <p className="text-sm text-text-primary">{donor.date_of_birth || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("donors.form.lastDonationDate", "Last Donation Date")}
              </p>
              <p className="text-sm text-text-primary">{donor.last_donation_date || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("donors.form.status", "Status")}</p>
              <p className="text-sm text-text-primary">{t(`donors.status.${donor.status}`, donor.status)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase text-text-secondary">{t("donors.form.address", "Address")}</p>
              <p className="text-sm text-text-primary">{donor.address || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("donors.form.emergencyContactName", "Emergency Contact Name")}
              </p>
              <p className="text-sm text-text-primary">{donor.emergency_contact_name || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("donors.form.emergencyContactPhone", "Emergency Contact Phone")}
              </p>
              <p className="text-sm text-text-primary">{donor.emergency_contact_phone || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase text-text-secondary">{t("donors.form.notes", "Notes")}</p>
              <p className="text-sm text-text-primary">{donor.notes || "-"}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => navigate("/donors")} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              {t("donors.actions.backToList", "Back to list")}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/donors/${donor.id}/edit`)} leftIcon={<Pencil className="h-4 w-4" />}>
              {t("donors.actions.edit", "Edit")}
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)} leftIcon={<Trash2 className="h-4 w-4" />}>
              {t("donors.actions.delete", "Delete")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteDonorDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
