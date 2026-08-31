"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { quickBookingSchema, type QuickBookingRequest } from "@/schemas/booking.schema";
import { CITIES, SERVICE_KEYS } from "@/components/homepage/homeData";
import { cn } from "@/components/ui/cn";

type Option = { value: string; label: string };

/* The band's fields are square and light in both themes by design, so they use
   the `field-*` tokens rather than the page surfaces. */
const FIELD =
  "h-[46px] min-w-0 flex-[1_1_150px] border bg-field px-3.5 text-[14.5px] font-medium text-field-ink outline-none transition-colors placeholder:text-muted focus:border-primary";

/**
 * The support + quick-request band that straddles the hero and the section
 * below it. Validation is local (Zod + RHF); on submit the button switches to
 * its "sent" label, exactly as the design specifies. Wire the mutation in when
 * the booking endpoint exists — the toast and navigation belong in that hook,
 * not here.
 */
export function HeroBookingBand() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  const cityOptions: Option[] = CITIES.map((c) => ({ value: c, label: c }));
  const serviceOptions: Option[] = SERVICE_KEYS.map((key) => ({
    value: key,
    label: t(`home.services.${key}`),
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickBookingRequest>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: { name: "", email: "", city: CITIES[0], service: SERVICE_KEYS[0] },
  });

  const onSubmit = () => setSent(true);

  return (
    <div className="relative z-[6] mx-auto max-w-[1440px] translate-y-0 px-[clamp(18px,3vw,44px)] mid:translate-y-[42%]">
      <div className="grid grid-cols-1 items-stretch shadow-[0_34px_70px_-40px_rgba(0,0,0,0.55)] wide:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="relative flex items-center overflow-hidden bg-[linear-gradient(120deg,rgb(var(--primary-lite))_0%,rgb(var(--primary__color))_45%,rgb(var(--primary-dark))_100%)] px-[clamp(16px,2.4vw,34px)] py-[clamp(20px,2.4vw,26px)] wide:pe-[clamp(56px,5.5vw,84px)]">
          <p className="relative z-2 text-[clamp(16px,1.5vw,21px)] font-bold leading-[1.3] text-white">
            {t("home.hero.supportText")}{" "}
            <span className="inline text-primary-on-dark">{t("home.hero.supportPhone")}</span>
          </p>

          {/*
            Angled hand-off into the form panel: the gradient is cut on a
            diagonal, and a dark blade sits on that cut.

            Both layers carry the SAME `skew-x-[-13deg]` and the same height, so
            skewX shifts them by an identical amount at every y — their leading
            edges stay exactly parallel no matter how tall the band gets (the
            copy wrapping to two lines, a longer translation). The parent's
            `overflow-hidden` is what trims the cut off at the cell boundary, so
            the form panel beside it is never touched.

            -13deg matches the hero's wedge seam above.
          */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -right-10 hidden w-20 skew-x-[-13deg] bg-form wide:block"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-6 hidden w-4 skew-x-[-13deg] bg-ink wide:block"
          />
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 bg-form px-[clamp(16px,2.2vw,28px)] py-[clamp(18px,2.2vw,22px)]"
        >
          <div className="flex flex-wrap gap-2.5">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  aria-label={t("home.hero.namePlaceholder")}
                  aria-invalid={errors.name ? true : undefined}
                  placeholder={t("home.hero.namePlaceholder")}
                  onChange={(e) => {
                    field.onChange(e);
                    setSent(false);
                  }}
                  className={cn(FIELD, errors.name ? "border-red-500" : "border-field-line")}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  aria-label={t("home.hero.emailPlaceholder")}
                  aria-invalid={errors.email ? true : undefined}
                  placeholder={t("home.hero.emailPlaceholder")}
                  onChange={(e) => {
                    field.onChange(e);
                    setSent(false);
                  }}
                  className={cn(FIELD, errors.email ? "border-red-500" : "border-field-line")}
                />
              )}
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <BandSelect
              name="city"
              control={control}
              label={t("home.hero.cityLabel")}
              options={cityOptions}
              onPick={() => setSent(false)}
            />
            <BandSelect
              name="service"
              control={control}
              label={t("home.hero.serviceLabel")}
              options={serviceOptions}
              onPick={() => setSent(false)}
            />
            <button
              type="submit"
              className="h-[46px] min-w-[150px] flex-[1_1_165px] cursor-pointer bg-primary font-display text-[14.5px] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:bg-ink"
            >
              {t(sent ? "home.hero.bookSent" : "home.hero.bookNow")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Native select, kept deliberately: the band's square 46px field is a distinct
   design element, and the app's portal `Select` carries a different shape. */
function BandSelect({
  name,
  control,
  label,
  options,
  onPick,
}: {
  name: "city" | "service";
  control: ReturnType<typeof useForm<QuickBookingRequest>>["control"];
  label: string;
  options: Option[];
  onPick: () => void;
}) {
  return (
    <label className="relative flex h-[46px] min-w-[150px] flex-[1_1_150px] items-center border border-field-line bg-field px-3.5">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            aria-label={label}
            onChange={(e) => {
              field.onChange(e);
              onPick();
            }}
            className="w-full cursor-pointer appearance-none border-0 bg-transparent pe-4 text-[14.5px] font-semibold text-field-ink outline-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      <ChevronDown
        size={12}
        strokeWidth={2.6}
        aria-hidden
        className="pointer-events-none absolute end-3 text-muted"
      />
    </label>
  );
}
