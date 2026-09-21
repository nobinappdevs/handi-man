"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import { Panel, PanelTitle } from "@/components/dashboard/Panel";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";
import type { OverviewRange } from "@/components/dashboard/dashboardData";
import { yAxisWidth, yAxisTicks, type SegmentSeries } from "@/lib/dashboardSeries";

/**
 * Pickups — Recharts' "same data" composed chart: one dataset, three marks.
 *
 * The distinguishing piece is `scale="band"` on the X axis. It gives every
 * bucket an equal-width band and centres the bars in it, so the bar and the
 * line share a tick instead of the bars straddling the points — which is what
 * makes this read as one measurement drawn three ways rather than three series.
 *
 * ── Which three ──
 *   area — every pickup in the bucket, whatever state
 *   bar  — the ones that completed
 *   line — the ones still waiting
 * The other two states (canceled, hold) are in the totals strip underneath, so
 * nothing the API reports is hidden — they just do not earn a third mark on a
 * half-width panel.
 */

const INK = {
  area: "var(--color-ramp-2)",
  bar: "var(--color-ramp-1)",
  line: "var(--color-warn)",
  axis: "var(--color-muted)",
  grid: "var(--color-border)",
};

/** Swatches for the totals strip — the five the API reports, in lifecycle order. */
const STATES = ["pending", "processing", "completed", "canceled", "hold"] as const;
const SWATCH: Record<(typeof STATES)[number], string> = {
  pending: "bg-ramp-3",
  processing: "bg-ramp-2",
  completed: "bg-ramp-1",
  canceled: "bg-ramp-4",
  hold: "bg-muted",
};

const sum = (values: number[] = []) => values.reduce((a, b) => a + b, 0);

export function PickupChart({
  range,
  series,
}: {
  range: OverviewRange;
  series: SegmentSeries;
}) {
  const { t } = useLang();
  /* Recharts measures its container, which has no width during the static
     prerender — hold the plot back until mount so it does not paint at zero. */
  const isClient = useIsClient();

  const { labels, totals, completed, pending, processing, canceled, hold } = series;
  const byState = { pending, processing, completed, canceled, hold };
  const n = labels.length;
  const empty = n === 0 || STATES.every((key) => sum(byState[key]) === 0);

  const data = labels.map((label, i) => ({
    label,
    total: totals[i] ?? 0,
    completed: completed[i] ?? 0,
    pending: pending[i] ?? 0,
  }));

  const tickGap = range === "week" ? 0 : Math.max(0, Math.ceil(n / 8) - 1);
  /* The area carries every state, so it is the tallest mark here too. */
  const axis = yAxisTicks(Math.max(0, ...totals));

  return (
    <Panel className="flex flex-col gap-5 p-[clamp(18px,2vw,24px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <PanelTitle>{t("dashboard.charts.pickup.title")}</PanelTitle>
        {empty && (
          <span className="text-[13px] text-muted">{t("dashboard.charts.pickup.empty")}</span>
        )}
      </div>

      <div className="h-[clamp(260px,26vw,320px)] w-full">
        {isClient && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={INK.grid} strokeDasharray="3 5" vertical={false} />
              {/* `scale="band"` is the point of this chart — see the note above. */}
              <XAxis
                dataKey="label"
                scale="band"
                stroke={INK.axis}
                tickLine={false}
                axisLine={false}
                minTickGap={tickGap}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke={INK.axis}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                /* Explicit whole-number ticks whose STEP scales with the data,
                   and a width sized to the widest of them. Left to itself
                   Recharts prints 0.2 of a job on a quiet month, and clips a
                   three-digit tick on a busy one. */
                ticks={axis.ticks}
                domain={[0, axis.top]}
                width={yAxisWidth(axis.top)}
                allowDecimals={false}
              />
              <Tooltip cursor={{ fill: "var(--color-sunk)" }} content={<ChartTooltip />} />
              <Legend iconType="square" wrapperStyle={{ fontSize: 12.5, paddingTop: 6 }} />

              <Area
                type="monotone"
                dataKey="total"
                name={t("dashboard.charts.pickup.total")}
                fill={INK.area}
                fillOpacity={0.22}
                stroke={INK.area}
                strokeWidth={2}
              />
              <Bar
                dataKey="completed"
                name={t("dashboard.charts.status.completed")}
                barSize={16}
                fill={INK.bar}
              />
              <Line
                type="monotone"
                dataKey="pending"
                name={t("dashboard.charts.status.pending")}
                stroke={INK.line}
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Every state the API reports, including the two the plot does not draw. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3.5">
        {STATES.map((key) => (
          <span
            key={key}
            className="flex items-center gap-1.75 text-[12.5px] whitespace-nowrap text-body"
          >
            <span aria-hidden className={`h-[9px] w-[9px] flex-none ${SWATCH[key]}`} />
            {t(`dashboard.charts.status.${key}`)}
            <span className="font-medium text-heading tabular-nums">{sum(byState[key])}</span>
          </span>
        ))}
      </div>
    </Panel>
  );
}
