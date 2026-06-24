import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, MapPin, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import AuthShell from "../components/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useSignup } from "@/modules/auth/api/useAuthMutations";
import { signupSchema, type SignupFormInput, type SignupInput } from "@/modules/auth/schemas/authSchemas";

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
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestedRole = searchParams.get("role");
  const preselectedRole: SignupInput["role"] = isValidSignupRole(requestedRole)
    ? requestedRole
    : "donor";
  const fixedRoleLabel = preselectedRole === "donor" ? "Donor" : "Recipient";

  const form = useForm<SignupFormInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      role: preselectedRole,
      donor_blood_group: preselectedRole === "donor" ? "A+" : undefined,
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    form.setValue("role", preselectedRole, { shouldDirty: false });
  }, [form, preselectedRole]);

  const onSubmit = async (values: SignupFormInput) => {
    try {
      await signupMutation.mutateAsync(values as SignupInput);
      navigate("/auth/login", { replace: true });
    } catch {
      // Mutation handles toasts and errors.
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const handleRegisterLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("auth.locationNotSupported", "Geolocation is not supported in this browser."));
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("donor_latitude", Number(position.coords.latitude.toFixed(6)), {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("donor_longitude", Number(position.coords.longitude.toFixed(6)), {
          shouldDirty: true,
          shouldValidate: true,
        });
        setIsLocating(false);
      },
      () => {
        setLocationError(t("auth.locationFailed", "Unable to register your location right now."));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
          type="tel"
          inputMode="numeric"
          maxLength={10}
          pattern="[0-9]{10}"
          label={t("auth.phone", "Phone")}
          placeholder={t("auth.phonePlaceholder", "0700000000")}
          error={errors.phone?.message}
          autoComplete="tel"
          onInput={(event) => {
            const input = event.currentTarget;
            input.value = input.value.replace(/\D/g, "").slice(0, 10);
          }}
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
                label={t("auth.donorLatitude", "Latitude")}
                placeholder={t("auth.donorLatitudePlaceholder", "Enter latitude")}
                error={errors.donor_latitude?.message}
                {...register("donor_latitude")}
              />
              <Input
                label={t("auth.donorLongitude", "Longitude")}
                placeholder={t("auth.donorLongitudePlaceholder", "Enter longitude")}
                error={errors.donor_longitude?.message}
                {...register("donor_longitude")}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              leftIcon={<MapPin className="h-4 w-4" />}
              loading={isLocating}
              onClick={handleRegisterLocation}
            >
              {t("auth.registerLocation", "Register Location")}
            </Button>
            {locationError ? <p className="text-sm text-error">{locationError}</p> : null}
          </>
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
