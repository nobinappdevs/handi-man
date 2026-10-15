"use client";

import type { ReactNode } from "react";

/**
 * The hover card for every dashboard chart.
 *
 * Recharts' default renderer was doing two things wrong here:
 *
 *   1. It lays each row out as three inline spans — name, " : ", value — which
 *      wrap independently. In a narrow card that turned one row into three
 *      lines and made the card a tall column.
 *   2. In a ComposedChart, `<Scatter>` reports the whole data point, so the
 *      x-axis key rode along and the card grew a nonsense "label : 15" row
 *      under the real figures.
 *
 * So the rows are drawn here instead: one line each, name and value on opposite
 * ends, and anything that is not a plotted series filtered out.
 */

type TooltipEntry = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

export function ChartTooltip({
  active,
  payload,
  label,
  /** Keys that are axis plumbing rather than a series — never shown. */
  exclude = ["label"],
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: ReactNode;
  exclude?: string[];
}) {
  if (!active || !payload?.length) return null;

  const rows = payload.filter(
    (entry) => entry.dataKey !== undefined && !exclude.includes(String(entry.dataKey)),
  );
  if (rows.length === 0) return null;

  return (
    <div className="min-w-[130px] border border-border bg-card px-3 py-2 shadow-[0_18px_36px_-18px_rgba(18,16,15,0.55)]">
      <p className="mb-1.5 text-[11px] font-bold tracking-[0.08em] text-muted uppercase tabular-nums">
        {label}
      </p>
      {rows.map((entry) => (
        <p
          key={String(entry.dataKey)}
          /* One line per series: the swatch and name hold the left, the figure
             is pushed right. `whitespace-nowrap` is what stops the wrapping the
             default renderer suffered from. */
          className="flex items-center gap-2 whitespace-nowrap py-[1px] text-[12.5px] leading-[1.4]"
        >
          <span
            aria-hidden
            className="h-2 w-2 flex-none rounded-full"
            style={{ background: entry.color }}
          />
          <span className="flex-auto text-body">{entry.name}</span>
          <span className="font-bold text-heading tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}
