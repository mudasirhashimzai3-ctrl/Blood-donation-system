import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import { settingsService } from "../services/settingsService";
import { settingsKeys } from "./settingsKeys";
import type { SettingsSection } from "../types/settings.types";

export const useSettingsAuditLogs = (section?: SettingsSection) =>
  useQuery({
    queryKey: settingsKeys.auditLogs(section),
    queryFn: () => settingsService.getAuditLogs(section).then((res) => res.data),
  });

export const useResetSettingsSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (section: SettingsSection) => settingsService.resetSection(section).then((res) => res.data),
    onSuccess: (_data, section) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.section(section) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.auditLogs(section) });
      toast.success("Section reset to defaults");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to reset section"));
    },
  });
};
