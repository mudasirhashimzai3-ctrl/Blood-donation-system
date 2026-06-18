import { z } from "zod";

const retentionCount = z.coerce.number().int().min(1);

export const backupRestoreSettingsSchema = z.object({
  daily_enabled: z.boolean(),
  weekly_enabled: z.boolean(),
  monthly_enabled: z.boolean(),
  daily_retention_count: retentionCount.max(365),
  weekly_retention_count: retentionCount.max(104),
  monthly_retention_count: retentionCount.max(120),
});

export type BackupRestoreSettingsFormValues = z.infer<typeof backupRestoreSettingsSchema>;
