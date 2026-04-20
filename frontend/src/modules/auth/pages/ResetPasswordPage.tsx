import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/modules/auth/schemas/authSchemas";
import { useResetPassword } from "@/modules/auth/api/useAuthMutations";
import { PasswordStrengthMeter } from "..";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AuthShell from "../components/AuthShell";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const { emailOrUsername, code } =
    (location.state as {
      emailOrUsername?: string;
      code?: string;
    }) || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("newPassword");

  useEffect(() => {
    if (!emailOrUsername || !code) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [emailOrUsername, code, navigate]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!emailOrUsername || !code) return;

    try {
      await resetPasswordMutation.mutateAsync({
        email_or_username: emailOrUsername,
        code,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      setSuccess(true);
    } catch {
      // mutation handles error toast
    }
  };

  if (success) {
    return (
      <AuthShell
        title={t("auth.passwordResetSuccess", "Password Reset Successfully")}
        subtitle={t(
          "auth.passwordResetSuccessMessage",
          "Your credentials were updated. You can now continue to secure operations."
        )}
        icon={<CheckCircle className="h-7 w-7" />}
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle className="h-8 w-8" />
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate("/auth/login")}
          >
            {t("auth.goToLogin", "Go to Login")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("auth.resetPasswordTitle", "Set a New Password")}
      subtitle={t(
        "auth.resetPasswordSubtitle",
        "Create a strong password to secure your blood donation operations account."
      )}
      icon={<Lock className="h-7 w-7" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type={showPassword ? "text" : "password"}
            label={t("auth.newPassword", "New Password")}
            placeholder={t("auth.newPasswordPlaceholder", "Enter new password")}
            error={errors.newPassword?.message}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted transition-colors hover:text-text-primary"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            {...register("newPassword")}
          />
          {password ? <PasswordStrengthMeter password={password} /> : null}
        </div>

        <Input
          type={showConfirmPassword ? "text" : "password"}
          label={t("auth.confirmPassword", "Confirm Password")}
          placeholder={t("auth.confirmPasswordPlaceholder", "Re-enter new password")}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-muted transition-colors hover:text-text-primary"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={resetPasswordMutation.isPending}
        >
          {t("auth.resetPassword", "Reset Password")}
        </Button>

        <div className="text-center">
          <Link
            to="/auth/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.backToForgotPassword", "Back to Forgot Password")}
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

