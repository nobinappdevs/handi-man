"use client";

import { useCallback, useEffect, useId, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  ImagePlus,
  Layers,
  MapPin,
  Ruler,
  SearchX,
  Tag,
  Trash2,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { FieldLabel, Panel } from "@/components/dashboard/Panel";
import { DASH_ROUTES } from "@/components/dashboard/dashboardData";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/components/ui/cn";
import {
  useCreateService,
  useServiceFormOptions,
  useUpdateService,
  useVendorServiceDetail,
} from "@/hooks/useVendorServices";
import {
  BLANK_SERVICE_LISTING,
  DETAILS_MAX,
  detailsText,
  serviceCreateSchema,
  serviceUpdateSchema,
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
 * The add / edit service page - `serviceId` null adds, a number edits that
 * listing. A page rather than a dialog, as on the old web form: the
 * description is long-form rich text, and a modal is the wrong room for it.
 *
 * Three labelled steps (where, what, how it looks) rather than eight equal
 * fields. City depends on State and clears when the state changes. The
 * thumbnail previews in the card's own 1.6 aspect. The description is a full
 * rich-text editor; its HTML is what the API stores.
 *
 * Options (`/vendors/service/preview`) and the listing being edited
 * (`/vendors/service/edit`) load on mount. On edit the thumbnail is optional:
 * no new file keeps the current image, which is shown until one is chosen.
 * The request, the toast, the list refresh and the way back to the list all
 * live in the hooks.
 */
export function ServiceForm({ serviceId }: { serviceId: number | null }) {
  const { t } = useLang();
  const editing = serviceId !== null;
  const thumbInputId = useId();

  const { data: options, isLoading: optionsLoading } = useServiceFormOptions();
  const { data: current, isLoading: currentLoading } = useVendorServiceDetail(serviceId);
  const create = useCreateService();
  const update = useUpdateService();
  const busy = create.isPending || update.isPending;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceListingRequest>({
    resolver: zodResolver(editing ? serviceUpdateSchema : serviceCreateSchema),
    defaultValues: BLANK_SERVICE_LISTING,
  });

  /* Fill the form once the listing being edited arrives. */
  useEffect(() => {
    if (!current) return;
    reset({
      state: current.stateId,
      city: current.cityId,
      category: current.categoryId,
      name: current.name,
      item: current.item,
      price: current.price ? String(current.price) : "",
      thumbnail: undefined,
      details: current.detailsHtml,
    });
  }, [current, reset]);

  /* `useWatch`, not `watch()` — the React Compiler is on. */
  const state = useWatch({ control, name: "state" });
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const details = useWatch({ control, name: "details" });

  const cityOptions = useMemo(
    () => (options?.cities ?? []).filter((c) => c.stateId === state),
    [options, state],
  );

  /* An object URL, not a data URL: it is a pointer, so a 2MB image costs
     nothing to preview. A ref callback, not state set from an effect: the URL
     lives exactly as long as the <img> showing it, and the cleanup revokes it. */
  const previewRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !(thumbnail instanceof File)) return;
      const url = URL.createObjectURL(thumbnail);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [thumbnail],
  );

  const submit = (values: ServiceListingRequest) => {
    if (serviceId !== null) update.mutate({ id: serviceId, values });
    else create.mutate(values);
  };

  const loadingForm = editing && currentLoading;
  const optionPlaceholder = (key: string) => (optionsLoading ? t("common.loading") : t(key));
  const detailsLength = detailsText(details ?? "").length;

  const backLink = (
    <Link
      href={DASH_ROUTES.vendorServices}
      className="flex flex-none items-center gap-2 text-[13.5px] font-semibold text-muted transition-colors hover:text-brand"
    >
      <ArrowLeft size={15} strokeWidth={2.2} aria-hidden className="rtl:rotate-180" />
      {t("dashboard.vendor.services.backToList")}
    </Link>
  );

  /* An id that does not resolve - deleted, someone else's, or typed by hand. */
  if (editing && !currentLoading && !current) {
    return (
      <Panel className="flex flex-col items-center gap-3 px-6 py-[clamp(40px,6vw,72px)] text-center">
        <span className="flex h-14 w-14 items-center justify-center bg-brand/12 text-brand">
          <SearchX size={24} strokeWidth={1.6} aria-hidden />
        </span>
        <span className="text-[16px] font-semibold text-heading">{t("dashboard.vendor.services.notFound")}</span>
        <span className="max-w-[44ch] text-[13.5px] text-muted">{t("dashboard.vendor.services.notFoundHint")}</span>
        <div className="mt-2">{backLink}</div>
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-[clamp(16px,1.8vw,24px)]">
        <h2 className="text-[clamp(16px,1.7vw,19px)] leading-tight font-semibold tracking-[-0.02em]">
          {t(editing ? "dashboard.vendor.services.form.editTitle" : "dashboard.vendor.services.form.title")}
        </h2>
        {backLink}
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        aria-busy={loadingForm}
        className={cn(
          "flex flex-col gap-[clamp(20px,2.2vw,28px)] p-[clamp(16px,1.8vw,24px)] transition-opacity",
          loadingForm && "pointer-events-none opacity-50",
        )}
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
                  options={options?.states ?? []}
                  placeholder={optionPlaceholder("dashboard.vendor.services.form.statePlaceholder")}
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
                  disabled={!state || cityOptions.length === 0}
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
                  options={options?.categories ?? []}
                  placeholder={optionPlaceholder("dashboard.vendor.services.form.categoryPlaceholder")}
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

          <Controller
            name="item"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                required
                label={t("dashboard.vendor.services.form.unit")}
                placeholder={t("dashboard.vendor.services.form.itemPlaceholder")}
                leftIcon={<Ruler size={14} strokeWidth={2} aria-hidden />}
                hint={t("dashboard.vendor.services.form.itemHint")}
                error={errors.item?.message}
              />
            )}
          />

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
            <FieldLabel required={!editing}>{t("dashboard.vendor.services.form.thumbnail")}</FieldLabel>
            <Controller
              name="thumbnail"
              control={control}
              render={({ field }) => (
                <div
                  className={cn(
                    "flex flex-col gap-4 border border-dashed bg-surface p-[clamp(12px,1.6vw,18px)]",
                    errors.thumbnail ? "border-danger" : "border-border",
                  )}
                >
                  {/* Large, as on the old edit page - the photo is the first
                      thing a customer sees, so the vendor should see it at a
                      size they can judge. The card's own 1.6 aspect, so it is
                      cropped here exactly as the listing will be. The whole
                      preview is a drop-in "choose image" target too. */}
                  <label
                    htmlFor={thumbInputId}
                    className="group relative mx-auto flex aspect-[1.6] w-full max-w-[640px] cursor-pointer items-center justify-center overflow-hidden bg-sunk shadow-[0_14px_40px_-24px_rgba(0,0,0,0.45)]"
                  >
                    {thumbnail instanceof File ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a blob: object URL; next/image cannot take one
                      <img ref={previewRef} alt="" aria-hidden className="h-full w-full object-cover" />
                    ) : current?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
                      <img src={current.image} alt="" aria-hidden className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex flex-col items-center gap-2 text-muted">
                        <ImagePlus size={34} strokeWidth={1.5} aria-hidden />
                        <span className="text-[13.5px] font-semibold">
                          {t("dashboard.vendor.services.form.thumbnailChoose")}
                        </span>
                      </span>
                    )}
                    {(thumbnail instanceof File || current?.image) && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                        <span className="flex items-center gap-2 text-[13.5px] font-semibold">
                          <ImagePlus size={16} strokeWidth={2.2} aria-hidden />
                          {t("dashboard.vendor.services.form.thumbnailReplace")}
                        </span>
                      </span>
                    )}
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="min-w-0 max-w-full truncate text-[13.5px] font-semibold text-heading">
                        {field.value instanceof File
                          ? field.value.name
                          : t(
                              current?.image
                                ? "dashboard.vendor.services.form.thumbnailCurrent"
                                : "dashboard.vendor.services.form.thumbnailEmpty",
                            )}
                      </span>
                      <span className="text-[12.5px] leading-normal text-muted">
                        {t("dashboard.vendor.services.form.thumbnailHint")}
                      </span>
                    </span>

                    <span className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor={thumbInputId}
                        className="flex h-9 cursor-pointer items-center gap-2 border border-border bg-card px-3.5 text-[13px] font-semibold text-heading transition-colors hover:border-primary hover:text-brand"
                      >
                        <ImagePlus size={14} strokeWidth={2.2} aria-hidden />
                        {t(
                          field.value instanceof File || current?.image
                            ? "dashboard.vendor.services.form.thumbnailReplace"
                            : "dashboard.vendor.services.form.thumbnailChoose",
                        )}
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
                  </div>

                  <input
                    id={thumbInputId}
                    type="file"
                    accept={THUMBNAIL_TYPES.join(",")}
                    className="sr-only"
                    /* `value` is deliberately not bound — a file input's value
                       cannot be set programmatically, and RHF holds the File. */
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </div>
              )}
            />
            {errors.thumbnail?.message && (
              <p className="mt-1.5 text-xs text-danger">{String(errors.thumbnail.message)}</p>
            )}
          </div>

          <div>
            <FieldLabel required>{t("dashboard.vendor.services.form.details")}</FieldLabel>
            <Controller
              name="details"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label={t("dashboard.vendor.services.form.details")}
                  placeholder={t("dashboard.vendor.services.form.detailsPlaceholder")}
                  invalid={Boolean(errors.details)}
                  footer={
                    <span className="flex items-center justify-between gap-3 text-[12.5px]">
                      <span className="inline">{t("dashboard.vendor.services.form.detailsHint")}</span>
                      <span className={cn("inline tabular-nums", detailsLength > DETAILS_MAX && "text-danger")}>
                        {detailsLength} / {DETAILS_MAX}
                      </span>
                    </span>
                  }
                />
              )}
            />
            {errors.details?.message && <p className="mt-1.5 text-xs text-danger">{errors.details.message}</p>}
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="flex flex-col gap-3 border-t border-border pt-5 min-[560px]:flex-row min-[560px]:items-center">
          <p className="min-w-0 flex-auto text-[12.5px] leading-[1.5] text-muted">
            {t("dashboard.vendor.services.form.reviewNote")}
          </p>
          <div className="flex flex-none gap-3">
            <Link
              href={DASH_ROUTES.vendorServices}
              aria-disabled={busy}
              className={cn(
                "inline-flex h-11 items-center justify-center border border-border bg-card px-5 text-sm font-semibold text-heading transition hover:border-primary/50 hover:text-primary",
                busy && "pointer-events-none opacity-50",
              )}
            >
              {t("common.cancel")}
            </Link>
            <Button type="submit" loading={busy}>
              {t(editing ? "dashboard.vendor.services.form.save" : "dashboard.vendor.services.form.submit")}
            </Button>
          </div>
        </div>
      </form>
    </Panel>
  );
}
