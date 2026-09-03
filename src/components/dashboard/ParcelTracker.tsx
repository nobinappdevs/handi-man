"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { PARCEL } from "@/components/dashboard/dashboardData";

/**
 * The one dark panel in the light theme, and it stays dark in both — `bg-rail`,
 * not `bg-invert`, for the same reason the home page's support band uses `bg-ink`.
 * `bg-rail` over `bg-ink` because it goes DARKER in dark mode: `--ink` is the
 * dark page colour, so an ink panel on a dark page has no edge at all.
 *
 * Everything inside is therefore a fixed white/alpha, not a theme token: the
 * panel's ground never changes, so an ink that flipped with the theme would be
 * white-on-white half the time.
 */
export function ParcelTracker() {
  const { t } = useLang();
  const last = PARCEL.steps.length - 1;

  return (
    <section className="relative overflow-hidden bg-rail p-[clamp(18px,1.9vw,24px)]">
      <div aria-hidden className="absolute inset-y-0 -right-10 w-30 skew-x-[-13deg] bg-primary opacity-85" />
      <div aria-hidden className="absolute inset-y-0 right-14 w-0.5 skew-x-[-13deg] bg-white/16" />

      <div className="relative flex flex-col gap-4">
        <span className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[0.13em] text-primary-on-dark uppercase">
            {t("dashboard.tracker.eyebrow")}
          </span>
          <span className="text-[12px] font-medium tracking-[0.14em] text-white/60 uppercase">
            {PARCEL.ref}
          </span>
        </span>

        <span className="flex flex-col gap-[5px]">
          <span className="text-[clamp(20px,2.1vw,26px)] leading-[1.08] font-semibold tracking-[-0.03em] text-white">
            {PARCEL.route}
          </span>
          <span className="text-[13.5px] font-normal text-white/65">
            {t("dashboard.tracker.rider")} {PARCEL.rider} · {t("dashboard.tracker.arriving")}{" "}
            {PARCEL.eta}
          </span>
        </span>

        <div className="mt-0.5 flex flex-col">
          {PARCEL.steps.map(({ key, time, state }, i) => (
            <span key={key} className="grid grid-cols-[22px_minmax(0,1fr)] gap-3">
              <span className="relative flex justify-center">
                {/* Connector, not a border: it has to start below the dot and
                    run past the label's padding into the next row. */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-3.5 -bottom-1 w-[1.5px]",
                    i === last ? "bg-transparent" : state === "done" ? "bg-white/40" : "bg-white/16",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "relative mt-[5px] rounded-full",
                    state === "now"
                      ? "h-[11px] w-[11px] bg-primary-on-dark shadow-[0_0_0_4px_rgba(255,255,255,0.16)]"
                      : "h-2 w-2",
                    state === "done" && "bg-white",
                    state === "next" && "bg-white/28",
                  )}
                />
              </span>

              <span className="flex flex-col gap-0.5 pb-4">
                <span
                  className={cn(
                    "text-[14.5px]",
                    state === "now" ? "font-semibold" : "font-medium",
                    state === "next" ? "text-white/55" : "text-white",
                  )}
                >
                  {t(`dashboard.tracker.steps.${key}`)}
                </span>
                <span className="text-[11.5px] font-medium tracking-[0.14em] text-white/40 uppercase">
                  {time}
                </span>
              </span>
            </span>
          ))}
        </div>

        <Link
          href="/dashboard/deliveries"
          className="flex h-11 items-center justify-center gap-[9px] bg-white text-[13.5px] font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-primary-on-dark"
        >
          {t("dashboard.tracker.track")}
          <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
