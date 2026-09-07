"use client";

import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import type { Kpi } from "@/components/dashboard/dashboardData";

/**
 * The four-up stat row at the top of a dashboard. Shared by the customer
 * overview and the vendor one — same design, different numbers, so `ns` says
 * which i18n branch holds the labels.
 *
 * One row of four cells divided by hairlines, no cell dressed differently from
 * its neighbours. The earlier version gave the balance a dark ground and a
 * skewed plum wedge, put every figure behind a filled icon tile, and hung a
 * progress bar under each: four competing emphases in a strip whose whole job
 * is to let four numbers be compared at a glance. The number is the emphasis
 * now — everything around it is muted, and the only colour left is the delta,
 * which is the one thing on the card that carries meaning.
 *
 * Below 1100px the row stacks into two columns and then one; the dividers are
 * drawn by the grid gap, so they follow it without a rule per breakpoint.
 */
export function KpiGrid({ items, ns }: { items: Kpi[]; ns: string }) {
  const { t } = useLang();

  return (
    /* `gap-px` over `bg-border` draws the dividers, so a cell never doubles a
       line against the outer frame and every breakpoint gets the right ones
       without a rule per column. */
    <div className="grid grid-cols-1 gap-px border border-border bg-border min-[620px]:grid-cols-2 min-[1100px]:grid-cols-4">
      {items.map(({ key, value, unit, trend, icon: Icon }) => (
        <div
          key={key}
          className="flex min-w-0 flex-col gap-4 bg-card p-[clamp(18px,1.9vw,26px)]"
        >
          <span className="flex items-center gap-2.5 text-muted">
            <Icon size={16} strokeWidth={1.9} aria-hidden className="flex-none" />
            <span className="min-w-0 truncate text-[13.5px] font-normal">
              {t(`${ns}.${key}.label`)}
            </span>
          </span>

          <span className="flex items-baseline gap-1.5">
            <span className="text-[clamp(27px,2.7vw,34px)] leading-none font-semibold tracking-[-0.03em] text-heading">
              {value}
            </span>
            {unit && <span className="text-[14px] font-normal text-muted">{unit}</span>}
          </span>

          {/* Vendor cards carry a delta and a note; the customer's four do not,
              and an empty block would leave their cells short. */}
          {trend && (
            <span className="flex min-w-0 flex-col gap-1">
              {trend.delta && (
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    trend.tone === "ok" ? "text-ok" : "text-brand",
                  )}
                >
                  {trend.delta} {t(`${ns}.${key}.delta`)}
                </span>
              )}
              <span className="text-[12.5px] leading-[1.45] font-normal text-muted">
                {t(`${ns}.${key}.note`)}
              </span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
