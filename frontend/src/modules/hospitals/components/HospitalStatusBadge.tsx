import { useTranslation } from "react-i18next";

import { Badge } from "@components/ui";

interface HospitalStatusBadgeProps {
  isActive: boolean;
}

export default function HospitalStatusBadge({ isActive }: HospitalStatusBadgeProps) {
  const { t } = useTranslation();

  if (isActive) {
    return (
      <Badge variant="success" dot>
        {t("hospitals.status.active", "Active")}
      </Badge>
    );
  }

  return (
    <Badge variant="warning" dot>
      {t("hospitals.status.inactive", "Inactive")}
    </Badge>
  );
}

