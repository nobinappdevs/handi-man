"use client";

import { useLang } from "@/hooks/useLang";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Panel } from "@/components/dashboard/Panel";
import type { OverviewRange, RangeSeries } from "@/components/dashboard/dashboardData";

/**
 * Both overviews' headline chart: the design's composed area + bar + line
 * combo, not the flat stacked column the rest of the dashboard uses. This is
 * the one chart the design gives its own full-width row, so it keeps its own
 * shape — area = everything in the bucket, bar = the completed ones, line =
 * the rest still open. Processing and canceled are the table's job below; a
 * fourth series overlapping these three reads as noise.
 *
 * Generic over the series so the customer's service requests and the vendor's
 * job queue are one chart with two datasets, not two charts to keep in sync.
 * `title` and `allLabel` are the only strings that differ between them.
 */
const X0 = 44;
const X1 = 986;
const Y_TOP = 16;
const Y_BOT = 196;
const VIEW_W = 1000;
const VIEW_H = 238;

const round = (v: number) => Math.round(v * 10) / 10;

function smoothPath(xs: number[], ys: number[]): string {
  let d = `M ${round(xs[0])} ${round(ys[0])}`;
  for (let i = 1; i < xs.length; i += 1) {
    const cx = round((xs[i - 1] + xs[i]) / 2);
    d += ` C ${cx} ${round(ys[i - 1])}, ${cx} ${round(ys[i])}, ${round(xs[i])} ${round(ys[i])}`;
  }
  return d;
}

export function ActivityChart({
  range,
  series,
  title,
  caption,
  allLabel,
  emptyLabel,
}: {
  /** Only read for the axis label density — the series is already ranged. */
  range: OverviewRange;
  series: RangeSeries;
  title: string;
  /** The period this covers, under the title. */
  caption: string;
  /** Legend word for the area: "All services" / "All jobs". */
  allLabel: string;
  emptyLabel: string;
}) {
  const { t } = useLang();
  /* The design thins the axis on a narrow screen by DROPPING labels, which no
     class can do — a hidden label still occupies its slot in the sequence. */
  const roomy = useMediaQuery("(min-width: 900px)");

  const { labels, totals, completed, pending } = series;
  const n = labels.length;
  const max = Math.max(5, ...totals);
  const empty = totals.every((v) => v === 0);

  const step = n <= 1 ? 0 : (X1 - X0) / (n - 1);
  const px = (i: number) => X0 + i * step;
  const py = (v: number) => Y_BOT - (v / max) * (Y_BOT - Y_TOP);

  const xs = labels.map((_, i) => px(i));
  const areaPath = `${smoothPath(xs, totals.map(py))} L ${round(px(n - 1))} ${Y_BOT} L ${round(px(0))} ${Y_BOT} Z`;
  const linePath = smoothPath(xs, pending.map(py));

  const barW = Math.max(3, Math.min(18, step * 0.46));
  const bars = completed.map((v, i) => {
    const h = v === 0 ? 2 : Y_BOT - py(v);
    return { i, x: round(px(i) - barW / 2), y: round(Y_BOT - h), h: round(h), zero: v === 0 };
  });

  const dotEvery = n > 20 ? 3 : 1;
  const dots = pending
    .map((v, i) => ({ i, cx: round(px(i)), cy: round(py(v)) }))
    .filter(({ i }) => i % dotEvery === 0);

  /* One gridline per whole request — the axis counts jobs, and a fractional
     tick on a chart whose values are all integers is a lie. */
  const ticks = Array.from({ length: max + 1 }, (_, v) => ({ v, topPct: round((py(v) / VIEW_H) * 100) }));

  const labelStep = range === "week" ? 1 : roomy ? 3 : 6;
  const xLabels = labels
    .map((label, i) => ({ i, label, pctIn: round((px(i) / VIEW_W) * 100) }))
    .filter(({ i }) => i % labelStep === 0 || i === n - 1);

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

        <div className="flex flex-wrap gap-x-4.5 gap-y-2">
          <span className="flex items-center gap-1.75 text-[13px] whitespace-nowrap text-body">
            <span aria-hidden className="h-[9px] w-3.5 flex-none border border-brand/60 bg-brand/10" />
            {allLabel}
          </span>
          <span className="flex items-center gap-1.75 text-[13px] whitespace-nowrap text-body">
            <span aria-hidden className="h-3 w-[7px] flex-none bg-ramp-1" />
            {t("dashboard.charts.status.completed")}
          </span>
          <span className="flex items-center gap-1.75 text-[13px] whitespace-nowrap text-body">
            <span aria-hidden className="flex h-[9px] w-4 flex-none items-center justify-center bg-warn">
              <span className="h-1.5 w-1.5 rounded-full bg-card" />
            </span>
            {t("dashboard.charts.status.pending")}
          </span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full" aria-hidden>
          {ticks.map((tick) => (
            <line
              key={tick.v}
              x1={X0}
              x2={X1}
              y1={py(tick.v)}
              y2={py(tick.v)}
              className="stroke-border/60"
              strokeWidth={1}
              strokeDasharray="3 5"
            />
          ))}
          <line x1={X0} x2={X0} y1={Y_TOP} y2={Y_BOT} className="stroke-border" strokeWidth={1} />

          <path d={areaPath} className="fill-brand/8" stroke="none" />
          {bars.map((bar) => (
            <rect
              key={bar.i}
              x={bar.x}
              y={bar.y}
              width={round(barW)}
              height={bar.h}
              className={bar.zero ? "fill-border" : "fill-ramp-1"}
            />
          ))}
          <path d={linePath} className="fill-none stroke-warn" strokeWidth={2} strokeLinecap="round" />
          {dots.map((dot) => (
            <circle
              key={dot.i}
              cx={dot.cx}
              cy={dot.cy}
              r={3.2}
              className="fill-card stroke-warn"
              strokeWidth={2}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {ticks.map((tick) => (
            <span
              key={tick.v}
              style={{ left: "3.4%", top: `${tick.topPct}%` }}
              className="absolute -translate-x-full -translate-y-1/2 text-[11px] text-muted"
            >
              {tick.v}
            </span>
          ))}
          {xLabels.map(({ i, label, pctIn }) => (
            <span
              key={i}
              style={{ left: `${pctIn}%`, top: "93%" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[11px] whitespace-nowrap text-muted"
            >
              {label}
            </span>
          ))}
        </div>

        {empty && (
          <span className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 border border-border bg-sunk px-4 py-2 text-[13.5px] whitespace-nowrap text-muted">
            {emptyLabel}
          </span>
        )}
      </div>
    </Panel>
  );
}
