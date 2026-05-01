import { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Avatar, Button, Input, Select, Textarea } from "@components/ui";
import type { DonorFormValues } from "../schemas/donorSchemas";
import { BLOOD_GROUP_OPTIONS } from "../types/donor.types";

interface DonorFormProps {
  form: UseFormReturn<DonorFormValues>;
  onSubmit: (values: DonorFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
  existingProfilePictureUrl?: string | null;
}

export default function DonorForm({
  form,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
  existingProfilePictureUrl = null,
}: DonorFormProps) {
  const { t } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const donorName = `${watch("first_name")} ${watch("last_name")}`.trim();
  const profilePicture = watch("profile_picture");
  const removeProfilePicture = watch("remove_profile_picture");

  const previewUrl = useMemo(() => {
    if (profilePicture instanceof File) {
      return URL.createObjectURL(profilePicture);
    }
    if (removeProfilePicture) return null;
    return existingProfilePictureUrl;
  }, [existingProfilePictureUrl, profilePicture, removeProfilePicture]);

  useEffect(() => {
    return () => {
      if (profilePicture instanceof File && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, profilePicture]);

  const handleRegisterLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("donors.form.locationNotSupported", "Geolocation is not supported in this browser."));
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude.toFixed(6), { shouldDirty: true, shouldValidate: true });
        setValue("longitude", position.coords.longitude.toFixed(6), { shouldDirty: true, shouldValidate: true });
        setIsLocating(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(t("donors.form.locationPermissionDenied", "Location access was denied."));
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError(t("donors.form.locationUnavailable", "Unable to detect your location right now."));
        } else if (error.code === error.TIMEOUT) {
          setLocationError(t("donors.form.locationTimeout", "Location request timed out. Please try again."));
        } else {
          setLocationError(t("donors.form.locationGenericError", "Failed to register location."));
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-text-primary">
          {t("donors.form.profilePicture", "Profile Picture")}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar src={previewUrl} name={donorName || "Donor"} size="xl" />
          <div className="flex-1 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setValue("profile_picture", file, { shouldDirty: true, shouldValidate: true });
                setValue("remove_profile_picture", false, { shouldDirty: true });
              }}
              className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValue("profile_picture", null, { shouldDirty: true, shouldValidate: true });
                  if (existingProfilePictureUrl) {
                    setValue("remove_profile_picture", true, { shouldDirty: true });
                  }
                }}
              >
                {t("donors.actions.removePicture", "Remove Picture")}
              </Button>
            </div>
            <p className="text-xs text-text-secondary">
              {t("donors.form.profilePictureHint", "Accepted image files up to 5MB")}
            </p>
            {errors.profile_picture?.message ? (
              <p className="text-sm text-error">{String(errors.profile_picture.message)}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {t("donors.form.sections.basicInfo", "Basic Information")}
          </p>
          <p className="text-xs text-text-secondary">
            {t("donors.form.sections.basicInfoHint", "Name and contact details")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("donors.form.firstName", "First Name")}
            placeholder={t("donors.form.firstNamePlaceholder", "Enter first name")}
            error={errors.first_name?.message}
            {...register("first_name")}
          />
          <Input
            label={t("donors.form.lastName", "Last Name")}
            placeholder={t("donors.form.lastNamePlaceholder", "Enter last name")}
            error={errors.last_name?.message}
            {...register("last_name")}
          />
          <Input
            label={t("donors.form.phone", "Phone")}
            placeholder={t("donors.form.phonePlaceholder", "Enter phone number")}
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            type="email"
            label={t("donors.form.email", "Email")}
            placeholder={t("donors.form.emailPlaceholder", "Enter email")}
            error={errors.email?.message}
            {...register("email")}
          />
          <Select
            label={t("donors.form.bloodGroup", "Blood Group")}
            error={errors.blood_group?.message}
            options={BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group }))}
            {...register("blood_group")}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {t("donors.form.sections.profileInfo", "Profile Information")}
          </p>
          <p className="text-xs text-text-secondary">
            {t("donors.form.sections.profileInfoHint", "Age and donation history")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="number"
            min={1}
            max={150}
            label={t("donors.form.age", "Age")}
            placeholder={t("donors.form.agePlaceholder", "Enter age")}
            error={errors.age?.message}
            {...register("age")}
          />
          <div className="md:col-span-2">
            <Input
              type="date"
              label={t("donors.form.lastDonationDate", "Last Donation Date")}
              error={errors.last_donation_date?.message}
              {...register("last_donation_date")}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {t("donors.form.sections.location", "Location Details")}
          </p>
          <p className="text-xs text-text-secondary">
            {t("donors.form.sections.locationHint", "Register location and provide address information")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <Button type="button" variant="outline" onClick={handleRegisterLocation} loading={isLocating}>
              {t("donors.form.registerLocation", "Register My Location")}
            </Button>
          </div>
          {locationError ? <p className="text-sm text-error">{locationError}</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("donors.form.latitude", "Latitude")}
            placeholder={t("donors.form.latitudePlaceholder", "Enter latitude")}
            error={errors.latitude?.message}
            {...register("latitude")}
          />
          <Input
            label={t("donors.form.longitude", "Longitude")}
            placeholder={t("donors.form.longitudePlaceholder", "Enter longitude")}
            error={errors.longitude?.message}
            {...register("longitude")}
          />
        </div>
        <Textarea
          label={t("donors.form.permanentAddress", "Permanent Address")}
          placeholder={t("donors.form.permanentAddressPlaceholder", "Enter permanent address")}
          error={errors.permanent_address?.message}
          {...register("permanent_address")}
        />
        <Textarea
          label={t("donors.form.localAddress", "Local Address")}
          placeholder={t("donors.form.localAddressPlaceholder", "Enter local address")}
          error={errors.local_address?.message}
          {...register("local_address")}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("donors.actions.cancel", "Cancel")}
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
