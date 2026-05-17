import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { getDonationsRouteByRole } from "@/modules/auth/utils/roleRouting";
import { Card, CardContent } from "@components/ui";
import DonationFilters from "../components/DonationFilters";
import DonationTable from "../components/DonationTable";
import { useDonationFilters } from "../hooks/useDonationFilters";
import { useDonationsList } from "../queries/useDonationQueries";

export default function DonationListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { can } = useCan();
  const userRole = useUserStore((state) => state.userProfile?.role);
  const donationBasePath =
    userRole === "donor" && location.pathname.includes("/donor/donation-history")
      ? getDonationsRouteByRole(userRole, { history: true })
      : getDonationsRouteByRole(userRole);
  const {
    search,
    status,
    ordering,
    page,
    pageSize,
    setSearch,
    setStatus,
    setOrdering,
    setPage,
    resetFilters,
    queryParams,
  } = useDonationFilters();

  const { data, isLoading, error } = useDonationsList(queryParams);
  const donations = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  if (!can("donations")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("donations.errors.noPermission", "You do not have permission to access donations.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donations.title", "Donations")}
        subtitle={t("donations.subtitle", "Track donor assignment and response lifecycle")}
      />

      <Card>
        <CardContent>
          <DonationFilters
            search={search}
            status={status}
            ordering={ordering}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onOrderingChange={setOrdering}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="text-sm text-error">
            {t("donations.errors.loadFailed", "Failed to load donations")}
          </CardContent>
        </Card>
      ) : (
        <DonationTable
          donations={donations}
          isLoading={isLoading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onView={(id) => navigate(`${donationBasePath}/${id}`)}
        />
      )}
    </div>
  );
}
