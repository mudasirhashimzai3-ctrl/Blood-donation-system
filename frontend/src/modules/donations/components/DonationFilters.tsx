import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import { DONATION_STATUS_OPTIONS, type DonationStatus } from "../types/donation.types";

interface DonationFiltersProps {
  search: string;
  status: DonationStatus | "";
  ordering: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: DonationStatus | "") => void;
  onOrderingChange: (value: string) => void;
  onReset: () => void;
}

export default function DonationFilters({
  search,
  status,
  ordering,
  onSearchChange,
  onStatusChange,
  onOrderingChange,
  onReset,
}: DonationFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t("donations.filters.searchPlaceholder", "Search by donor, recipient, hospital")}
      />
      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as DonationStatus | "")}
        options={[
          { value: "", label: t("donations.filters.allStatuses", "All Statuses") },
          ...DONATION_STATUS_OPTIONS.map((value) => ({
            value,
            label: t(`donations.status.${value}`, value),
          })),
        ]}
      />
      <Select
        value={ordering}
        onChange={(event) => onOrderingChange(event.target.value)}
        options={[
          { value: "-created_at", label: t("donations.filters.orderNewest", "Newest") },
          { value: "created_at", label: t("donations.filters.orderOldest", "Oldest") },
          { value: "distance_km", label: t("donations.filters.orderDistance", "Nearest Distance") },
          { value: "estimated_arrival_time", label: t("donations.filters.orderEta", "Lowest ETA") },
          { value: "-priority_score", label: t("donations.filters.orderPriority", "Highest Priority Score") },
        ]}
      />
      <Button variant="outline" onClick={onReset}>
        {t("donations.filters.reset", "Reset")}
      </Button>
    </div>
  );
}
