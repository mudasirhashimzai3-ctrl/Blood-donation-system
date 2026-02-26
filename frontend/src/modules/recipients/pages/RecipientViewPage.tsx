import { ArrowLeft, Ban, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { Badge, Button, Card, CardContent } from "@components/ui";
import BlockUnblockRecipientDialog from "../components/BlockUnblockRecipientDialog";
import DeleteRecipientDialog from "../components/DeleteRecipientDialog";
import EmergencyLevelBadge from "../components/EmergencyLevelBadge";
import RecipientStatusBadge from "../components/RecipientStatusBadge";
import {
  useBlockRecipient,
  useDeleteRecipient,
  useRecipient,
  useUnblockRecipient,
} from "../queries/useRecipientQueries";

export default function RecipientViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const recipientId = Number(id);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const { data: recipient, isLoading, error } = useRecipient(recipientId, { enabled: Number.isFinite(recipientId) });
  const deleteMutation = useDeleteRecipient();
  const blockMutation = useBlockRecipient();
  const unblockMutation = useUnblockRecipient();

  const handleDelete = async () => {
    if (!recipient) return;
    await deleteMutation.mutateAsync(recipient.id);
    setIsDeleteOpen(false);
    navigate("/recipients");
  };

  const handleToggleStatus = async () => {
    if (!recipient) return;
    if (recipient.status === "blocked") {
      await unblockMutation.mutateAsync(recipient.id);
    } else {
      await blockMutation.mutateAsync(recipient.id);
    }
    setIsStatusDialogOpen(false);
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

  if (!Number.isFinite(recipientId)) {
    return (
      <Card>
        <CardContent className="text-sm text-error">{t("recipients.errors.notFound", "Recipient not found")}</CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t("recipients.loading", "Loading recipient details...")}</CardContent>
      </Card>
    );
  }

  if (error || !recipient) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("recipients.errors.loadFailed", "Failed to load recipient details")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("recipients.view.title", "Recipient Details")}
        subtitle={t("recipients.view.subtitle", "View recipient profile information")}
      />

      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{recipient.full_name}</h2>
              <p className="text-sm text-text-secondary">{recipient.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{recipient.required_blood_group}</Badge>
              <EmergencyLevelBadge level={recipient.emergency_level} />
              <RecipientStatusBadge status={recipient.status} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.email", "Email")}</p>
              <p className="text-sm text-text-primary">{recipient.email || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.age", "Age")}</p>
              <p className="text-sm text-text-primary">{recipient.age}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.gender", "Gender")}</p>
              <p className="text-sm text-text-primary">{t(`recipients.gender.${recipient.gender}`, recipient.gender)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.hospitalName", "Hospital Name")}</p>
              <p className="text-sm text-text-primary">{recipient.hospital_name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("recipients.form.hospitalContact", "Hospital Contact")}
              </p>
              <p className="text-sm text-text-primary">{recipient.hospital_phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("recipients.form.hospitalEmail", "Hospital Email")}
              </p>
              <p className="text-sm text-text-primary">{recipient.hospital_email || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.city", "City")}</p>
              <p className="text-sm text-text-primary">{recipient.city}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase text-text-secondary">
                {t("recipients.form.hospitalAddress", "Hospital Address")}
              </p>
              <p className="text-sm text-text-primary">{recipient.hospital_address || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.latitude", "Latitude")}</p>
              <p className="text-sm text-text-primary">{recipient.latitude || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.longitude", "Longitude")}</p>
              <p className="text-sm text-text-primary">{recipient.longitude || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.createdAt", "Created At")}</p>
              <p className="text-sm text-text-primary">{formatLocalDateTime(recipient.created_at)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("recipients.form.updatedAt", "Updated At")}</p>
              <p className="text-sm text-text-primary">{formatLocalDateTime(recipient.updated_at)}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => navigate("/recipients")} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              {t("recipients.actions.backToList", "Back to list")}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/recipients/${recipient.id}/edit`)}
              leftIcon={<Pencil className="h-4 w-4" />}
            >
              {t("recipients.actions.edit", "Edit")}
            </Button>
            <Button
              variant={recipient.status === "blocked" ? "primary" : "danger"}
              onClick={() => setIsStatusDialogOpen(true)}
              leftIcon={recipient.status === "blocked" ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
            >
              {recipient.status === "blocked"
                ? t("recipients.actions.unblock", "Unblock")
                : t("recipients.actions.block", "Block")}
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)} leftIcon={<Trash2 className="h-4 w-4" />}>
              {t("recipients.actions.delete", "Delete")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteRecipientDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      <BlockUnblockRecipientDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleToggleStatus}
        isBlocked={recipient.status === "blocked"}
        loading={blockMutation.isPending || unblockMutation.isPending}
      />
    </div>
  );
}
