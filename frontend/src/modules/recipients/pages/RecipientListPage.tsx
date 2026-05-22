import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import RecipientFilters from "../components/RecipientFilters";
import RecipientTable from "../components/RecipientTable";
import { useRecipientFilters } from "../hooks/useRecipientFilters";
import { useRecipientsList } from "../queries/useRecipientQueries";

export default function RecipientListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();

  const {
    bloodGroup,
    emergencyLevel,
    city,
    page,
    pageSize,
    setBloodGroup,
    setEmergencyLevel,
    setCity,
    setPage,
    resetFilters,
    queryParams,
  } = useRecipientFilters();

  const { data, isLoading, error } = useRecipientsList(queryParams);

  const recipients = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  if (!can("recipients")) {
    return (
      <div className="recipient-theme" data-testid="recipient-page-root">
        <Card>
          <CardContent className="text-sm text-error">
            {t("recipients.errors.noPermission", "You do not have permission to access recipients.")}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="recipient-theme space-y-6" data-testid="recipient-page-root">
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
            bloodGroup={bloodGroup}
            emergencyLevel={emergencyLevel}
            city={city}
            onBloodGroupChange={setBloodGroup}
            onEmergencyLevelChange={setEmergencyLevel}
            onCityChange={setCity}
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
        />
      )}
    </div>
  );
}
