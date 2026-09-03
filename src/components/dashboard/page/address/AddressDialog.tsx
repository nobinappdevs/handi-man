"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, Phone, Star } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Modal } from "@/components/dashboard/Modal";
import { FieldLabel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  addressRequestSchema,
  ADDRESS_LABELS,
  type AddressRequest,
  type SavedAddress,
} from "@/schemas/address.schema";

const BLANK: AddressRequest = {
  address: "", landmark: "", phone: "", label: "home", mapLink: "", isDefault: false,
};

/**
 * Add / edit, in one dialog — the two differ by a title and whether the form
 * starts filled, and splitting them would be two copies of the same six fields.
 *
 * `editing` doubles as the mode flag: `null` is "add".
 */
export function AddressDialog({
  open,
  editing,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editing: SavedAddress | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: AddressRequest) => void;
}) {
  const { t } = useLang();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressRequest>({
    resolver: zodResolver(addressRequestSchema),
    defaultValues: BLANK,
  });

  /* Refill on every open, not just on mount: the dialog stays mounted between
     uses, so without this "Add" would still be showing the last edited row. */
  useEffect(() => {
    if (!open) return;
    reset(editing ? { ...BLANK, ...editing } : BLANK);
  }, [open, editing, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={busy}
      size="lg"
      labelledBy="address-dialog-title"
      icon={<MapPin size={17} strokeWidth={2.2} aria-hidden />}
      title={t(editing ? "dashboard.address.editTitle" : "dashboard.address.addTitle")}
    >
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 p-[clamp(16px,1.8vw,22px)]"
      >
        <Controller name="address" control={control} render={({ field }) => (
          <Input
            {...field}
            required
            label={t("dashboard.address.fullAddress")}
            placeholder={t("dashboard.address.fullAddressPlaceholder")}
            leftIcon={<MapPin size={14} strokeWidth={2} aria-hidden />}
            error={errors.address?.message}
          />
        )} />

        <Controller name="landmark" control={control} render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            label={t("dashboard.address.landmark")}
            placeholder={t("dashboard.address.landmarkPlaceholder")}
            hint={t("dashboard.address.landmarkHint")}
            leftIcon={<Building2 size={14} strokeWidth={2} aria-hidden />}
            error={errors.landmark?.message}
          />
        )} />

        <Controller name="phone" control={control} render={({ field }) => (
          <Input
            {...field}
            required
            type="tel"
            label={t("dashboard.address.phone")}
            placeholder={t("dashboard.address.phonePlaceholder")}
            leftIcon={<Phone size={14} strokeWidth={2} aria-hidden />}
            error={errors.phone?.message}
          />
        )} />

        <div>
          <FieldLabel required>{t("dashboard.address.saveAs")}</FieldLabel>
          <Controller name="label" control={control} render={({ field }) => (
            <Select
              value={field.value}
              onChange={(v) => field.onChange(v)}
              options={ADDRESS_LABELS.map((k) => ({ value: k, label: t(`dashboard.address.labels.${k}`) }))}
              placeholder={t("dashboard.address.saveAsPlaceholder")}
              leftIcon={<Star size={14} strokeWidth={2} aria-hidden />}
              required
            />
          )} />
          {errors.label?.message && (
            <p className="mt-1.5 text-xs text-danger">{errors.label.message}</p>
          )}
        </div>

        <Controller name="mapLink" control={control} render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            type="url"
            label={t("dashboard.address.mapLink")}
            placeholder="https://maps.google.com/…"
            /* Optional on purpose — see the note in `address.schema.ts`. */
            hint={t("dashboard.address.mapLinkHint")}
            error={errors.mapLink?.message}
          />
        )} />

        <Controller name="isDefault" control={control} render={({ field }) => (
          <Input
            type="checkbox"
            name={field.name}
            ref={field.ref}
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            label={t("dashboard.address.makeDefault")}
            hint={t("dashboard.address.makeDefaultHint")}
          />
        )} />

        <div className="flex gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" fullWidth disabled={busy} onClick={onClose} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button type="submit" fullWidth loading={busy} className="flex-1">
            {t(editing ? "dashboard.address.saveChanges" : "dashboard.address.addAddress")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
