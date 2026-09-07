"use client";

import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { PARCEL } from "@/components/dashboard/dashboardData";

/**
 * The live parcel, as an ordinary card.
 *
 * It used to be the one near-black panel on a light page, with two skewed plum
 * wedges across it and every value hard-coded to a white alpha so it survived
 * the inverted ground. That made a side-column widget the heaviest object on
 * the overview — louder than the four figures the page is actually about. It
 * is the same `border-border` + `bg-card` surface as the table and the charts
 * now, so the column reads as one set, and every colour in it is a token
 * again, which means dark mode needs nothing special.
 */
export function ParcelTracker() {
  const { t } = useLang();
  const last = PARCEL.steps.length - 1;

  return (
    <section className="border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-[clamp(18px,1.9vw,24px)] py-3.5">
        <span className="text-[13.5px] font-medium text-heading">
          {t("dashboard.tracker.eyebrow")}
        </span>
        <span className="text-[12.5px] font-normal text-muted">{PARCEL.ref}</span>
      </div>

      <div className="flex flex-col gap-5 p-[clamp(18px,1.9vw,24px)]">
        <span className="flex flex-col gap-1">
          <span className="text-[17px] leading-[1.25] font-semibold tracking-[-0.02em] text-heading">
            {PARCEL.route}
          </span>
          <span className="text-[13px] font-normal text-muted">
            {t("dashboard.tracker.rider")} {PARCEL.rider} · {t("dashboard.tracker.arriving")}{" "}
            {PARCEL.eta}
          </span>
        </span>

        <div className="flex flex-col">
          {PARCEL.steps.map(({ key, time, state }, i) => (
            <span key={key} className="grid grid-cols-[16px_minmax(0,1fr)] gap-3">
              <span className="relative flex justify-center">
                {/* Connector, not a border: it has to start below the dot and
                    run past the label's padding into the next row. */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-3 -bottom-1 w-px",
                    i === last ? "bg-transparent" : state === "done" ? "bg-brand/40" : "bg-border",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "relative mt-[6px] rounded-full",
                    state === "now"
                      ? "h-2.5 w-2.5 bg-primary ring-4 ring-primary/15"
                      : "h-1.5 w-1.5",
                    state === "done" && "bg-brand/50",
                    state === "next" && "bg-border",
                  )}
                />
              </span>

              <span className="flex flex-col gap-0.5 pb-4">
                <span
                  className={cn(
                    "text-[14px]",
                    state === "now" ? "font-medium text-heading" : "font-normal",
                    state === "next" ? "text-muted" : "text-body",
                  )}
                >
                  {t(`dashboard.tracker.steps.${key}`)}
                </span>
                <span className="text-[12.5px] font-normal text-muted">{time}</span>
              </span>
            </span>
          ))}
        </div>

        <Link
          href="/dashboard/deliveries"
          className="flex h-10 items-center justify-center border border-border text-[13.5px] font-medium text-heading transition-colors hover:border-primary hover:text-brand"
        >
          {t("dashboard.tracker.track")}
        </Link>
      </div>
    </section>
  );
}
