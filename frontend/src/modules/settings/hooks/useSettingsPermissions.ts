import useCan from "@/hooks/useCan";

export const useSettingsPermissions = () => {
  const { can } = useCan();

  return {
    canViewSettings: can("settings"),
    canManageUsers: can("users"),
    canChangeSecurity: can("settings"),
  };
};
