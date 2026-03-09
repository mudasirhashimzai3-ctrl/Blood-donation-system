import useCan from "@/hooks/useCan";

import { useSettingsOverview } from "../queries/useSettingsQueries";

export const useSettingsSectionAccess = () => {
  const { can } = useCan();
  const overviewQuery = useSettingsOverview();

  const canViewSettings = can("settings");
  const canEdit = overviewQuery.data?.permissions.canEdit ?? false;

  return {
    canViewSettings,
    canEdit,
    overview: overviewQuery.data,
    isLoading: overviewQuery.isLoading,
    isError: overviewQuery.isError,
  };
};
