import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Trash2,
  Key,
  Eye,
  EyeOff,
  MapPin,
} from "lucide-react";

import { PageHeader } from "@/components/index";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Skeleton,
  Select,
} from "@/components/ui";
import Input from "@/components/ui/Input";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import apiClient from "@/lib/api";
import { AFGHANISTAN_PROVINCES, type Province, useHospital, useHospitalsList } from "@/modules/hospitals";
import { changePasswordSchema } from "@/schemas/loginPageValidation";
import type { ChangePasswordFormInputs } from "@/schemas/loginPageValidation";
import { getRoleNameDisplay } from "@/data/roles";
import { extractAxiosError } from "@/utils/extractError";

// Profile update schema
const profileUpdateSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Tab type
type TabType = "personal" | "security";

type DonorRoleProfile = {
  id: number;
  latitude: string;
  longitude: string;
  permanent_address_city: string;
  local_address_city: string;
};

type RecipientRoleProfile = {
  id: number;
  hospital: number;
  province: Province | "";
};

export default function UserProfile() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [donorProfile, setDonorProfile] = useState<DonorRoleProfile | null>(null);
  const [recipientProfile, setRecipientProfile] = useState<RecipientRoleProfile | null>(null);
  const [roleProfileLoading, setRoleProfileLoading] = useState(false);
  const [roleProfileSaving, setRoleProfileSaving] = useState(false);
  const [roleProfileError, setRoleProfileError] = useState<string | null>(null);
  const [locatingRoleProfile, setLocatingRoleProfile] = useState(false);

  const { data: selectedRecipientHospital } = useHospital(recipientProfile?.hospital ?? 0, {
    enabled: (recipientProfile?.hospital ?? 0) > 0,
  });
  const { data: provinceHospitals } = useHospitalsList(
    {
      page_size: 200,
      province: recipientProfile?.province || undefined,
    },
    { enabled: Boolean(recipientProfile?.province) }
  );

  const {
    userProfile,
    loading,
    updateUserProfile,
    changePassword,
    uploadPhoto,
    deletePhoto,
  } = useUserStore();

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: userProfile?.firstName || "",
      last_name: userProfile?.lastName || "",
      phone: userProfile?.phone || "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormInputs>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (!userProfile) return;

    const loadRoleProfile = async () => {
      setRoleProfileLoading(true);
      setRoleProfileError(null);
      try {
        if (userProfile.role === "donor") {
          const response = await apiClient.get("/donors/me/");
          setDonorProfile({
            id: response.data.id,
            latitude: response.data.latitude ? String(response.data.latitude) : "",
            longitude: response.data.longitude ? String(response.data.longitude) : "",
            permanent_address_city: response.data.permanent_address_city || "",
            local_address_city: response.data.local_address_city || "",
          });
          setRecipientProfile(null);
          return;
        }

        if (userProfile.role === "recipient") {
          const response = await apiClient.get("/recipients/me/");
          setRecipientProfile({
            id: response.data.id,
            hospital: response.data.hospital ?? 0,
            province: (response.data.province as Province | undefined) ?? "",
          });
          setDonorProfile(null);
          return;
        }

        setDonorProfile(null);
        setRecipientProfile(null);
      } catch (error) {
        setRoleProfileError(extractAxiosError(error, "Failed to load role profile."));
      } finally {
        setRoleProfileLoading(false);
      }
    };

    void loadRoleProfile();
  }, [userProfile]);

  useEffect(() => {
    if (!recipientProfile || recipientProfile.province || !selectedRecipientHospital?.province) return;
    setRecipientProfile((prev) =>
      prev
        ? {
            ...prev,
            province: selectedRecipientHospital.province,
          }
        : prev
    );
  }, [recipientProfile, selectedRecipientHospital]);

  // Handle profile update
  const onUpdateProfile = async (data: ProfileUpdateFormData) => {
    try {
      await updateUserProfile(data);
      toast.success(t("profile.updated", "Profile updated successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to update profile"));
    }
  };

  // Handle password change
  const onChangePassword = async (data: ChangePasswordFormInputs) => {
    try {
      await changePassword(data);
      toast.success(t("auth.passwordChanged", "Password changed successfully"));
      resetPassword();
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to change password"));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.invalidFileType", "Please select an image file"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.fileTooLarge", "File size must be less than 5MB"));
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await uploadPhoto(file);
      toast.success(t("profile.photoUploaded", "Photo uploaded successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to upload photo"));
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle photo delete
  const handleDeletePhoto = async () => {
    try {
      await deletePhoto();
      toast.success(t("profile.photoDeleted", "Photo deleted successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to delete photo"));
    }
  };

  const handleRegisterRoleLocation = () => {
    if (!donorProfile) return;
    if (!navigator.geolocation) {
      toast.error(t("profile.locationNotSupported", "Geolocation is not supported in this browser."));
      return;
    }

    setLocatingRoleProfile(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDonorProfile((prev) =>
          prev
            ? {
                ...prev,
                latitude: position.coords.latitude.toFixed(6),
                longitude: position.coords.longitude.toFixed(6),
              }
            : prev
        );
        setLocatingRoleProfile(false);
      },
      () => {
        toast.error(t("profile.locationFailed", "Failed to register location."));
        setLocatingRoleProfile(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveRoleProfile = async () => {
    if (!userProfile) return;
    setRoleProfileSaving(true);
    setRoleProfileError(null);
    try {
      if (userProfile.role === "donor" && donorProfile) {
        await apiClient.patch("/donors/me/", {
          latitude: donorProfile.latitude || null,
          longitude: donorProfile.longitude || null,
          permanent_address_city: donorProfile.permanent_address_city || null,
          local_address_city: donorProfile.local_address_city || null,
        });
        toast.success(t("profile.updated", "Profile updated successfully"));
      } else if (userProfile.role === "recipient" && recipientProfile) {
        await apiClient.patch("/recipients/me/", {
          hospital: recipientProfile.hospital || null,
        });
        toast.success(t("profile.updated", "Profile updated successfully"));
      }
    } catch (error) {
      const message = extractAxiosError(error, "Failed to update role profile");
      setRoleProfileError(message);
      toast.error(message);
    } finally {
      setRoleProfileSaving(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: "personal" as TabType, label: t("profile.personalInfo", "Personal Information"), icon: User },
    { id: "security" as TabType, label: t("profile.security", "Security"), icon: Shield },
  ];

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!userProfile) return "?";
    return `${userProfile.firstName?.[0] || ""}${userProfile.lastName?.[0] || ""}`.toUpperCase() || "?";
  };

  // Loading state
  if (!userProfile) {
    return (
      <div className="space-y-6">
<PageHeader
         title={t("profile.title", "My Profile")}
         subtitle={t("profile.subtitle", "Manage your account settings")}
       />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("profile.title", "My Profile")}
        subtitle={t("profile.subtitle", "Manage your account settings and preferences")}
      />

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={`${userProfile.firstName} ${userProfile.lastName}`}
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <span className="text-2xl font-semibold text-primary">
                    {getInitials()}
                  </span>
                </div>
              )}

              {/* Photo actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title={t("profile.changePhoto", "Change Photo")}
                >
                  <Camera className="h-4 w-4" />
                </button>
                {userProfile.avatarUrl && (
                  <button
                    onClick={handleDeletePhoto}
                    disabled={loading}
                    className="p-2 rounded-full bg-white/20 hover:bg-error/80 text-white transition-colors"
                    title={t("profile.deletePhoto", "Delete Photo")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-text-primary">
                {userProfile.firstName} {userProfile.lastName}
              </h2>
              <p className="text-sm text-text-secondary mt-1">@{userProfile.username}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <Badge variant="primary">
                  {getRoleNameDisplay(userProfile.role) || userProfile.role}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-text-secondary">
                  <Mail className="h-4 w-4" />
                  {userProfile.email}
                </span>
                {userProfile.phone && (
                  <span className="flex items-center gap-1 text-sm text-text-secondary">
                    <Phone className="h-4 w-4" />
                    {userProfile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-4 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Personal Information Tab */}
        {activeTab === "personal" && (
          <Card>
            <CardHeader
              title={t("profile.personalInfo", "Personal Information")}
              subtitle={t("profile.personalInfoSubtitle", "Update your personal details")}
            />
            <CardContent>
              <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t("profile.firstName", "First Name")}
                    placeholder={t("profile.firstNamePlaceholder", "Enter your first name")}
                    leftIcon={<User className="h-4 w-4" />}
                    error={profileErrors.first_name?.message}
                    {...registerProfile("first_name")}
                  />

                  <Input
                    label={t("profile.lastName", "Last Name")}
                    placeholder={t("profile.lastNamePlaceholder", "Enter your last name")}
                    leftIcon={<User className="h-4 w-4" />}
                    error={profileErrors.last_name?.message}
                    {...registerProfile("last_name")}
                  />

                  <Input
                    label={t("profile.email", "Email")}
                    type="email"
                    value={userProfile.email}
                    disabled
                    leftIcon={<Mail className="h-4 w-4" />}
                    hint={t("profile.emailReadonly", "Contact admin to change email")}
                  />

                  <Input
                    label={t("profile.phone", "Phone Number")}
                    placeholder={t("profile.phonePlaceholder", "+93 70 000 0000")}
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={profileErrors.phone?.message}
                    {...registerProfile("phone")}
                  />

                  <Input
                    label={t("profile.username", "Username")}
                    value={userProfile.username}
                    disabled
                    leftIcon={<User className="h-4 w-4" />}
                    hint={t("profile.usernameReadonly", "Username cannot be changed")}
                  />

                  <Input
                    label={t("profile.role", "Role")}
                    value={getRoleNameDisplay(userProfile.role) || userProfile.role}
                    disabled
                    leftIcon={<Shield className="h-4 w-4" />}
                    hint={t("profile.roleReadonly", "Contact admin to change role")}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={loading} disabled={!isProfileDirty}>
                    {t("common.save", "Save Changes")}
                  </Button>
                </div>
              </form>

              {userProfile.role === "donor" && donorProfile ? (
                <div className="mt-8 space-y-4 rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {t("profile.donorLocation", "Donor Location Details")}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={t("donors.form.latitude", "Latitude")}
                      value={donorProfile.latitude}
                      onChange={(event) =>
                        setDonorProfile((prev) => (prev ? { ...prev, latitude: event.target.value } : prev))
                      }
                    />
                    <Input
                      label={t("donors.form.longitude", "Longitude")}
                      value={donorProfile.longitude}
                      onChange={(event) =>
                        setDonorProfile((prev) => (prev ? { ...prev, longitude: event.target.value } : prev))
                      }
                    />
                    <Input
                      label={t("donors.form.permanentAddressCity", "Permanent Address City")}
                      value={donorProfile.permanent_address_city}
                      onChange={(event) =>
                        setDonorProfile((prev) =>
                          prev ? { ...prev, permanent_address_city: event.target.value } : prev
                        )
                      }
                    />
                    <Input
                      label={t("donors.form.localAddressCity", "Local Address City")}
                      value={donorProfile.local_address_city}
                      onChange={(event) =>
                        setDonorProfile((prev) => (prev ? { ...prev, local_address_city: event.target.value } : prev))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      loading={locatingRoleProfile}
                      leftIcon={<MapPin className="h-4 w-4" />}
                      onClick={handleRegisterRoleLocation}
                    >
                      {t("donors.form.registerLocation", "Register My Location")}
                    </Button>
                    <Button type="button" loading={roleProfileSaving} onClick={saveRoleProfile}>
                      {t("common.save", "Save")}
                    </Button>
                  </div>
                </div>
              ) : null}

              {userProfile.role === "recipient" && recipientProfile ? (
                <div className="mt-8 space-y-4 rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {t("profile.recipientLocation", "Recipient Location Details")}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Select
                      label={t("bloodRequests.form.province", "Province")}
                      value={recipientProfile.province}
                      options={[
                        { value: "", label: t("bloodRequests.form.provincePlaceholder", "Select province") },
                        ...AFGHANISTAN_PROVINCES.map((value) => ({ value, label: value })),
                      ]}
                      onChange={(event) =>
                        setRecipientProfile((prev) =>
                          prev
                            ? {
                                ...prev,
                                province: event.target.value as Province | "",
                                hospital: 0,
                              }
                            : prev
                        )
                      }
                    />
                    <Select
                      label={t("bloodRequests.form.hospital", "Hospital")}
                      value={String(recipientProfile.hospital || "")}
                      disabled={!recipientProfile.province}
                      options={[
                        {
                          value: "",
                          label: recipientProfile.province
                            ? t("bloodRequests.form.hospitalPlaceholder", "Select hospital")
                            : t("bloodRequests.form.selectProvinceFirst", "Select province first"),
                        },
                        ...(provinceHospitals?.results ?? []).map((item) => ({
                          value: String(item.id),
                          label: item.name,
                        })),
                      ]}
                      onChange={(event) =>
                        setRecipientProfile((prev) =>
                          prev
                            ? {
                                ...prev,
                                hospital: Number(event.target.value),
                              }
                            : prev
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" loading={roleProfileSaving} onClick={saveRoleProfile}>
                      {t("common.save", "Save")}
                    </Button>
                  </div>
                </div>
              ) : null}

              {roleProfileLoading ? (
                <p className="mt-4 text-sm text-text-secondary">{t("common.loading", "Loading...")}</p>
              ) : null}
              {roleProfileError ? <p className="mt-4 text-sm text-error">{roleProfileError}</p> : null}
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <Card>
            <CardHeader
              title={t("auth.changePassword", "Change Password")}
              subtitle={t("profile.securitySubtitle", "Update your password to keep your account secure")}
            />
            <CardContent>
              <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4 max-w-md">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  label={t("auth.currentPassword", "Current Password")}
                  placeholder={t("profile.currentPasswordPlaceholder", "Enter current password")}
                  leftIcon={<Key className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-muted hover:text-text-primary transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={passwordErrors.old_password?.message}
                  {...registerPassword("old_password")}
                />

                <Input
                  type={showNewPassword ? "text" : "password"}
                  label={t("auth.newPassword", "New Password")}
                  placeholder={t("profile.newPasswordPlaceholder", "Enter new password")}
                  leftIcon={<Key className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-muted hover:text-text-primary transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={passwordErrors.new_password?.message}
                  hint={t("profile.passwordHint", "Min 8 chars, include uppercase, lowercase, and number")}
                  {...registerPassword("new_password")}
                />

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  label={t("auth.confirmPassword", "Confirm Password")}
                  placeholder={t("profile.confirmPasswordPlaceholder", "Confirm new password")}
                  leftIcon={<Key className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted hover:text-text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={passwordErrors.confirm_password?.message}
                  {...registerPassword("confirm_password")}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={loading}>
                    {t("auth.changePassword", "Change Password")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
