import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Badge, Button, Card, CardContent, CardHeader, Input, Modal, ModalFooter, Switch } from "@components/ui";
import { useDownloadManagementReportPdf } from "@/modules/reports";
import {
  useBackupRestoreOverview,
  useCreateManualBackup,
  useDownloadBackup,
  useRestoreBackup,
  useUpdateBackupRestoreSettings,
} from "../queries/useSettingsQueries";
import {
  backupRestoreSettingsSchema,
  type BackupRestoreSettingsFormValues,
} from "../schemas/backupRestoreSettings.schema";
import { useSettingsDirtyGuard } from "../hooks/useSettingsDirtyGuard";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";
import type { BackupRecord, BackupStatus, BackupType } from "../types/settings.types";
import ReadOnlyBanner from "./ReadOnlyBanner";

const defaults: BackupRestoreSettingsFormValues = {
  daily_enabled: true,
  weekly_enabled: true,
  monthly_enabled: true,
  daily_retention_count: 30,
  weekly_retention_count: 12,
  monthly_retention_count: 12,
};

const statusVariant: Record<BackupStatus, "success" | "warning" | "error" | "info" | "default"> = {
  pending: "warning",
  running: "info",
  completed: "success",
  failed: "error",
  restored: "info",
};

const typeLabels: Record<BackupType, string> = {
  manual: "Manual",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  pre_restore: "Pre-restore",
};

function formatDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function backupFilename(record: BackupRecord) {
  return `${record.backup_type}-backup-${record.id}.zip`;
}

export default function BackupRestoreSettingsPanel({ canEdit }: { canEdit: boolean }) {
  const [restoreTarget, setRestoreTarget] = useState<BackupRecord | null>(null);
  const markSaved = useSettingsUiStore((state) => state.markSaved);
  const overviewQuery = useBackupRestoreOverview();
  const updateMutation = useUpdateBackupRestoreSettings();
  const manualBackupMutation = useCreateManualBackup();
  const restoreMutation = useRestoreBackup();
  const downloadMutation = useDownloadBackup();
  const reportDownloadMutation = useDownloadManagementReportPdf();

  const form = useForm<BackupRestoreSettingsFormValues>({
    resolver: zodResolver(backupRestoreSettingsSchema),
    defaultValues: defaults,
  });
  const watchedSchedule = useWatch({ control: form.control });

  useSettingsDirtyGuard("backup_restore", form.formState.isDirty);

  useEffect(() => {
    if (overviewQuery.data?.settings) {
      form.reset(overviewQuery.data.settings);
    }
  }, [form, overviewQuery.data?.settings]);

  const history = overviewQuery.data?.history ?? [];
  const lastBackup = overviewQuery.data?.last_backup ?? null;

  const enabledSchedules = useMemo(() => {
    return [
      watchedSchedule.daily_enabled ? "Daily" : null,
      watchedSchedule.weekly_enabled ? "Weekly" : null,
      watchedSchedule.monthly_enabled ? "Monthly" : null,
    ].filter(Boolean);
  }, [watchedSchedule]);

  const onSubmit = async (values: BackupRestoreSettingsFormValues) => {
    if (!canEdit) return;
    const updated = await updateMutation.mutateAsync(values);
    form.reset(updated);
    markSaved("backup_restore");
  };

  const onConfirmRestore = async () => {
    if (!restoreTarget) return;
    await restoreMutation.mutateAsync(restoreTarget.id);
    setRestoreTarget(null);
  };

  if (overviewQuery.isLoading && !overviewQuery.data) {
    return (
      <Card>
        <CardContent>Loading backup settings...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!canEdit ? <ReadOnlyBanner /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader
            title="Last Backup Status"
            subtitle="Current recovery point for system data and media"
            action={<ShieldCheck className="h-5 w-5 text-success" />}
          />
          <CardContent className="space-y-4">
            {lastBackup ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[lastBackup.status]} dot>
                    {lastBackup.status}
                  </Badge>
                  <span className="text-sm font-medium text-text-primary">
                    {typeLabels[lastBackup.backup_type]}
                  </span>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-text-secondary">Finished</dt>
                    <dd className="font-medium text-text-primary">{formatDate(lastBackup.finished_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Size</dt>
                    <dd className="font-medium text-text-primary">{formatSize(lastBackup.file_size)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-text-secondary">Checksum</dt>
                    <dd className="break-all font-mono text-xs text-text-primary">
                      {lastBackup.checksum || "Not available"}
                    </dd>
                  </div>
                </dl>
                {lastBackup.error_message ? (
                  <p className="text-sm text-error">{lastBackup.error_message}</p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-text-secondary">No backup has been created yet.</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => manualBackupMutation.mutate()}
                loading={manualBackupMutation.isPending}
                disabled={!canEdit}
              >
                Manual Backup
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reportDownloadMutation.mutate()}
                loading={reportDownloadMutation.isPending}
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Automatic Backups"
            subtitle={`Enabled schedules: ${enabledSchedules.length ? enabledSchedules.join(", ") : "None"}`}
          />
          <CardContent>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-3">
                <Switch
                  label="Daily"
                  description="Run every day"
                  disabled={!canEdit}
                  {...form.register("daily_enabled")}
                />
                <Switch
                  label="Weekly"
                  description="Run every week"
                  disabled={!canEdit}
                  {...form.register("weekly_enabled")}
                />
                <Switch
                  label="Monthly"
                  description="Run every month"
                  disabled={!canEdit}
                  {...form.register("monthly_enabled")}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  type="number"
                  min={1}
                  label="Daily retention"
                  disabled={!canEdit}
                  error={form.formState.errors.daily_retention_count?.message}
                  {...form.register("daily_retention_count")}
                />
                <Input
                  type="number"
                  min={1}
                  label="Weekly retention"
                  disabled={!canEdit}
                  error={form.formState.errors.weekly_retention_count?.message}
                  {...form.register("weekly_retention_count")}
                />
                <Input
                  type="number"
                  min={1}
                  label="Monthly retention"
                  disabled={!canEdit}
                  error={form.formState.errors.monthly_retention_count?.message}
                  {...form.register("monthly_retention_count")}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={updateMutation.isPending}
                  disabled={!canEdit || !form.formState.isDirty}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Schedule
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Backup History" subtitle="Download or restore completed system backups" />
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="blood-table">
              <thead className="table-header">
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Size</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? (
                  history.map((record) => {
                    const canUseFile = record.status === "completed" || record.status === "restored";
                    return (
                      <tr key={record.id} className="table-row">
                        <td className="table-cell">{typeLabels[record.backup_type]}</td>
                        <td className="table-cell">
                          <Badge variant={statusVariant[record.status]} dot>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="table-cell">{formatDate(record.created_at)}</td>
                        <td className="table-cell">{formatSize(record.file_size)}</td>
                        <td className="table-cell">{record.created_by_username ?? "System"}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canUseFile}
                              onClick={() =>
                                downloadMutation.mutate({
                                  id: record.id,
                                  filename: backupFilename(record),
                                })
                              }
                              leftIcon={<Download className="h-4 w-4" />}
                            >
                              Download
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!canEdit || !canUseFile}
                              onClick={() => setRestoreTarget(record)}
                              leftIcon={<RotateCcw className="h-4 w-4" />}
                            >
                              Restore
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="table-row">
                    <td className="table-cell py-10 text-center text-text-secondary" colSpan={6}>
                      No backup history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={Boolean(restoreTarget)}
        onClose={() => setRestoreTarget(null)}
        title="Restore Backup"
        description="A pre-restore snapshot will be created before this backup is restored."
        footer={
          <ModalFooter
            onCancel={() => setRestoreTarget(null)}
            onConfirm={onConfirmRestore}
            confirmText="Restore"
            confirmVariant="danger"
            loading={restoreMutation.isPending}
          />
        }
      >
        <p className="text-sm text-text-secondary">
          Restore {restoreTarget ? typeLabels[restoreTarget.backup_type] : "selected"} backup from{" "}
          {restoreTarget ? formatDate(restoreTarget.created_at) : ""}? This will replace system data and media
          with the selected backup contents.
        </p>
      </Modal>
    </div>
  );
}
