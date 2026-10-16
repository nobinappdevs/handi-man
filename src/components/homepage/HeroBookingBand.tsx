"use client";

import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLang } from "@/hooks/useLang";
import { useSearchLocations, useServiceSearchSubmit } from "@/hooks/useServiceSearch";
import { serviceSearchSchema, type ServiceSearchRequest } from "@/schemas/search.schema";
import { Select, type SelectOption } from "@/components/ui/Select";

/* The band's fields are square and light in both themes by design, so they use
   the `field-*` tokens rather than the page surfaces. The selects share the
   input's 46px box so both rows line up. */
const FIELD =
  "h-[46px] w-full border border-field-line bg-field px-3.5 text-[14.5px] font-medium text-field-ink outline-none transition-colors placeholder:text-muted focus:border-primary";

const SELECT_SKIN =
  "h-[46px] border border-field-line bg-field px-3.5 text-[14.5px] font-semibold text-field-ink hover:border-primary/50 focus-visible:border-primary";

/**
 * The support + service-search band that straddles the hero and the section
 * below it: state → city → keyword, the same three filters `GET /service/search`
 * takes.
 *
 * States and cities come from `GET /service/search-get`. The city list belongs
 * to the chosen state, so changing the state clears the city - a city from the
 * previous state would otherwise ride along into a search it cannot match.
 * Submitting navigates to `/services` with the filters in the URL; the hook
 * owns that navigation.
 */
export function HeroBookingBand() {
  const { t } = useLang();
  const { data: locations = [], isLoading } = useSearchLocations();
  const submitSearch = useServiceSearchSubmit();

  const { control, handleSubmit, setValue } = useForm<ServiceSearchRequest>({
    resolver: zodResolver(serviceSearchSchema),
    defaultValues: { state: "", city: "", search: "" },
  });

  const stateId = useWatch({ control, name: "state" });
  const cities = locations.find((s) => s.id === stateId)?.cities ?? [];

  const stateOptions: SelectOption[] = locations.map((s) => ({ value: s.id, label: s.name }));
  const cityOptions: SelectOption[] = cities.map((c) => ({ value: c.id, label: c.name }));

  const loadingText = t("common.loading");

  return (
    <div className="relative z-[6] mx-auto max-w-[1440px] translate-y-0 px-[clamp(18px,3vw,44px)] mid:translate-y-[42%]">
      {/*
        The entrance is on this inner grid, never on the wrapper above it: the
        wrapper carries `mid:translate-y-[42%]`, the negative-offset trick that
        straddles the band across the hero seam, and an animated transform there
        would override that class and drop the band flush. `.enter-group`
        cascades its two panels instead.
      */}
      <div className="enter-group grid grid-cols-1 items-stretch  wide:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] [--enter-delay:0.5s]">
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
            className="pointer-events-none absolute inset-y-0 -right-10 hidden w-20 skew-x-[-13deg] bg-form wide:block rtl:right-auto rtl:-left-10 rtl:skew-x-13"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-6 hidden w-4 skew-x-[-13deg] bg-ink wide:block rtl:right-auto rtl:left-6 rtl:skew-x-13"
          />
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(submitSearch)}
          className="flex flex-col gap-3 bg-form px-[clamp(16px,2.2vw,28px)] py-[clamp(18px,2.2vw,22px)]"
        >
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="search"
                aria-label={t("home.hero.searchLabel")}
                placeholder={t("home.hero.searchPlaceholder")}
                className={FIELD}
              />
            )}
          />

          <div className="flex flex-wrap gap-2.5">
            <div className="min-w-37.5 flex-[1_1_150px]">
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("city", "");
                    }}
                    options={stateOptions}
                    placeholder={isLoading ? loadingText : t("home.hero.statePlaceholder")}
                    aria-label={t("home.hero.stateLabel")}
                    searchable
                    skin={SELECT_SKIN}
                  />
                )}
              />
            </div>

            {/* `group` on the wrapper, not the trigger: a disabled button is not
                a reliable mouse target across browsers, but CSS `:hover` on its
                parent still is. The hint only exists while no state is chosen. */}
            <div className="group relative min-w-37.5 flex-[1_1_150px]">
              {!stateId && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap bg-ink px-3 py-1.5 text-[13px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                >
                  {t("home.hero.cityNeedsState")}
                  <span
                    aria-hidden
                    className="absolute top-full left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-ink"
                  />
                </span>
              )}
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    options={cityOptions}
                    placeholder={isLoading ? loadingText : t("home.hero.cityPlaceholder")}
                    aria-label={t("home.hero.cityLabel")}
                    disabled={!stateId || cityOptions.length === 0}
                    searchable
                    skin={SELECT_SKIN}
                  />
                )}
              />
            </div>

            <button
              type="submit"
              className="h-[46px] min-w-37.5 flex-[1_1_165px] cursor-pointer bg-primary font-display text-[14.5px] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:bg-primary-dark"
            >
              {t("home.hero.searchSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
