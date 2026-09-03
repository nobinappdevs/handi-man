"use client";

import type { LucideIcon } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";

export type KpiCell = {
  key: string;
  value: string;
  delta: string;
  deltaTone: "brand" | "ok";
  pct: number;
  icon: LucideIcon;
};

/**
 * The four-up stat row at the top of a dashboard. Shared by the customer
 * overview and the vendor one — same design, different numbers, so `ns` says
 * which i18n branch holds the labels.
 *
 * The design draws one row with a divider between each and says nothing about
 * the stacked case; `border-b` below 1100px is the responsive half of that,
 * without which the cells run together into one unreadable column on a phone.
 */
export function KpiGrid({ items, ns }: { items: KpiCell[]; ns: string }) {
  const { t } = useLang();

  return (
    <div className="grid grid-cols-1 border border-border bg-card min-[620px]:grid-cols-2 min-[1100px]:grid-cols-4">
      {items.map(({ key, value, delta, deltaTone, pct, icon: Icon }) => (
        <div
          key={key}
          className="relative flex min-w-0 flex-col gap-3 overflow-hidden border-e border-b border-border p-[clamp(18px,1.8vw,24px)] min-[1100px]:border-b-0"
        >
          <span className="flex items-center justify-between gap-2.5 text-[12px] font-medium tracking-[0.12em] text-muted uppercase">
            {t(`${ns}.${key}.label`)}
            <Icon size={15} strokeWidth={2} aria-hidden className="flex-none text-brand opacity-85" />
          </span>

          <span className="flex items-baseline gap-[9px]">
            <span className="text-[clamp(30px,3.2vw,42px)] leading-[0.9] font-semibold tracking-[-0.04em] text-heading">
              {value}
            </span>
            <span
              className={cn(
                "text-[12.5px] font-medium tracking-[0.1em] whitespace-nowrap uppercase",
                deltaTone === "ok" ? "text-ok" : "text-brand",
              )}
            >
              {delta} {t(`${ns}.${key}.delta`)}
            </span>
          </span>

          <span className="block h-1 bg-sunk">
            <span className="block h-full bg-primary" style={{ width: `${pct}%` }} />
          </span>

          <span className="text-[12.8px] leading-[1.4] font-normal text-muted">
            {t(`${ns}.${key}.note`)}
          </span>
        </div>
      ))}
    </div>
  );
}
