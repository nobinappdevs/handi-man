"use client";

import { useLang } from "@/hooks/useLang";
import { Panel, PanelTitle } from "@/components/dashboard/Panel";
import {
  STATUS_KEYS, deliverySeriesFor, type OverviewRange, type StatusKey,
} from "@/components/dashboard/dashboardData";

/**
 * Grouped bars, one cluster per bucket — the design's own delivery treatment.
 * Unlike the activity and pickup charts this one draws all four states, since
 * a parcel spends real time in each and a reader comparing two buckets wants
 * to see which state grew, not just the total.
 */
const X0 = 38;
const X1 = 508;
const Y_TOP = 12;
const Y_BOT = 164;
const VIEW_W = 520;
const VIEW_H = 210;

const round = (v: number) => Math.round(v * 10) / 10;

/* Same fixed-string requirement as `PickupChart` — Tailwind reads these
   literally, so no key may be built from a template at runtime. The ramp runs
   darkest to lightest in the order the states matter, not in the order they
   happen: completed is the figure the panel is about. */
const FILL: Record<StatusKey, string> = {
  completed: "fill-ramp-1",
  processing: "fill-ramp-2",
  pending: "fill-ramp-3",
  canceled: "fill-ramp-4",
};
const SWATCH: Record<StatusKey, string> = {
  completed: "bg-ramp-1",
  processing: "bg-ramp-2",
  pending: "bg-ramp-3",
  canceled: "bg-ramp-4",
};

export function DeliveryChart({ range }: { range: OverviewRange }) {
  const { t } = useLang();

  const data = deliverySeriesFor(range);
  const { labels } = data;
  const n = labels.length;

  const totals = Object.fromEntries(
    STATUS_KEYS.map((key) => [key, data[key].reduce((a, b) => a + b, 0)]),
  ) as Record<StatusKey, number>;
  const empty = STATUS_KEYS.every((key) => totals[key] === 0);
  const max = Math.max(2, ...STATUS_KEYS.flatMap((key) => data[key]));

  const slot = (X1 - X0) / n;
  const py = (v: number) => Y_BOT - (v / max) * (Y_BOT - Y_TOP);

  /* Divided by all four states, not by the ones this bucket happens to have,
     so a bar is the same width in every cluster on the panel. */
  const barW = Math.max(3, Math.min(9, (slot * 0.62) / STATUS_KEYS.length));
  const gap = 2;

  const bars = labels.flatMap((label, i) => {
    const cx = X0 + slot * (i + 0.5);
    const drawn = STATUS_KEYS.filter((key) => data[key][i] > 0);
    const groupW = drawn.length * barW + Math.max(0, drawn.length - 1) * gap;
    return drawn.map((key, k) => ({
      id: `${i}-${key}`,
      x: round(cx - groupW / 2 + k * (barW + gap)),
      y: round(py(data[key][i])),
      h: round(Y_BOT - py(data[key][i])),
      fill: FILL[key],
      title: `${label} · ${t(`dashboard.charts.status.${key}`)} ${data[key][i]}`,
    }));
  });

  const tickStep = Math.max(1, Math.ceil(max / 4));
  const ticks: { v: number; topPct: number }[] = [];
  for (let v = 0; v <= max; v += tickStep) ticks.push({ v, topPct: round((py(v) / VIEW_H) * 100) });

  return (
    <Panel className="flex flex-col gap-5 p-[clamp(18px,2vw,24px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <PanelTitle>{t("dashboard.charts.delivery.title")}</PanelTitle>
        <span className="text-[13px] text-muted">{t(`dashboard.charts.span.${range}`)}</span>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
          {ticks.map((tick) => (
            <line
              key={tick.v}
              x1={34}
              x2={512}
              y1={py(tick.v)}
              y2={py(tick.v)}
              className="stroke-border/60"
              strokeWidth={1}
            />
          ))}
          {bars.map((bar) => (
            <rect key={bar.id} x={bar.x} y={bar.y} width={round(barW)} height={bar.h} className={bar.fill}>
              <title>{bar.title}</title>
            </rect>
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {ticks.map((tick) => (
            <span
              key={tick.v}
              style={{ left: "5%", top: `${tick.topPct}%` }}
              className="absolute -translate-x-full -translate-y-1/2 text-[10.5px] text-muted"
            >
              {tick.v}
            </span>
          ))}
          {labels.map((label, i) => (
            <span
              key={i}
              style={{ left: `${round(((X0 + slot * (i + 0.5)) / VIEW_W) * 100)}%`, top: "93%" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[10.5px] whitespace-nowrap text-muted"
            >
              {label}
            </span>
          ))}
        </div>

        {empty && (
          <span className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 border border-border bg-sunk px-3.5 py-1.75 text-[13px] whitespace-nowrap text-muted">
            {t("dashboard.charts.delivery.empty")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-t border-border pt-3.5">
        {STATUS_KEYS.map((key) => (
          <span key={key} className="flex items-center gap-1.75 text-[12.5px] whitespace-nowrap text-body">
            {/* The lightest ramp step needs an edge to sit on a white card. */}
            <span aria-hidden className={`h-2.5 w-2.5 flex-none border border-heading/20 ${SWATCH[key]}`} />
            {t(`dashboard.charts.status.${key}`)}
            <span className="font-medium text-heading tabular-nums">{totals[key]}</span>
          </span>
        ))}
      </div>
    </Panel>
  );
}
