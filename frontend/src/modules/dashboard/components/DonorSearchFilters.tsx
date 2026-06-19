import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BLOOD_GROUP_OPTIONS, type BloodGroup } from "@/modules/blood-requests/types/bloodRequest.types";
import { Button, Select } from "@components/ui";
import {
  DONOR_SEARCH_RADIUS_OPTIONS,
  type DashboardBloodRequestOption,
  type DonorSearchRadius,
} from "../types/dashboard.types";

interface DonorSearchFiltersProps {
  requests: DashboardBloodRequestOption[];
  bloodRequestId: number | null;
  bloodGroup: BloodGroup | "";
  radiusKm: DonorSearchRadius;
  showBloodRequestFilter?: boolean;
  onBloodRequestChange: (id: number | null) => void;
  onBloodGroupChange: (bloodGroup: BloodGroup | "") => void;
  onRadiusChange: (radius: DonorSearchRadius) => void;
  onReset: () => void;
}

export default function DonorSearchFilters({
  requests,
  bloodRequestId,
  bloodGroup,
  radiusKm,
  showBloodRequestFilter = true,
  onBloodRequestChange,
  onBloodGroupChange,
  onRadiusChange,
  onReset,
}: DonorSearchFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className={showBloodRequestFilter ? "grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_auto]" : "grid gap-4 lg:grid-cols-[1fr_1fr_auto]"}>
      {showBloodRequestFilter ? (
        <Select
          label={t("dashboard.donorSearch.filters.bloodRequest", "Blood Request")}
          value={bloodRequestId ? String(bloodRequestId) : ""}
          onChange={(event) => onBloodRequestChange(event.target.value ? Number(event.target.value) : null)}
          options={requests.map((request) => ({
            value: String(request.id),
            label: t("dashboard.donorSearch.filters.requestOption", {
              defaultValue: "Number : {{id}} - {{hospital}} - {{bloodGroup}}",
              id: request.id,
              hospital: request.hospital_name,
              bloodGroup: request.blood_group,
            }),
          }))}
          placeholder={t("dashboard.donorSearch.filters.selectActiveRequest", "Select active request")}
          leftIcon={<Search className="h-4 w-4" />}
        />
      ) : null}

      <Select
        label={t("dashboard.donorSearch.filters.bloodGroup", "Blood Group")}
        value={bloodGroup}
        onChange={(event) => onBloodGroupChange(event.target.value as BloodGroup | "")}
        options={BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group }))}
      />

      <Select
        label={t("dashboard.donorSearch.filters.distanceRange", "Distance Range")}
        value={String(radiusKm)}
        onChange={(event) => onRadiusChange(Number(event.target.value) as DonorSearchRadius)}
        options={DONOR_SEARCH_RADIUS_OPTIONS.map((distance) => ({
          value: String(distance),
          label: t("dashboard.donorSearch.filters.distanceKm", {
            defaultValue: "{{distance}} KM",
            distance,
          }),
        }))}
      />

      <div className="flex items-end">
        <Button type="button" variant="outline" onClick={onReset} className="w-full">
          {t("common.reset", "Reset")}
        </Button>
      </div>
    </div>
  );
}
