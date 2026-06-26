import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@components/ui";
import { useSessionStore } from "@/modules/auth/stores/useSessionStore";
import { useSettingsDirtyGuard } from "../hooks/useSettingsDirtyGuard";
import {
  useAutoMatchingSettings,
  useGeneralSettings,
  useLocalizationSettings,
  useNotificationSettings,
  useSecuritySettings,
  useTestNotificationEmail,
  useTestNotificationSms,
  useUpdateAutoMatchingSettings,
  useUpdateGeneralSettings,
  useUpdateLocalizationSettings,
  useUpdateNotificationSettings,
  useUpdateSecuritySettings,
} from "../queries/useSettingsQueries";
import {
  autoMatchingSettingsSchema,
  type AutoMatchingSettingsFormValues,
} from "../schemas/autoMatchingSettings.schema";
import {
  generalSettingsSchema,
  type GeneralSettingsFormValues,
} from "../schemas/generalSettings.schema";
import {
  localizationSettingsSchema,
  type LocalizationSettingsFormValues,
} from "../schemas/localizationSettings.schema";
import {
  notificationSettingsSchema,
  type NotificationSettingsFormValues,
} from "../schemas/notificationSettings.schema";
import {
  securitySettingsSchema,
  type SecuritySettingsFormValues,
} from "../schemas/securitySettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";
import type { SystemSettingsSection } from "../types/settings.types";
import AutoMatchingSettingsForm from "./AutoMatchingSettingsForm";
import BackupRestoreSettingsPanel from "./BackupRestoreSettingsPanel";
import GeneralSettingsForm from "./GeneralSettingsForm";
import LocalizationSettingsForm from "./LocalizationSettingsForm";
import NotificationSettingsForm from "./NotificationSettingsForm";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SecuritySettingsForm from "./SecuritySettingsForm";

interface SystemSettingsWorkspaceProps {
  section: SystemSettingsSection;
  onSectionChange: (section: SystemSettingsSection) => void;
  canEdit: boolean;
}

const sectionItems: Array<{ key: SystemSettingsSection; label: string }> = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "auto_matching", label: "Auto Matching" },
  { key: "localization", label: "Localization" },
  { key: "security", label: "Security" },
  { key: "backup_restore", label: "Backup & Restore" },
];

const generalDefaults: GeneralSettingsFormValues = {
  maintenance_mode: false,
};

const notificationDefaults: NotificationSettingsFormValues = {
  email_enabled: true,
  smtp_host: "",
  smtp_port: 587,
  smtp_username: "",
  smtp_password: "",
  from_email: "",
  sms_enabled: false,
  sms_account_sid: "",
  sms_auth_token: "",
  sms_from_number: "",
  in_app_enabled: true,
  notification_retention_days: 30,
};

const autoMatchingDefaults: AutoMatchingSettingsFormValues = {
  enabled: true,
  max_distance_km: 10,
  prioritize_rare_blood_groups: true,
  prioritize_recently_active_donors: true,
  max_candidates_to_notify: 50,
  retry_interval_minutes: 10,
};

const localizationDefaults: LocalizationSettingsFormValues = {
  default_timezone: "UTC",
  date_format: "yyyy-MM-dd",
  time_format_24h: true,
  first_day_of_week: "monday",
};

const securityDefaults: SecuritySettingsFormValues = {
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_number: true,
  password_require_special_char: false,
  max_login_attempts: 5,
  lockout_minutes: 30,
  session_timeout_minutes: 30,
  force_logout_on_password_change: true,
};

function GeneralSection({ canEdit }: { canEdit: boolean }) {
  const markSaved = useSettingsUiStore((state) => state.markSaved);
  const query = useGeneralSettings();
  const mutation = useUpdateGeneralSettings();
  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: generalDefaults,
  });

  useSettingsDirtyGuard("general", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset({
        maintenance_mode: query.data.maintenance_mode,
      });
    }
  }, [form, query.data]);

  const onSubmit = async (values: GeneralSettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset(updated);
    markSaved("general");
  };

  if (query.isLoading && !query.data) {
    return (
      <Card>
        <CardContent>Loading general settings...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {!canEdit ? <ReadOnlyBanner /> : null}
        <GeneralSettingsForm
          form={form}
          onSubmit={onSubmit}
          loading={mutation.isPending}
          readOnly={!canEdit}
        />
      </CardContent>
    </Card>
  );
}

function NotificationSection({ canEdit }: { canEdit: boolean }) {
  const markSaved = useSettingsUiStore((state) => state.markSaved);
  const query = useNotificationSettings();
  const mutation = useUpdateNotificationSettings();
  const testEmailMutation = useTestNotificationEmail();
  const testSmsMutation = useTestNotificationSms();
  const form = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: notificationDefaults,
  });

  useSettingsDirtyGuard("notifications", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset({
        ...query.data,
        smtp_password: "",
        sms_account_sid: "",
        sms_auth_token: "",
      });
    }
  }, [form, query.data]);

  const onSubmit = async (values: NotificationSettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset({
      ...values,
      ...updated,
      smtp_password: "",
      sms_account_sid: "",
      sms_auth_token: "",
    });
    markSaved("notifications");
  };

  if (query.isLoading && !query.data) {
    return (
      <Card>
        <CardContent>Loading notification settings...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {!canEdit ? <ReadOnlyBanner /> : null}
        <NotificationSettingsForm
          form={form}
          onSubmit={onSubmit}
          loading={mutation.isPending}
          readOnly={!canEdit}
          smtpPasswordHint={query.data?.smtp_password_masked}
          smsSidHint={query.data?.sms_account_sid_masked}
          smsTokenHint={query.data?.sms_auth_token_masked}
          onTestEmail={() => testEmailMutation.mutate({})}
          onTestSms={() => testSmsMutation.mutate({})}
          testingEmail={testEmailMutation.isPending}
          testingSms={testSmsMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}

function AutoMatchingSection({ canEdit }: { canEdit: boolean }) {
  const markSaved = useSettingsUiStore((state) => state.markSaved);
  const query = useAutoMatchingSettings();
  const mutation = useUpdateAutoMatchingSettings();
  const form = useForm<AutoMatchingSettingsFormValues>({
    resolver: zodResolver(autoMatchingSettingsSchema),
    defaultValues: autoMatchingDefaults,
  });

  useSettingsDirtyGuard("auto_matching", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset(query.data);
    }
  }, [form, query.data]);

  const onSubmit = async (values: AutoMatchingSettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset(updated);
    markSaved("auto_matching");
  };

  if (query.isLoading && !query.data) {
    return (
      <Card>
        <CardContent>Loading auto matching settings...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {!canEdit ? <ReadOnlyBanner /> : null}
        <AutoMatchingSettingsForm
          form={form}
          onSubmit={onSubmit}
          loading={mutation.isPending}
          readOnly={!canEdit}
          onCancel={() => form.reset(query.data ?? autoMatchingDefaults)}
        />
      </CardContent>
    </Card>
  );
}

function LocalizationSection({ canEdit }: { canEdit: boolean }) {
  const markSaved = useSettingsUiStore((state) => state.markSaved);
  const query = useLocalizationSettings();
  const mutation = useUpdateLocalizationSettings();
  const form = useForm<LocalizationSettingsFormValues>({
    resolver: zodResolver(localizationSettingsSchema),
    defaultValues: localizationDefaults,
  });

  useSettingsDirtyGuard("localization", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset(query.data);
    }
  }, [form, query.data]);

  const onSubmit = async (values: LocalizationSettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset(updated);
    markSaved("localization");
  };

  if (query.isLoading && !query.data) {
    return (
      <Card>
        <CardContent>Loading localization settings...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {!canEdit ? <ReadOnlyBanner /> : null}
        <LocalizationSettingsForm
          form={form}
          onSubmit={onSubmit}
          loading={mutation.isPending}
          readOnly={!canEdit}
        />
      </CardContent>
    </Card>
  );
}

function SecuritySection({ canEdit }: { canEdit: boolean }) {
  const markSaved = useSettingsUiStore((state) => state.markSaved);
  const setSessionTimeoutMinutes = useSessionStore((state) => state.setSessionTimeoutMinutes);
  const query = useSecuritySettings();
  const mutation = useUpdateSecuritySettings();
  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: securityDefaults,
  });

  useSettingsDirtyGuard("security", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset(query.data);
    }
  }, [form, query.data]);

  const onSubmit = async (values: SecuritySettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset(updated);
    setSessionTimeoutMinutes(updated.session_timeout_minutes);
    markSaved("security");
  };

  if (query.isLoading && !query.data) {
    return (
      <Card>
        <CardContent>Loading security settings...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {!canEdit ? <ReadOnlyBanner /> : null}
        <SecuritySettingsForm
          form={form}
          onSubmit={onSubmit}
          loading={mutation.isPending}
          readOnly={!canEdit}
        />
      </CardContent>
    </Card>
  );
}

export default function SystemSettingsWorkspace({
  section,
  onSectionChange,
  canEdit,
}: SystemSettingsWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-lg border border-border bg-card p-2">
          {sectionItems.map((item) => {
            const isActive = section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {section === "general" ? <GeneralSection canEdit={canEdit} /> : null}
      {section === "notifications" ? <NotificationSection canEdit={canEdit} /> : null}
      {section === "auto_matching" ? <AutoMatchingSection canEdit={canEdit} /> : null}
      {section === "localization" ? <LocalizationSection canEdit={canEdit} /> : null}
      {section === "security" ? <SecuritySection canEdit={canEdit} /> : null}
      {section === "backup_restore" ? <BackupRestoreSettingsPanel canEdit={canEdit} /> : null}
    </div>
  );
}
