"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import { Panel } from "@/components/dashboard/Panel";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";
import type { OverviewRange } from "@/components/dashboard/dashboardData";
import { yAxisWidth, yAxisTicks, type SegmentSeries } from "@/lib/dashboardSeries";

/**
 * The service chart — Recharts' "Line Bar Area Composed Chart", built to match
 * that example exactly: four marks over one band-scaled dataset.
 *
 *   Area    — every request in the bucket, whatever state   (the example's `amt`)
 *   Bar     — the ones that completed                       (`pv`)
 *   Line    — the ones still waiting                        (`uv`)
 *   Scatter — the ones in progress                          (`cnt`)
 *
 * `scale="band"` is what lets the bar sit centred on the same tick the line and
 * the dots use, and the grid is dashed on BOTH axes — the example draws a full
 * lattice rather than the horizontal-only rules the other panels use.
 *
 * Generic over the series, so the customer's service requests and the vendor's
 * job queue are one chart with two datasets. `title` and `allLabel` are the only
 * strings that differ between them.
 *
 * ── The palette is the primary family ──
 * The shape is the reference's; the colour is this product's. Each mark takes
 * the token its STATUS already has in the pickup and delivery panels, so a
 * colour means one thing across the whole dashboard:
 *
 *   bar     completed  -> ramp-1  (deepest plum)
 *   scatter processing -> ramp-2
 *   line    pending    -> ramp-3
 *
 * The area is the bucket total rather than a status, so it takes `primary`
 * itself at a low opacity — a wash for everything, with the three states
 * reading on top of it.
 */
const INK = {
  area: "var(--color-primary)",
  bar: "var(--color-ramp-1)",
  scatter: "var(--color-ramp-2)",
  line: "var(--color-ramp-3)",
  axis: "var(--color-muted)",
  grid: "var(--color-border)",
};

export function ActivityChart({
  range,
  series,
  title,
  caption,
  allLabel,
  emptyLabel,
}: {
  /** Read for axis label density — the series is already ranged. */
  range: OverviewRange;
  series: SegmentSeries;
  title: string;
  /** The period this covers, under the title. */
  caption: string;
  /** Legend word for the area: "All services" / "All jobs". */
  allLabel: string;
  emptyLabel: string;
}) {
  const { t } = useLang();
  /* Recharts measures its container, which has no width during the static
     prerender. Holding the chart back until mount avoids a first paint at zero
     width that then jumps — the axis and legend would render on top of nothing. */
  const isClient = useIsClient();

  const { labels, totals, completed, pending, processing } = series;
  const n = labels.length;
  const empty = n === 0 || totals.every((v) => v === 0);

  const data = labels.map((label, i) => ({
    label,
    total: totals[i] ?? 0,
    completed: completed[i] ?? 0,
    pending: pending[i] ?? 0,
    processing: processing[i] ?? 0,
  }));

  /* A month of daily buckets cannot show 30 labels, so drop every Nth. Recharts
     counts the GAP between shown ticks, not the stride, hence the -1. */
  const tickGap = range === "week" ? 0 : Math.max(0, Math.ceil(n / 10) - 1);
  /* The area carries every state, so it is the tallest mark and sets the axis. */
  const axis = yAxisTicks(Math.max(0, ...totals));

  return (
    <Panel className="flex flex-col gap-[18px] p-[clamp(18px,2vw,26px)]">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <span className="flex items-stretch gap-3">
          <span aria-hidden className="w-[3px] flex-none bg-primary" />
          <span className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-heading">{title}</h2>
            <span className="text-[13.5px] text-muted">{caption}</span>
          </span>
        </span>
        {empty && <span className="text-[13px] text-muted">{emptyLabel}</span>}
      </div>

      <div className="h-[clamp(300px,32vw,400px)] w-full">
        {isClient && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              {/* The example's full lattice — dashed on both axes, where the
                  pickup and delivery panels rule horizontally only. */}
              <CartesianGrid stroke={INK.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                scale="band"
                stroke={INK.axis}
                tickLine={false}
                minTickGap={tickGap}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke={INK.axis}
                tickLine={false}
                tick={{ fontSize: 11 }}
                /* Explicit whole-number ticks whose STEP scales with the data,
                   and a width sized to the widest of them. Left to itself
                   Recharts prints 0.2 of a job on a quiet month. */
                ticks={axis.ticks}
                domain={[0, axis.top]}
                width={yAxisWidth(axis.top)}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12.5, paddingTop: 8 }} />

              <Area
                type="monotone"
                dataKey="total"
                name={allLabel}
                fill={INK.area}
                /* A wash, not a block: the bars and dots sit ON this, and a
                   solid plum fill buries every one of them. */
                fillOpacity={0.14}
                stroke={INK.area}
                strokeWidth={2}
              />
              <Bar
                dataKey="completed"
                name={t("dashboard.charts.status.completed")}
                barSize={20}
                fill={INK.bar}
              />
              <Line
                type="monotone"
                dataKey="pending"
                name={t("dashboard.charts.status.pending")}
                stroke={INK.line}
                strokeWidth={2.2}
              />
              <Scatter
                dataKey="processing"
                name={t("dashboard.charts.status.processing")}
                fill={INK.scatter}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}
