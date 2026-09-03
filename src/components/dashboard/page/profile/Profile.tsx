"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Camera, KeyRound, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useProfile } from "@/hooks/useAuth";
import { useDeleteAccount, useUpdatePassword, useUpdateProfile } from "@/hooks/useProfile";
import { Panel, PanelHeader, PANEL_BODY, FieldLabel, SkLine } from "@/components/dashboard/Panel";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { applyServerErrors } from "@/components/auth/serverErrors";
import {
  updateProfileRequestSchema,
  updatePasswordRequestSchema,
  type UpdateProfileRequest,
  type UpdatePasswordRequest,
} from "@/schemas/profile.schema";
import type { ProfileData } from "@/services/profile.service";

/* Fallback for when `/user/profile` answers without a country list. */
const COUNTRIES = [
  "Bangladesh", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "India", "Singapore", "UAE", "Saudi Arabia", "Japan", "Brazil",
];

const EMPTY: UpdateProfileRequest = {
  firstname: "", lastname: "", country: "", phone_code: "",
  phone: "", state: "", city: "", zip_code: "", address: "",
};

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      <Panel>
        <div className={`flex flex-wrap items-center gap-5 ${PANEL_BODY}`}>
          <SkLine className="h-18 w-18 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <SkLine className="h-4 w-40" />
            <SkLine className="h-3 w-56" />
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-1 gap-[clamp(16px,1.8vw,24px)] min-[1180px]:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${PANEL_BODY}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <SkLine className="h-3 w-24" />
                <SkLine className="h-11 w-full" />
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className={`flex flex-col gap-4 ${PANEL_BODY}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <SkLine key={i} className="h-11 w-full" />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function Profile() {
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profileRes, isLoading } = useProfile();
  const data = (profileRes as { data?: ProfileData } | undefined)?.data;
  const user = data?.user;
  const countryOptions = data?.countries?.length ? data.countries.map((c) => c.name) : COUNTRIES;

  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* ── avatar ── a File plus a local object-URL for instant preview. */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function pickImage(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setImagePreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setImageFile(file);
  }

  /* An object-URL is a document-lifetime reference; without this the blob
     survives every avatar swap until a full reload. */
  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const {
    control,
    handleSubmit,
    reset: resetProfileForm,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    defaultValues: EMPTY,
  });

  /* Seed the form once the profile lands. `reset` rather than per-field
     `setValue` so `isDirty` measures against the SERVER's copy — that is what
     keeps Save disabled until something actually changed. */
  const seeded = useRef<number | null>(null);
  useEffect(() => {
    if (!user || seeded.current === user.id) return;
    seeded.current = user.id;
    resetProfileForm({
      firstname: user.firstname ?? "",
      lastname: user.lastname ?? "",
      country: user.address?.country ?? "",
      phone_code: user.mobile_code ?? "",
      phone: user.mobile ?? "",
      state: user.address?.state ?? "",
      city: user.address?.city ?? "",
      zip_code: user.address?.zip ?? "",
      address: user.address?.address ?? "",
    });
  }, [user, resetProfileForm]);

  const firstname = useWatch({ control, name: "firstname" }) ?? "";
  const lastname = useWatch({ control, name: "lastname" }) ?? "";

  const onSaveProfile = (values: UpdateProfileRequest) =>
    updateProfile.mutate(
      { ...values, ...(imageFile ? { image: imageFile } : {}) },
      {
        onSuccess: () => {
          resetProfileForm(values); // new baseline → Save goes quiet again
          setImageFile(null);
        },
        onError: (err) =>
          applyServerErrors(err, setError, {
            firstname: "firstname", lastname: "lastname", country: "country",
            phone: "phone", phone_code: "phone_code", state: "state",
            city: "city", zip_code: "zip_code", address: "address",
          }),
      },
    );

  /* ── password ── its own form: a separate endpoint, and its errors must not
     make the profile form look dirty. */
  const updatePassword = useUpdatePassword();
  const {
    control: pwControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    setError: setPasswordError,
    formState: { errors: pwErrors },
  } = useForm<UpdatePasswordRequest>({
    resolver: zodResolver(updatePasswordRequestSchema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });
  const newPassword = useWatch({ control: pwControl, name: "password" }) ?? "";

  const onUpdatePassword = (values: UpdatePasswordRequest) =>
    updatePassword.mutate(values, {
      onSuccess: () => resetPasswordForm(),
      onError: (err) =>
        applyServerErrors(err, setPasswordError, {
          current_password: "current_password",
          password: "password",
        }),
    });

  if (isLoading && !user) return <ProfileSkeleton />;

  const initials = ((firstname[0] ?? "") + (lastname[0] ?? "")).toUpperCase() || "U";
  const avatarSrc = imagePreview ?? user?.userImage;

  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      {/* ── identity ── */}
      <Panel>
        <div className={`flex flex-wrap items-center gap-4 sm:gap-5 ${PANEL_BODY}`}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickImage(e.dataTransfer.files?.[0]); }}
            aria-label={t("dashboard.profile.changePhoto")}
            className="relative shrink-0 cursor-pointer"
          >
            {avatarSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element -- object-URL preview / remote avatar, both unknown at build time in a static export */
              <img
                src={avatarSrc}
                alt=""
                className={`h-18 w-18 object-cover ring-4 transition-colors ${dragging ? "ring-primary" : "ring-brand/15"}`}
              />
            ) : (
              <span
                className={`flex h-18 w-18 items-center justify-center bg-brand/12 text-xl font-bold text-brand ring-4 transition-colors ${dragging ? "ring-primary" : "ring-brand/15"}`}
              >
                {initials}
              </span>
            )}
            <span className="absolute -end-1 -top-1 flex h-6 w-6 items-center justify-center border border-border bg-card text-muted">
              <Camera size={11} strokeWidth={2} aria-hidden />
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pickImage(e.target.files?.[0])}
            />
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[clamp(17px,1.7vw,20px)] font-bold tracking-[-0.02em] text-heading">
                {`${firstname} ${lastname}`.trim() || t("dashboard.profile.noName")}
              </span>
              {Boolean(user?.email_verified) && (
                <span className="inline-flex items-center gap-1 bg-ok/14 px-2 py-0.5 text-[11.5px] font-bold tracking-[0.1em] text-ok uppercase">
                  <BadgeCheck size={11} strokeWidth={2.5} aria-hidden />
                  {t("dashboard.profile.verified")}
                </span>
              )}
              {user?.type && (
                <span className="inline-flex bg-brand/14 px-2 py-0.5 text-[11.5px] font-bold tracking-[0.1em] text-brand uppercase">
                  {user.type}
                </span>
              )}
            </span>
            <span className="flex min-w-0 items-center gap-1.5 text-[13.5px] text-muted">
              <Mail size={12} strokeWidth={2} aria-hidden className="flex-none" />
              <span className="truncate">{user?.email ?? ""}</span>
            </span>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 items-start gap-[clamp(16px,1.8vw,24px)] min-[1180px]:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── personal info ── */}
        <Panel>
          <PanelHeader title={t("dashboard.profile.personalInfo")} />
          <form noValidate onSubmit={handleSubmit(onSaveProfile)} className={PANEL_BODY}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Controller name="firstname" control={control} render={({ field }) => (
                <Input {...field} required label={t("dashboard.profile.firstName")} error={errors.firstname?.message} />
              )} />
              <Controller name="lastname" control={control} render={({ field }) => (
                <Input {...field} required label={t("dashboard.profile.lastName")} error={errors.lastname?.message} />
              )} />

              <div>
                <FieldLabel>{t("dashboard.profile.country")}</FieldLabel>
                <Controller name="country" control={control} render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={countryOptions.map((c) => ({ value: c, label: c }))}
                    placeholder={t("dashboard.profile.selectCountry")}
                    leftIcon={<MapPin size={14} strokeWidth={2} aria-hidden />}
                  />
                )} />
              </div>

              <Controller name="phone" control={control} render={({ field }) => (
                <Input
                  {...field}
                  type="tel"
                  label={t("dashboard.profile.phone")}
                  leftIcon={<Phone size={14} strokeWidth={2} aria-hidden />}
                  error={errors.phone?.message}
                />
              )} />

              <div className="sm:col-span-2">
                <Controller name="address" control={control} render={({ field }) => (
                  <Input {...field} label={t("dashboard.profile.address")} error={errors.address?.message} />
                )} />
              </div>

              <Controller name="city" control={control} render={({ field }) => (
                <Input {...field} label={t("dashboard.profile.city")} error={errors.city?.message} />
              )} />
              <Controller name="state" control={control} render={({ field }) => (
                <Input {...field} label={t("dashboard.profile.state")} error={errors.state?.message} />
              )} />
              <Controller name="zip_code" control={control} render={({ field }) => (
                <Input {...field} label={t("dashboard.profile.zipCode")} error={errors.zip_code?.message} />
              )} />
            </div>

            <Button
              type="submit"
              fullWidth
              className="mt-6"
              disabled={!isDirty && !imageFile}
              loading={updateProfile.isPending}
            >
              {t("dashboard.profile.saveChanges")}
            </Button>
          </form>
        </Panel>

        <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
          {/* ── password ── */}
          <Panel>
            <PanelHeader title={t("dashboard.profile.changePassword")}>
              <KeyRound size={15} strokeWidth={2} className="flex-none text-muted" aria-hidden />
            </PanelHeader>
            <form
              noValidate
              onSubmit={handlePasswordSubmit(onUpdatePassword)}
              className={`flex flex-col gap-4 ${PANEL_BODY}`}
            >
              <Controller name="current_password" control={pwControl} render={({ field }) => (
                <PasswordField
                  {...field}
                  autoComplete="current-password"
                  label={t("dashboard.profile.currentPassword")}
                  error={pwErrors.current_password?.message}
                />
              )} />
              <div>
                <Controller name="password" control={pwControl} render={({ field }) => (
                  <PasswordField
                    {...field}
                    autoComplete="new-password"
                    label={t("dashboard.profile.newPassword")}
                    error={pwErrors.password?.message}
                  />
                )} />
                <PasswordStrength value={newPassword} />
              </div>
              <Controller name="password_confirmation" control={pwControl} render={({ field }) => (
                <PasswordField
                  {...field}
                  autoComplete="new-password"
                  label={t("dashboard.profile.confirmPassword")}
                  error={pwErrors.password_confirmation?.message}
                />
              )} />
              <Button type="submit" fullWidth loading={updatePassword.isPending}>
                {t("dashboard.profile.updatePassword")}
              </Button>
            </form>
          </Panel>

          {/* ── danger ── */}
          <section className="border border-danger/30 bg-card p-[clamp(16px,1.8vw,22px)]">
            <span className="text-[13px] font-bold tracking-[0.1em] text-danger uppercase">
              {t("dashboard.profile.dangerZone")}
            </span>
            <p className="mt-2 text-[13px] leading-[1.55]">{t("dashboard.profile.dangerDesc")}</p>
            <Button variant="danger" fullWidth className="mt-4" onClick={() => setConfirmDelete(true)}>
              {t("dashboard.profile.deleteMyAccount")}
            </Button>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        busy={deleteAccount.isPending}
        tone="danger"
        icon={<Trash2 size={22} strokeWidth={2} aria-hidden />}
        title={t("dashboard.profile.deleteMyAccount")}
        description={t("dashboard.profile.dangerDesc")}
        confirmLabel={t("dashboard.profile.deleteMyAccount")}
        onConfirm={() => deleteAccount.mutate()}
      />
    </div>
  );
}
