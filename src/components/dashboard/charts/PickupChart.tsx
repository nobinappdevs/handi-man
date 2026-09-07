"use client";

import { useLang } from "@/hooks/useLang";
import { Panel, PanelTitle } from "@/components/dashboard/Panel";
import { pickupSeriesFor, type OverviewRange } from "@/components/dashboard/dashboardData";

/**
 * Two smoothed lines — completed and processing — with the busier one shaded
 * underneath, and the peak of the leading line called out. The design's own
 * pickup treatment, kept distinct from the activity chart's area+bar combo
 * and the delivery chart's grouped bars so the three panels read as three
 * different measurements rather than one repeated three times.
 *
 * Pending and canceled are counted in the caption instead of plotted: a
 * pickup sits in either for minutes, so both would be flat lines at zero.
 */
const X0 = 38;
const X1 = 508;
const Y_TOP = 12;
const Y_BOT = 164;
const VIEW_W = 520;
const VIEW_H = 210;
/** Side of the square that marks a reading. */
const MARK = 5;

const round = (v: number) => Math.round(v * 10) / 10;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

function smoothPath(xs: number[], ys: number[]): string {
  let d = `M ${round(xs[0])} ${round(ys[0])}`;
  for (let i = 1; i < xs.length; i += 1) {
    const cx = round((xs[i - 1] + xs[i]) / 2);
    d += ` C ${cx} ${round(ys[i - 1])}, ${cx} ${round(ys[i])}, ${round(xs[i])} ${round(ys[i])}`;
  }
  return d;
}

/* Tailwind's scanner needs the full class string in the source — never build
   one from a runtime variable (`fill-${x}`), or it silently ships unstyled. */
const INK = {
  completed: { area: "fill-ramp-1/10", stroke: "stroke-ramp-1", mark: "fill-ramp-1", swatch: "bg-ramp-1" },
  processing: { area: "fill-ramp-2/10", stroke: "stroke-ramp-2", mark: "fill-ramp-2", swatch: "bg-ramp-2" },
} as const;

export function PickupChart({ range }: { range: OverviewRange }) {
  const { t } = useLang();

  const { labels, completed, processing, pending, canceled } = pickupSeriesFor(range);
  const n = labels.length;

  /* A series that never leaves zero is not drawn at all — an invisible line
     along the baseline still puts its colour in the legend for nothing. */
  const drawn = (
    [
      { key: "completed" as const, values: completed },
      { key: "processing" as const, values: processing },
    ] as const
  ).filter((s) => s.values.some((v) => v > 0));

  const max = Math.max(2, ...completed, ...processing);
  const step = n <= 1 ? 0 : (X1 - X0) / (n - 1);
  const px = (i: number) => X0 + i * step;
  const py = (v: number) => Y_BOT - (v / max) * (Y_BOT - Y_TOP);
  const xs = labels.map((_, i) => px(i));

  /* The bigger of the two carries the shaded area, so the panel reads as one
     measurement with a second line over it rather than two competing fills. */
  const lead = drawn.reduce(
    (best, s) => (sum(s.values) > sum(best.values) ? s : best),
    drawn[0] ?? { key: "completed" as const, values: completed },
  );

  const tickStep = Math.max(1, Math.ceil(max / 4));
  const ticks: { v: number; topPct: number }[] = [];
  for (let v = 0; v <= max; v += tickStep) ticks.push({ v, topPct: round((py(v) / VIEW_H) * 100) });

  const markEvery = n > 20 ? 3 : 1;

  /* One callout, on the leading line's busiest bucket — the reading someone
     asks the chart for first. */
  const peakAt = lead.values.reduce((best, v, i) => (v > lead.values[best] ? i : best), 0);
  const peak =
    drawn.length === 0 || lead.values[peakAt] === 0
      ? null
      : {
          value: lead.values[peakAt],
          pctX: round((px(peakAt) / VIEW_W) * 100),
          pctY: round((py(lead.values[peakAt]) / VIEW_H) * 100),
        };

  return (
    <Panel className="flex flex-col gap-5 p-[clamp(18px,2vw,24px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <PanelTitle>{t("dashboard.charts.pickup.title")}</PanelTitle>
        <span className="text-[13px] text-muted">{t(`dashboard.charts.span.${range}`)}</span>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full" aria-hidden>
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

          {drawn.map((s) =>
            s.key !== lead.key ? null : (
              <path
                key={`area-${s.key}`}
                d={`${smoothPath(xs, s.values.map(py))} L ${round(px(n - 1))} ${Y_BOT} L ${round(px(0))} ${Y_BOT} Z`}
                className={INK[s.key].area}
                stroke="none"
              />
            ),
          )}

          {drawn.map((s) => (
            <path
              key={`line-${s.key}`}
              d={smoothPath(xs, s.values.map(py))}
              className={`fill-none ${INK[s.key].stroke}`}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {drawn.map((s) =>
            s.values
              .map((v, i) => ({ i, v }))
              .filter(({ i }) => i % markEvery === 0)
              .map(({ i, v }) => (
                <rect
                  key={`${s.key}-${i}`}
                  x={round(px(i) - MARK / 2)}
                  y={round(py(v) - MARK / 2)}
                  width={MARK}
                  height={MARK}
                  className={INK[s.key].mark}
                />
              )),
          )}
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
              style={{ left: `${round((px(i) / VIEW_W) * 100)}%`, top: "93%" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[10.5px] whitespace-nowrap text-muted"
            >
              {label}
            </span>
          ))}
          {peak && (
            <span
              style={{ left: `${peak.pctX}%`, top: `${peak.pctY}%` }}
              className="absolute -translate-x-1/2 -translate-y-[150%] bg-invert px-1.75 py-0.75 text-[11px] font-medium whitespace-nowrap text-invert-ink tabular-nums"
            >
              {peak.value}
            </span>
          )}
        </div>

        {drawn.length === 0 && (
          <span className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 border border-border bg-sunk px-3.5 py-1.75 text-[13px] whitespace-nowrap text-muted">
            {t("dashboard.charts.pickup.empty")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3.5">
        <span className="flex items-center gap-1.75 text-[12.5px] whitespace-nowrap text-body">
          <span aria-hidden className={`h-[9px] w-[9px] flex-none ${INK.completed.swatch}`} />
          {t("dashboard.charts.status.completed")}
          <span className="font-medium text-heading tabular-nums">{sum(completed)}</span>
        </span>
        <span className="flex items-center gap-1.75 text-[12.5px] whitespace-nowrap text-body">
          <span aria-hidden className={`h-[9px] w-[9px] flex-none ${INK.processing.swatch}`} />
          {t("dashboard.charts.status.processing")}
          <span className="font-medium text-heading tabular-nums">{sum(processing)}</span>
        </span>
        <span className="ms-auto text-[12.5px] whitespace-nowrap text-muted">
          {t("dashboard.charts.status.pending")} {pending} · {t("dashboard.charts.status.canceled")}{" "}
          {canceled}
        </span>
      </div>
    </Panel>
  );
}
