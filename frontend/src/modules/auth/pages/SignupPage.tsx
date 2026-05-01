import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import AuthShell from "../components/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useSignup } from "@/modules/auth/api/useAuthMutations";
import { signupSchema, type SignupInput } from "@/modules/auth/schemas/authSchemas";

const isValidSignupRole = (
  role: string | null
): role is SignupInput["role"] => role === "donor" || role === "recipient";

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupMutation = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requestedRole = searchParams.get("role");
  const preselectedRole: SignupInput["role"] = isValidSignupRole(requestedRole)
    ? requestedRole
    : "donor";
  const fixedRoleLabel = preselectedRole === "donor" ? "Donor" : "Recipient";

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      role: preselectedRole,
      donor_blood_group: preselectedRole === "donor" ? "A+" : undefined,
      donor_latitude: undefined,
      donor_longitude: undefined,
      recipient_required_blood_group: preselectedRole === "recipient" ? "A+" : undefined,
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    form.setValue("role", preselectedRole, { shouldDirty: false });
  }, [form, preselectedRole]);

  const onSubmit = async (values: SignupInput) => {
    try {
      await signupMutation.mutateAsync(values);
      navigate("/auth/login", { replace: true });
    } catch {
      // Mutation handles toasts and errors.
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <AuthShell
      title={t("auth.signupTitle", "Create Your Account")}
      subtitle={t(
        "auth.signupSubtitle",
        "Sign up as a donor or recipient to access the blood donation system."
      )}
      icon={<UserPlus className="h-7 w-7" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t("auth.firstName", "First Name")}
            placeholder={t("auth.firstNamePlaceholder", "Enter first name")}
            error={errors.first_name?.message}
            {...register("first_name")}
          />
          <Input
            label={t("auth.lastName", "Last Name")}
            placeholder={t("auth.lastNamePlaceholder", "Enter last name")}
            error={errors.last_name?.message}
            {...register("last_name")}
          />
        </div>

        <Input
          label={t("auth.username", "Username")}
          placeholder={t("auth.usernamePlaceholder", "Enter your username")}
          error={errors.username?.message}
          autoComplete="username"
          {...register("username")}
        />

        <Input
          label={t("auth.emailOptional", "Email (Optional)")}
          placeholder={t("auth.emailPlaceholderOptional", "Enter your email (optional)")}
          error={errors.email?.message}
          autoComplete="email"
          {...register("email")}
        />

        <Input
          label={t("auth.phone", "Phone")}
          placeholder={t("auth.phonePlaceholder", "Enter your phone number")}
          error={errors.phone?.message}
          autoComplete="tel"
          {...register("phone")}
        />

        {preselectedRole === "donor" ? (
          <>
            <Select
              label={t("auth.bloodGroup", "Blood Group")}
              error={errors.donor_blood_group?.message}
              options={[
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ]}
              {...register("donor_blood_group")}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                type="number"
                step="0.000001"
                label={t("auth.latitude", "Latitude")}
                placeholder={t("auth.latitudePlaceholder", "Enter latitude")}
                error={errors.donor_latitude?.message}
                {...register("donor_latitude", { valueAsNumber: true })}
              />
              <Input
                type="number"
                step="0.000001"
                label={t("auth.longitude", "Longitude")}
                placeholder={t("auth.longitudePlaceholder", "Enter longitude")}
                error={errors.donor_longitude?.message}
                {...register("donor_longitude", { valueAsNumber: true })}
              />
            </div>
          </>
        ) : null}

        {preselectedRole === "recipient" ? (
          <Select
            label={t("auth.requiredBloodGroup", "Required Blood Group")}
            error={errors.recipient_required_blood_group?.message}
            options={[
              { value: "A+", label: "A+" },
              { value: "A-", label: "A-" },
              { value: "B+", label: "B+" },
              { value: "B-", label: "B-" },
              { value: "AB+", label: "AB+" },
              { value: "AB-", label: "AB-" },
              { value: "O+", label: "O+" },
              { value: "O-", label: "O-" },
            ]}
            {...register("recipient_required_blood_group")}
          />
        ) : null}

        <Input
          label={t("auth.role", "Role")}
          value={fixedRoleLabel}
          disabled
          readOnly
        />
        <input type="hidden" {...register("role")} />

        <Input
          type={showPassword ? "text" : "password"}
          label={t("auth.password", "Password")}
          placeholder={t("auth.passwordPlaceholder", "Enter your password")}
          error={errors.password?.message}
          autoComplete="new-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
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
          {...register("password")}
        />

        <Input
          type={showConfirmPassword ? "text" : "password"}
          label={t("auth.confirmPassword", "Confirm Password")}
          placeholder={t("auth.confirmPasswordPlaceholder", "Confirm your password")}
          error={errors.confirm_password?.message}
          autoComplete="new-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
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
          {...register("confirm_password")}
        />

        <Button type="submit" fullWidth loading={signupMutation.isPending}>
          {t("auth.signupButton", "Create Account")}
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
    </AuthShell>
  );
}
