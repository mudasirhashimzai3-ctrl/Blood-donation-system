import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import RecipientForm from "../components/RecipientForm";
import { mapRecipientToFormValues, normalizeRecipientPayload, useRecipientForm } from "../hooks/useRecipientForm";
import type { RecipientFormValues } from "../schemas/recipientSchemas";
import { useRecipient, useUpdateRecipient } from "../queries/useRecipientQueries";

export default function RecipientEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const recipientId = Number(id);
  const form = useRecipientForm();

  const { data: recipient, isLoading, error } = useRecipient(recipientId, { enabled: Number.isFinite(recipientId) });
  const updateMutation = useUpdateRecipient(recipientId);

  useEffect(() => {
    if (recipient) {
      form.reset(mapRecipientToFormValues(recipient));
    }
  }, [recipient, form]);

  const onSubmit = async (values: RecipientFormValues) => {
    await updateMutation.mutateAsync(normalizeRecipientPayload(values));
    navigate(`/recipients/${recipientId}`);
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
        title={t("recipients.edit.title", "Edit Recipient")}
        subtitle={t("recipients.edit.subtitle", "Update recipient information")}
      />

      <Card>
        <CardContent>
          <RecipientForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => navigate(`/recipients/${recipientId}`)}
            submitLabel={t("recipients.actions.update", "Update Recipient")}
            loading={updateMutation.isPending}
            createdAt={recipient.created_at}
            updatedAt={recipient.updated_at}
          />
        </CardContent>
      </Card>
    </div>
  );
}

