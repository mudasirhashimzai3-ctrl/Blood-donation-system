import type { UseFormReturn } from "react-hook-form";

import { Button, Input } from "@components/ui";
import type { ChangePasswordFormValues } from "../schemas/changePassword.schema";

interface ChangePasswordFormProps {
  form: UseFormReturn<ChangePasswordFormValues>;
  onSubmit: (values: ChangePasswordFormValues) => void | Promise<void>;
  loading?: boolean;
  readOnly?: boolean;
}

export default function ChangePasswordForm({
  form,
  onSubmit,
  loading = false,
  readOnly = false,
}: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Current Password"
        type="password"
        autoComplete="current-password"
        disabled={readOnly}
        error={errors.old_password?.message}
        {...register("old_password")}
      />
      <Input
        label="New Password"
        type="password"
        autoComplete="new-password"
        disabled={readOnly}
        error={errors.new_password?.message}
        {...register("new_password")}
      />
      <Input
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        disabled={readOnly}
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />

      {readOnly ? null : (
        <div className="flex justify-end border-t border-border pt-4">
          <Button type="submit" loading={loading} disabled={!isDirty}>
            Update Password
          </Button>
        </div>
      )}
    </form>
  );
}
