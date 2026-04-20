import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import {
  forgotPasswordSchema,
  verifyResetCodeSchema,
  type ForgotPasswordInput,
  type VerifyResetCodeInput,
} from "@/modules/auth/schemas/authSchemas";
import { useForgotPassword, useVerifyResetCode } from "@/modules/auth/api/useAuthMutations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OTPInput from "../components/OTPInput";
import AuthShell from "../components/AuthShell";

type Step = "email" | "code" | "reset";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const forgotPasswordMutation = useForgotPassword();
  const verifyCodeMutation = useVerifyResetCode();

  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const codeForm = useForm<VerifyResetCodeInput>({
    resolver: zodResolver(verifyResetCodeSchema),
  });

  const onEmailSubmit = async (data: ForgotPasswordInput) => {
    try {
      const response = await forgotPasswordMutation.mutateAsync(data);
      if (response.data.success) {
        setEmailOrUsername(data.email_or_username);
        setMaskedEmail(response.data.masked_email || "");
        setStep("code");
      }
    } catch {
      // mutation handles error toast
    }
  };

  const verifyCode = async (code: string) => {
    const response = await verifyCodeMutation.mutateAsync({
      email_or_username: emailOrUsername,
      code,
    });

    if (response.data.success) {
      navigate("/auth/reset-password", {
        state: { emailOrUsername, code },
      });
    }
  };

  const onCodeSubmit = async (data: VerifyResetCodeInput) => {
    try {
      await verifyCode(data.code);
    } catch {
      // mutation handles error toast
    }
  };

  const handleOTPComplete = async (code: string) => {
    try {
      await verifyCode(code);
    } catch {
      // mutation handles error toast
    }
  };

  const handleResendCode = async () => {
    try {
      await forgotPasswordMutation.mutateAsync({ email_or_username: emailOrUsername });
      codeForm.reset();
    } catch {
      // mutation handles error toast
    }
  };

  const isEmailStep = step === "email";

  return (
    <AuthShell
      title={
        isEmailStep
          ? t("auth.forgotPasswordTitle", "Recover Access")
          : t("auth.verifyCodeTitle", "Verify Security Code")
      }
      subtitle={
        isEmailStep
          ? t(
              "auth.forgotPasswordSubtitle",
              "Enter your account email or username to receive a secure verification code."
            )
          : t("auth.verifyCodeSubtitle", "Enter the 6-digit code sent to {{email}}", {
              email: maskedEmail,
            })
      }
      icon={
        isEmailStep ? (
          <Mail className="h-7 w-7" />
        ) : (
          <KeyRound className="h-7 w-7" />
        )
      }
    >
      {isEmailStep ? (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
          <Input
            label={t("auth.emailOrUsername", "Email or Username")}
            type="text"
            placeholder={t(
              "auth.emailOrUsernamePlaceholder",
              "Enter your email or username"
            )}
            leftIcon={<Mail className="h-5 w-5 text-text-muted" />}
            error={emailForm.formState.errors.email_or_username?.message}
            {...emailForm.register("email_or_username")}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={forgotPasswordMutation.isPending}
          >
            {t("auth.sendCode", "Send Verification Code")}
          </Button>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("auth.backToLogin", "Back to Login")}
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
          <div>
            <label className="form-label mb-2 block">
              {t("auth.verificationCode", "Verification Code")}
            </label>
            <OTPInput
              length={6}
              value={codeForm.watch("code") || ""}
              onChange={(value) => codeForm.setValue("code", value)}
              onComplete={handleOTPComplete}
              disabled={verifyCodeMutation.isPending}
              error={codeForm.formState.errors.code?.message}
            />
          </div>

          <div className="rounded-xl border border-warning/25 bg-warning-soft p-3 text-sm text-warning">
            <p className="font-semibold">
              {t("auth.codeExpiresIn", "Code expires in 15 minutes")}
            </p>
            <p className="mt-1 text-xs">
              {t("auth.codeFiveAttempts", "You have 5 attempts to enter the correct code")}
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={verifyCodeMutation.isPending}
          >
            {t("auth.verifyCode", "Verify Code")}
          </Button>

          <div className="space-y-2 text-center text-sm">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={forgotPasswordMutation.isPending}
              className="font-medium text-primary hover:underline disabled:opacity-50"
            >
              {t("auth.resendCode", "Resend Code")}
            </button>
            <div>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  codeForm.reset();
                }}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("auth.changeEmail", "Change Email/Username")}
              </button>
            </div>
          </div>
        </form>
      )}
    </AuthShell>
  );
}

