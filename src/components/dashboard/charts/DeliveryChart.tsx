"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
 * Deliveries — a stacked bar chart, one column per bucket.
 *
 * Stacked rather than grouped, and that is the whole argument for this panel:
 * a parcel is in exactly ONE state at a time, so the five values in a bucket
 * sum to that day's deliveries. A stack says that; five bars side by side make
 * the reader add them up. The column height is the day's total and each band is
 * its share, which is the question this chart gets asked.
 *
 * All five states are drawn — including `hold`, which the grouped version this
 * replaced left out entirely.
 */

const STATES = ["completed", "processing", "pending", "canceled", "hold"] as const;
type State = (typeof STATES)[number];

/* The four ramp steps carry the states a delivery moves THROUGH; `hold` takes
   the muted tone because it sits outside that progression. Same rule as the
   pickup panel, so a colour means one thing across the dashboard. */
const FILL: Record<State, string> = {
  completed: "var(--color-ramp-1)",
  processing: "var(--color-ramp-2)",
  pending: "var(--color-ramp-3)",
  canceled: "var(--color-ramp-4)",
  hold: "var(--color-muted)",
};

const AXIS = "var(--color-muted)";
const GRID = "var(--color-border)";

const sum = (values: number[] = []) => values.reduce((a, b) => a + b, 0);

export function DeliveryChart({
  range,
  series,
}: {
  range: OverviewRange;
  series: SegmentSeries;
}) {
  const { t } = useLang();
  const isClient = useIsClient();

  const { labels, completed, processing, pending, canceled, hold } = series;
  const byState = { completed, processing, pending, canceled, hold };
  const n = labels.length;
  const empty = n === 0 || STATES.every((key) => sum(byState[key]) === 0);

  const data = labels.map((label, i) => ({
    label,
    completed: completed[i] ?? 0,
    processing: processing[i] ?? 0,
    pending: pending[i] ?? 0,
    canceled: canceled[i] ?? 0,
    hold: hold[i] ?? 0,
  }));

  const tickGap = range === "week" ? 0 : Math.max(0, Math.ceil(n / 8) - 1);
  /* Bars are stacked, so the tallest column is the per-bucket SUM, not the
     biggest single state. Sizing off one state would clip the stack. */
  const axis = yAxisTicks(
    Math.max(0, ...data.map((d) => d.completed + d.processing + d.pending + d.canceled + d.hold)),
  );

  return (
    <Panel className="flex flex-col gap-5 p-[clamp(18px,2vw,24px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <PanelTitle>{t("dashboard.charts.delivery.title")}</PanelTitle>
        {empty && (
          <span className="text-[13px] text-muted">{t("dashboard.charts.delivery.empty")}</span>
        )}
      </div>

      <div className="h-[clamp(260px,26vw,320px)] w-full">
        {isClient && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 5" vertical={false} />
              <XAxis
                dataKey="label"
                stroke={AXIS}
                tickLine={false}
                axisLine={false}
                minTickGap={tickGap}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke={AXIS}
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

              {/* One `stackId` puts every state in the same column. Only the top
                  band is rounded, so the stack reads as one bar and not five. */}
              {STATES.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={t(`dashboard.charts.status.${key}`)}
                  stackId="delivery"
                  fill={FILL[key]}
                  maxBarSize={22}
                  radius={i === STATES.length - 1 ? [3, 3, 0, 0] : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-t border-border pt-3.5">
        {STATES.map((key) => (
          <span
            key={key}
            className="flex items-center gap-1.75 text-[12.5px] whitespace-nowrap text-body"
          >
            {/* The lightest ramp step needs an edge to sit on a white card. */}
            <span
              aria-hidden
              className="h-2.5 w-2.5 flex-none border border-heading/20"
              style={{ background: FILL[key] }}
            />
            {t(`dashboard.charts.status.${key}`)}
            <span className="font-medium text-heading tabular-nums">{sum(byState[key])}</span>
          </span>
        ))}
      </div>
    </Panel>
  );
}
