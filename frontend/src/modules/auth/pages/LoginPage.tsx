import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, LogIn, Droplets, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";

import {
  loginSchema,
  type LoginFormInputs,
} from "@/schemas/loginPageValidation";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { AccountLockedMessage } from "@/modules/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { AxiosError } from "axios";
import AuthShell from "../components/AuthShell";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "donor", label: "Donor" },
  { value: "recipient", label: "Recipient" },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null
  );
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  const {
    login,
    loading,
    error,
    clearError,
    lockedUntil: storeLockedUntil,
  } = useUserStore();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "recipient",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    clearError();
    setAttemptsRemaining(null);
    setIsLocked(false);
    setLockedUntil(null);

    try {
      await login(data);
      toast.success(t("auth.loginSuccess", "Welcome back!"));
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        if (
          err?.response?.status === 429 ||
          err?.response?.data?.locked_until
        ) {
          setIsLocked(true);
          setLockedUntil(err?.response?.data?.locked_until || storeLockedUntil);
          toast.error(t("auth.accountLocked", "Account is temporarily locked"));
        } else if (err?.response?.data?.attempts_remaining !== undefined) {
          const remaining = err.response.data.attempts_remaining;
          setAttemptsRemaining(remaining);
          if (remaining > 0) {
            toast.error(
              t("auth.attemptsRemaining", "{{count}} attempts remaining", {
                count: remaining,
              })
            );
          }
        } else {
          toast.error(
            error || t("auth.loginError", "Invalid username or password")
          );
        }
      }
    }
  };

  return (
    <AuthShell
      title={t("auth.loginTitle", "Blood Donation Command Center")}
      subtitle={t(
        "auth.loginSubtitle",
        "Sign in to coordinate donors, recipients, and urgent blood requests."
      )}
      icon={<Droplets className="h-7 w-7" />}
      footer={t(
        "auth.footerCopyright",
        "© 2026 Blood Donation Network. All rights reserved."
      )}
    >
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-text-primary">
          {t("auth.login", "Sign In")}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t("auth.loginDescription", "Access your secure operations workspace")}
        </p>
      </div>

      {isLocked && lockedUntil ? (
        <div className="mb-5">
          <AccountLockedMessage lockedUntil={lockedUntil} />
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label={t("auth.username", "Username")}
          placeholder={t("auth.usernamePlaceholder", "Enter your username")}
          error={errors.username?.message}
          autoComplete="username"
          disabled={isLocked}
          {...register("username")}
        />

        <Select
          label={t("auth.role", "Role")}
          placeholder={t("auth.rolePlaceholder", "Select your role")}
          options={roleOptions}
          error={errors.role?.message}
          disabled={isLocked}
          {...register("role")}
        />

        <div>
          <Input
            type={showPassword ? "text" : "password"}
            label={t("auth.password", "Password")}
            placeholder={t("auth.passwordPlaceholder", "Enter your password")}
            error={errors.password?.message}
            autoComplete="current-password"
            disabled={isLocked}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted transition-colors hover:text-text-primary"
                tabIndex={-1}
                disabled={isLocked}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            {...register("password")}
          />

          <div className="mt-2 text-right">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("auth.forgotPassword", "Forgot password?")}
            </Link>
          </div>
        </div>

        {error && !isLocked ? (
          <div className="rounded-xl border border-error/25 bg-error-soft p-3 text-sm text-error">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p>{error}</p>
                {attemptsRemaining !== null && attemptsRemaining > 0 ? (
                  <p className="mt-1 font-medium">
                    {t("auth.attemptsRemaining", "{{count}} attempts remaining", {
                      count: attemptsRemaining,
                    })}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={isLocked}
          leftIcon={
            isLocked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )
          }
        >
          {isLocked
            ? t("auth.accountLocked", "Account Locked")
            : loading
            ? t("auth.loggingIn", "Signing in...")
            : t("auth.loginButton", "Sign In")}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <div className="mb-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Link
            to="/auth/signup?role=donor"
            className="font-medium text-primary hover:underline"
          >
            {t("auth.signupDonor", "Sign up as Donor")}
          </Link>
          <span className="hidden text-text-secondary sm:inline">|</span>
          <Link
            to="/auth/signup?role=recipient"
            className="font-medium text-primary hover:underline"
          >
            {t("auth.signupRecipient", "Sign up as Recipient")}
          </Link>
        </div>
        <p>
          {t("auth.needHelp", "Need assistance?")}{" "}
          <a
            href="mailto:support@blooddonation.org"
            className="font-medium text-primary hover:underline"
          >
            {t("auth.contactSupport", "Contact Support")}
          </a>
        </p>
      </div>
    </AuthShell>
  );
}

