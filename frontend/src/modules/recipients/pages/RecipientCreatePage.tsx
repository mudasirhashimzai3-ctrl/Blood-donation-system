import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import RecipientForm from "../components/RecipientForm";
import { normalizeRecipientPayload, useRecipientForm } from "../hooks/useRecipientForm";
import type { RecipientFormValues } from "../schemas/recipientSchemas";
import { useCreateRecipient } from "../queries/useRecipientQueries";

export default function RecipientCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const form = useRecipientForm();
  const createMutation = useCreateRecipient();

  const onSubmit = async (values: RecipientFormValues) => {
    await createMutation.mutateAsync(normalizeRecipientPayload(values));
    navigate("/recipients");
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
        title={t("recipients.create.title", "Create Recipient")}
        subtitle={t("recipients.create.subtitle", "Add a new recipient record")}
      />

      <Card>
        <CardContent>
          <RecipientForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => navigate("/recipients")}
            submitLabel={t("recipients.actions.save", "Save Recipient")}
            loading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

