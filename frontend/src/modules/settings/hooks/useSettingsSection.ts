import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import type { SettingsSection } from "../types/settings.types";
import { settingsKeys } from "../queries/settingsKeys";

export const useSettingsSectionQuery = <TData>(
  section: SettingsSection,
  queryFn: () => Promise<TData>
) =>
  useQuery<TData>({
    queryKey: settingsKeys.section(section),
    queryFn,
  });

export const useSettingsSectionMutation = <TData, TPayload>(
  section: SettingsSection,
  mutationFn: (payload: TPayload) => Promise<TData>,
  successMessage = "Settings saved successfully"
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.section(section), data);
      queryClient.invalidateQueries({ queryKey: settingsKeys.section(section) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.auditLogs(section) });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save settings"));
    },
  });
};
