"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeDollarSign,
  ImagePlus,
  Layers,
  MapPin,
  Ruler,
  Tag,
  Trash2,
  Wrench,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Modal } from "@/components/dashboard/Modal";
import { FieldLabel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/components/ui/cn";
import {
  citiesIn,
  SERVICE_CATEGORY_KEYS,
  SERVICE_REGIONS,
} from "@/components/dashboard/page/vendor/vendorData";
import {
  BLANK_SERVICE_LISTING,
  DETAILS_MAX,
  serviceListingSchema,
  SERVICE_UNITS,
  THUMBNAIL_TYPES,
  type ServiceListingRequest,
} from "@/schemas/service.schema";

/** A labelled band, so eight fields read as three short questions. */
function Section({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 flex-none items-center justify-center bg-brand/14 font-display text-[12px] font-bold text-brand tabular-nums">
          {step}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">{title}</span>
          <span className="text-[12.5px] leading-[1.5] text-muted">{hint}</span>
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 min-[760px]:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * Add a service listing.
 *
 * ── What this redesign changes, and why ──
 *
 *  1. **Three labelled steps, not one grey slab.** Where you work, what you
 *     are selling, how it looks. The old screen stacked eight equal-weight
 *     fields with no grouping, so nothing told you how much was left.
 *  2. **City depends on State.** It was a free-standing dropdown, which
 *     happily allowed "Denver, Alaska". It is disabled until a state is
 *     chosen and clears itself if the state changes.
 *  3. **The billing unit is a list.** The old "Item*" was a text box hinting
 *     "Enter days,houes,week,piece,rooms etc" — free text there is how a
 *     catalogue ends up with "day", "Days" and "per day" as three units that
 *     cannot be grouped or sorted.
 *  4. **Price says what currency it is in.** The old one just said "Enter
 *     Price".
 *  5. **The thumbnail has a preview.** A bare "Choose File / No file chosen"
 *     tells you nothing about what you picked, its size, or whether it is the
 *     right shape. This shows the image in the card's own 1.6 aspect, names
 *     it, and can drop it again.
 *  6. **The description is a textarea with a counter**, not a 30-button rich
 *     text toolbar. Subscript, superscript, tables, special characters and a
 *     "Source" HTML view on a service description is a liability, not a
 *     feature: it lets vendors paste markup into a page you have to render.
 *  7. **The submit button is not labelled "Saved ✓"** at rest, which is what
 *     the old one did — a past-tense success state as the resting label of an
 *     action you have not taken yet. There is also a Cancel, which there was
 *     not.
 *
 * Validation is local (Zod + RHF). Wire the mutation in when the endpoint
 * exists — the toast, the close and `invalidateQueries` belong in that hook,
 * not here. Note the thumbnail makes it `multipart/form-data`.
 */
export function ServiceDialog({
  open,
  busy = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: ServiceListingRequest) => void;
}) {
  const { t } = useLang();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceListingRequest>({
    resolver: zodResolver(serviceListingSchema),
    /* `as` because the blank form leaves `unit` and `thumbnail` genuinely
       unset — see the note on `BLANK_SERVICE_LISTING`. */
    defaultValues: BLANK_SERVICE_LISTING as unknown as ServiceListingRequest,
  });

  /* Refill on every open, not just on mount: the dialog stays mounted between
     uses, so without this it would still be showing the last attempt. */
  useEffect(() => {
    if (!open) return;
    reset(BLANK_SERVICE_LISTING as unknown as ServiceListingRequest);
  }, [open, reset]);

  /* `useWatch`, not `watch()` — the React Compiler is on. */
  const state = useWatch({ control, name: "state" });
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const details = useWatch({ control, name: "details" });

  const cityOptions = useMemo(
    () => citiesIn(state ?? "").map((c) => ({ value: c, label: c })),
    [state],
  );

  /* An object URL, not a data URL: it is a pointer, so a 2MB image costs
     nothing to preview. It must be revoked or the blob leaks for the life of
     the document. */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(thumbnail instanceof File)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(thumbnail);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  const detailsLength = (details ?? "").length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={busy}
      size="xl"
      labelledBy="service-dialog-title"
      icon={<Wrench size={17} strokeWidth={2.2} aria-hidden />}
      title={t("dashboard.vendor.services.form.title")}
    >
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-[clamp(20px,2.2vw,28px)] p-[clamp(16px,1.8vw,24px)]"
      >
        {/* ── 1 · Where ── */}
        <Section
          step="01"
          title={t("dashboard.vendor.services.form.whereTitle")}
          hint={t("dashboard.vendor.services.form.whereHint")}
        >
          <div>
            <FieldLabel required>{t("dashboard.vendor.services.form.state")}</FieldLabel>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    /* The old city is almost certainly not in the new state,
                       so clear it rather than leave an impossible pair. */
                    setValue("city", "", { shouldValidate: false });
                  }}
                  options={SERVICE_REGIONS.map((r) => ({ value: r.state, label: r.state }))}
                  placeholder={t("dashboard.vendor.services.form.statePlaceholder")}
                  leftIcon={<MapPin size={14} strokeWidth={2} aria-hidden />}
                  required
                />
              )}
            />
            {errors.state?.message && (
              <p className="mt-1.5 text-xs text-danger">{errors.state.message}</p>
            )}
          </div>

          <div>
            <FieldLabel required>{t("dashboard.vendor.services.form.city")}</FieldLabel>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  options={cityOptions}
                  disabled={!state}
                  placeholder={t(
                    state
                      ? "dashboard.vendor.services.form.cityPlaceholder"
                      : "dashboard.vendor.services.form.cityLocked",
                  )}
                  leftIcon={<MapPin size={14} strokeWidth={2} aria-hidden />}
                  required
                />
              )}
            />
            {errors.city?.message && (
              <p className="mt-1.5 text-xs text-danger">{errors.city.message}</p>
            )}
          </div>
        </Section>

        {/* ── 2 · What ── */}
        <Section
          step="02"
          title={t("dashboard.vendor.services.form.whatTitle")}
          hint={t("dashboard.vendor.services.form.whatHint")}
        >
          <div>
            <FieldLabel required>{t("dashboard.vendor.services.form.category")}</FieldLabel>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  options={SERVICE_CATEGORY_KEYS.map((k) => ({
                    value: k,
                    label: t(`home.categories.items.${k}`),
                  }))}
                  placeholder={t("dashboard.vendor.services.form.categoryPlaceholder")}
                  leftIcon={<Layers size={14} strokeWidth={2} aria-hidden />}
                  required
                />
              )}
            />
            {errors.category?.message && (
              <p className="mt-1.5 text-xs text-danger">{errors.category.message}</p>
            )}
          </div>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                required
                label={t("dashboard.vendor.services.form.name")}
                placeholder={t("dashboard.vendor.services.form.namePlaceholder")}
                leftIcon={<Tag size={14} strokeWidth={2} aria-hidden />}
                error={errors.name?.message}
              />
            )}
          />

          <div>
            <FieldLabel required>{t("dashboard.vendor.services.form.unit")}</FieldLabel>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                  options={SERVICE_UNITS.map((u) => ({
                    value: u,
                    label: t(`dashboard.vendor.services.form.units.${u}`),
                  }))}
                  placeholder={t("dashboard.vendor.services.form.unitPlaceholder")}
                  leftIcon={<Ruler size={14} strokeWidth={2} aria-hidden />}
                  required
                />
              )}
            />
            {errors.unit?.message && (
              <p className="mt-1.5 text-xs text-danger">{errors.unit.message}</p>
            )}
          </div>

          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                required
                inputMode="decimal"
                label={t("dashboard.vendor.services.form.price")}
                placeholder="0.00"
                leftIcon={<BadgeDollarSign size={14} strokeWidth={2} aria-hidden />}
                rightIcon={
                  <span className="inline text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
                    {t("dashboard.vendor.services.form.currency")}
                  </span>
                }
                hint={t("dashboard.vendor.services.form.priceHint")}
                error={errors.price?.message}
              />
            )}
          />
        </Section>

        {/* ── 3 · How it looks ──
            One column: the thumbnail is wide and the description is tall, so
            pairing them side by side would leave one of them stranded. */}
        <section className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center bg-brand/14 font-display text-[12px] font-bold text-brand tabular-nums">
              03
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">
                {t("dashboard.vendor.services.form.lookTitle")}
              </span>
              <span className="text-[12.5px] leading-[1.5] text-muted">
                {t("dashboard.vendor.services.form.lookHint")}
              </span>
            </span>
          </div>

          <div>
            <FieldLabel required>{t("dashboard.vendor.services.form.thumbnail")}</FieldLabel>
            <Controller
              name="thumbnail"
              control={control}
              render={({ field }) => (
                <div
                  className={cn(
                    "flex flex-col gap-3 border bg-surface p-3 min-[560px]:flex-row min-[560px]:items-center",
                    errors.thumbnail ? "border-danger" : "border-border",
                  )}
                >
                  {/* The card's own 1.6 aspect, so what you see here is what
                      the listing will crop to. */}
                  <span className="relative flex aspect-[1.6] w-full flex-none items-center justify-center overflow-hidden bg-sunk min-[560px]:w-[176px]">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a blob: object URL; next/image cannot take one
                      <img
                        src={previewUrl}
                        alt=""
                        aria-hidden
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={22} strokeWidth={1.8} aria-hidden className="text-muted" />
                    )}
                  </span>

                  <span className="flex min-w-0 flex-auto flex-col items-start gap-2">
                    <span className="min-w-0 max-w-full truncate text-[13.5px] font-semibold text-heading">
                      {field.value instanceof File
                        ? field.value.name
                        : t("dashboard.vendor.services.form.thumbnailEmpty")}
                    </span>
                    <span className="text-[12.5px] leading-[1.5] text-muted">
                      {t("dashboard.vendor.services.form.thumbnailHint")}
                    </span>

                    <span className="flex flex-wrap items-center gap-2">
                      <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-[13px] font-semibold text-heading transition-colors hover:border-primary hover:text-brand">
                        <ImagePlus size={14} strokeWidth={2.2} aria-hidden />
                        {t(
                          field.value instanceof File
                            ? "dashboard.vendor.services.form.thumbnailReplace"
                            : "dashboard.vendor.services.form.thumbnailChoose",
                        )}
                        <input
                          type="file"
                          accept={THUMBNAIL_TYPES.join(",")}
                          className="sr-only"
                          /* `value` is deliberately not bound — a file input's
                             value cannot be set programmatically, and RHF
                             holds the File. */
                          name={field.name}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                      </label>

                      {field.value instanceof File && (
                        <button
                          type="button"
                          onClick={() => field.onChange(undefined)}
                          className="flex h-9 cursor-pointer items-center gap-2 px-2.5 text-[13px] font-semibold text-muted transition-colors hover:text-danger"
                        >
                          <Trash2 size={14} strokeWidth={2.2} aria-hidden />
                          {t("dashboard.vendor.services.form.thumbnailRemove")}
                        </button>
                      )}
                    </span>
                  </span>
                </div>
              )}
            />
            {errors.thumbnail?.message && (
              <p className="mt-1.5 text-xs text-danger">{String(errors.thumbnail.message)}</p>
            )}
          </div>

          <Controller
            name="details"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="textarea"
                rows={6}
                required
                label={t("dashboard.vendor.services.form.details")}
                placeholder={t("dashboard.vendor.services.form.detailsPlaceholder")}
                error={errors.details?.message}
                /* The counter replaces the hint rather than sitting beside it:
                   `Input` shows one description line, and how much room is
                   left is the more useful of the two once you are typing. */
                hint={
                  <span className="inline tabular-nums">
                    {detailsLength} / {DETAILS_MAX}
                  </span>
                }
              />
            )}
          />
        </section>

        {/* ── Footer ── */}
        <div className="flex flex-col gap-3 border-t border-border pt-5 min-[560px]:flex-row min-[560px]:items-center">
          <p className="min-w-0 flex-auto text-[12.5px] leading-[1.5] text-muted">
            {t("dashboard.vendor.services.form.reviewNote")}
          </p>
          <div className="flex flex-none gap-3">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={busy}>
              {t("dashboard.vendor.services.form.submit")}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
