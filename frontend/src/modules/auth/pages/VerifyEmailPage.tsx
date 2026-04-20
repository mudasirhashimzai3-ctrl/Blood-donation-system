import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { useVerifyEmail, useResendVerification } from "@/modules/auth/api/useAuthMutations";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AuthShell from "../components/AuthShell";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const [email, setEmail] = useState<string>("");

  const verifyEmailMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const isSuccess = verifyEmailMutation.isSuccess;
  const isError = verifyEmailMutation.isError;
  const isLoading = verifyEmailMutation.isPending;

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate({ token });
    } else {
      verifyEmailMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (verifyEmailMutation.data?.data?.email) {
      setEmail(verifyEmailMutation.data.data.email);
    }
  }, [verifyEmailMutation.data]);

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (isSuccess && countdown === 0) {
      navigate("/auth/login");
    }
  }, [isSuccess, countdown, navigate]);

  const handleResend = () => {
    if (email) {
      resendMutation.mutate(email);
    }
  };

  if (isLoading) {
    return (
      <AuthShell
        title={t("auth.verifyingEmail", "Verifying your email")}
        subtitle={t("auth.verifyingEmailHint", "Please wait while we validate your secure link.")}
        icon={<ShieldCheck className="h-7 w-7" />}
      >
        <div className="py-8 text-center">
          <Spinner size="lg" label={t("auth.verifyingEmail", "Verifying your email...")} />
        </div>
      </AuthShell>
    );
  }

  if (isSuccess) {
    return (
      <AuthShell
        title={t("auth.emailVerifiedTitle", "Email Verified")}
        subtitle={t(
          "auth.emailVerifiedMessage",
          "Your email is confirmed and your account is ready for secure sign in."
        )}
        icon={<CheckCircle className="h-7 w-7" />}
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle className="h-8 w-8" />
          </div>
          <p className="text-sm text-text-secondary">
            {t("auth.redirectingIn", "Redirecting to login in {seconds} seconds...", {
              seconds: countdown,
            })}
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate("/auth/login")}>
            {t("auth.goToLogin", "Go to Login")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (isError || !token) {
    return (
      <AuthShell
        title={t("auth.verificationFailed", "Verification Failed")}
        subtitle={t(
          "auth.verificationFailedMessage",
          "The verification link is invalid or expired. Request a new verification email."
        )}
        icon={<XCircle className="h-7 w-7" />}
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-soft text-error">
            <XCircle className="h-8 w-8" />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {email ? (
              <Button
                variant="primary"
                fullWidth
                onClick={handleResend}
                loading={resendMutation.isPending}
                leftIcon={<Mail className="h-5 w-5" />}
              >
                {t("auth.resendVerification", "Resend Verification Email")}
              </Button>
            ) : null}

            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("auth.backToLogin", "Back to Login")}
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return null;
}

