import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import { useAdminSettingsRouting } from "../hooks/useAdminSettingsRouting";
import { useRoleMatrixDraft } from "../hooks/useRoleMatrixDraft";
import {
  useChangeMyPassword,
  useRolePermissionMatrix,
  useUpdateRolePermissionMatrix,
  useUpdateUserRoleSettings,
  useUserRoleSettings,
} from "../queries/useSettingsQueries";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/changePassword.schema";
import {
  userRolePolicySchema,
  type UserRolePolicyFormValues,
} from "../schemas/userRolePolicy.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";
import AdminSettingsTabs from "../components/AdminSettingsTabs";
import ChangePasswordForm from "../components/ChangePasswordForm";
import ManageRolesPolicyForm from "../components/ManageRolesPolicyForm";
import ReadOnlyBanner from "../components/ReadOnlyBanner";
import RolePermissionMatrix from "../components/RolePermissionMatrix";
import SystemSettingsWorkspace from "../components/SystemSettingsWorkspace";
import { useSettingsDirtyGuard } from "../hooks/useSettingsDirtyGuard";

const policyDefaults: UserRolePolicyFormValues = {
  allow_user_invite: true,
  default_new_user_role: "viewer",
  allow_role_editing: false,
  allow_self_profile_edit: true,
  enforce_2fa_for_admin: false,
};

const changePasswordDefaults: ChangePasswordFormValues = {
  old_password: "",
  new_password: "",
  confirm_password: "",
};

export default function AdminSettingsPage() {
  const { canViewSettings, canEdit } = useSettingsSectionAccess();
  const { tab, section, setTab, setSection } = useAdminSettingsRouting();
  const setTopTabDirty = useSettingsUiStore((state) => state.setTopTabDirty);
  const markSaved = useSettingsUiStore((state) => state.markSaved);

  const policyQuery = useUserRoleSettings();
  const policyMutation = useUpdateUserRoleSettings();
  const roleMatrixQuery = useRolePermissionMatrix();
  const roleMatrixMutation = useUpdateRolePermissionMatrix();
  const changePasswordMutation = useChangeMyPassword();

  const initialMatrixRows = useMemo(
    () => roleMatrixQuery.data?.matrix ?? [],
    [roleMatrixQuery.data]
  );

  const policyForm = useForm<UserRolePolicyFormValues>({
    resolver: zodResolver(userRolePolicySchema),
    defaultValues: policyDefaults,
  });
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: changePasswordDefaults,
  });

  const {
    draftRows,
    hasChanges: hasMatrixChanges,
    toggleAction,
    reset: resetMatrix,
  } = useRoleMatrixDraft(initialMatrixRows);

  useSettingsDirtyGuard(
    "user_roles",
    policyForm.formState.isDirty || hasMatrixChanges
  );

  useEffect(() => {
    if (policyQuery.data) {
      policyForm.reset(policyQuery.data);
    }
  }, [policyForm, policyQuery.data]);

  useEffect(() => {
    setTopTabDirty("manage_roles", policyForm.formState.isDirty || hasMatrixChanges);
  }, [hasMatrixChanges, policyForm.formState.isDirty, setTopTabDirty]);

  useEffect(() => {
    setTopTabDirty("change_password", passwordForm.formState.isDirty);
  }, [passwordForm.formState.isDirty, setTopTabDirty]);

  const onSubmitPolicy = async (values: UserRolePolicyFormValues) => {
    if (!canEdit) return;
    const updated = await policyMutation.mutateAsync(values);
    policyForm.reset(updated);
    markSaved("user_roles");
  };

  const onSaveMatrix = async () => {
    if (!canEdit) return;
    await roleMatrixMutation.mutateAsync({ matrix: draftRows });
    await roleMatrixQuery.refetch();
    markSaved("user_roles");
  };

  const onSubmitChangePassword = async (values: ChangePasswordFormValues) => {
    await changePasswordMutation.mutateAsync(values);
    passwordForm.reset(changePasswordDefaults);
    setTopTabDirty("change_password", false);
  };

  if (!canViewSettings) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          You do not have permission to access settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        subtitle="Manage system settings, role policies, and account security"
      />

      <AdminSettingsTabs activeTab={tab} onChange={setTab} />

      {tab === "system_settings" ? (
        <SystemSettingsWorkspace
          section={section}
          onSectionChange={setSection}
          canEdit={canEdit}
        />
      ) : null}

      {tab === "manage_roles" ? (
        <div className="space-y-6">
          {!canEdit ? <ReadOnlyBanner /> : null}

          <Card>
            <CardContent>
              {policyQuery.isLoading && !policyQuery.data ? (
                <p>Loading role policy settings...</p>
              ) : (
                <ManageRolesPolicyForm
                  form={policyForm}
                  onSubmit={onSubmitPolicy}
                  loading={policyMutation.isPending}
                  readOnly={!canEdit}
                  onCancel={() => policyForm.reset(policyQuery.data ?? policyDefaults)}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              {roleMatrixQuery.isLoading && !roleMatrixQuery.data ? (
                <p>Loading role permission matrix...</p>
              ) : roleMatrixQuery.data ? (
                <RolePermissionMatrix
                  roles={roleMatrixQuery.data.roles}
                  modules={roleMatrixQuery.data.modules}
                  actions={roleMatrixQuery.data.actions}
                  rows={draftRows}
                  onToggleAction={toggleAction}
                  onSave={onSaveMatrix}
                  onReset={resetMatrix}
                  loading={roleMatrixMutation.isPending}
                  readOnly={!canEdit}
                  hasChanges={hasMatrixChanges}
                />
              ) : (
                <p>Failed to load role permission matrix.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "change_password" ? (
        <Card>
          <CardContent>
            <ChangePasswordForm
              form={passwordForm}
              onSubmit={onSubmitChangePassword}
              loading={changePasswordMutation.isPending}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
