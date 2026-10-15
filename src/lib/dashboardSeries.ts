import type {
  DashboardChart,
  DashboardStatusSeries,
} from "@/services/dashboard.service";
import type { OverviewRange, RangeSeries } from "@/components/dashboard/dashboardData";

/**
 * Turns the dashboard API's chart block into the shapes the chart components
 * already consume, so those components did not have to change.
 *
 * ── What the API gives ──
 * One bucket per DAY of the current month, and per segment (service / pickup /
 * delivery) five parallel arrays: pending, processing, success, canceled, hold.
 *
 * ── The range control ──
 * Daily buckets are the finest grain available, so a range is a window over
 * them: `month` is all of it, `week` the last seven, `today` the last one.
 *
 * ⚠️ `today` is therefore a single point. The mock this replaced synthesised
 * hourly buckets; the API has no hourly data and inventing some would draw a
 * shape the backend never reported. A one-bucket chart reads thinly — worth
 * dropping that range from the customer overview if it bothers you, but not
 * worth faking.
 */

const WINDOW: Record<OverviewRange, number | null> = {
  today: 1,
  week: 7,
  month: null, // everything the API sent
};

function windowOf<T>(values: T[], range: OverviewRange): T[] {
  const size = WINDOW[range];
  return size === null ? values : values.slice(-size);
}

/** `"2026-09-15"` → `"15"`. The month is already in the panel's caption. */
function dayLabel(iso: string): string {
  const parts = (iso ?? "").split("-");
  return parts.length === 3 ? String(Number(parts[2])) : iso;
}

/** Sums the five status arrays position by position. */
function totalsOf(series: DashboardStatusSeries, length: number): number[] {
  const at = (arr: number[] | undefined, i: number) => Number(arr?.[i] ?? 0) || 0;
  return Array.from(
    { length },
    (_, i) =>
      at(series.pending_data, i) +
      at(series.processing_data, i) +
      at(series.success_data, i) +
      at(series.canceled_data, i) +
      at(series.hold_data, i),
  );
}

/** Every status for one segment, windowed to a range. */
export type SegmentSeries = RangeSeries & {
  processing: number[];
  canceled: number[];
  hold: number[];
};

const EMPTY: SegmentSeries = {
  labels: [],
  totals: [],
  completed: [],
  pending: [],
  processing: [],
  canceled: [],
  hold: [],
};

/**
 * One segment of the chart, ready to draw.
 *
 * `completed` is `success_data` — the charts' word for it, the API's other.
 * `pending` stays the API's own pending bucket rather than "everything not
 * completed", so the numbers a panel shows are numbers the backend reported.
 */
export function segmentSeries(
  chart: DashboardChart | undefined,
  segment: "service" | "pickup" | "delivery",
  range: OverviewRange,
): SegmentSeries {
  const source = chart?.[segment];
  const days = chart?.month_day ?? [];
  if (!source || days.length === 0) return EMPTY;

  const length = days.length;
  const pick = (arr: number[] | undefined) =>
    windowOf(Array.from({ length }, (_, i) => Number(arr?.[i] ?? 0) || 0), range);

  return {
    labels: windowOf(days.map(dayLabel), range),
    totals: windowOf(totalsOf(source, length), range),
    completed: pick(source.success_data),
    pending: pick(source.pending_data),
    processing: pick(source.processing_data),
    canceled: pick(source.canceled_data),
    hold: pick(source.hold_data),
  };
}

/** The period a range covers, for the caption under a chart title. */
export function rangeCaption(chart: DashboardChart | undefined, range: OverviewRange): string {
  const days = windowOf(chart?.month_day ?? [], range);
  if (days.length === 0) return "";
  const first = days[0];
  const last = days[days.length - 1];
  return first === last ? first : `${first} — ${last}`;
}

/**
 * How much room the Y axis needs, from the biggest number it has to print.
 *
 * The charts used to pull the plot leftward with a negative margin and let
 * Recharts guess the axis width. That works at one digit and clips at three:
 * "100" lost its first character, and the whole plot read as cramped. Deriving
 * the width from the data means the axis is exactly as wide as it needs to be
 * and the plot keeps everything left over.
 */
export function yAxisWidth(maxValue: number): number {
  const digits = String(Math.max(0, Math.ceil(maxValue))).length;
  // ~7px per digit at the 11px tick size, plus the gap to the gridlines.
  return 16 + digits * 8;
}

/**
 * A whole-number tick ladder for the Y axis.
 *
 * Recharts' own ticks are chosen from the domain, so a month whose busiest day
 * saw ONE job produced an axis reading 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 - fractions
 * of a job, which do not exist. And a busy month produced a tick per unit.
 *
 * So the STEP scales with the data instead: the first ladder rung that fits the
 * peak into five intervals or fewer wins.
 *
 *   peak 2   -> step 1   -> 0 1 2 3
 *   peak 7   -> step 2   -> 0 2 4 6 8
 *   peak 50  -> step 10  -> 0 10 20 30 40 50 60
 *   peak 100 -> step 20  -> 0 20 40 60 80 100 120
 *
 * The top tick always sits ABOVE the peak. A series that touches the ceiling
 * reads as capped — two services against a top of 2 looks like the chart ran
 * out of room rather than like a quiet month — so when the peak lands exactly
 * on a tick, one more step is added to give it somewhere to breathe.
 *
 * Every rung is a number people count in, which is why the ladder is written
 * out rather than derived from a logarithm - log10 rounding lands on steps like
 * 2.5 and 25 that read as arbitrary on an axis counting jobs.
 */
const TICK_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];

export function yAxisTicks(maxValue: number): { ticks: number[]; top: number } {
  const peak = Math.max(0, Math.ceil(maxValue));
  // Nothing happened: a flat 0-1 axis still shows the gridlines and the floor.
  if (peak === 0) return { ticks: [0, 1], top: 1 };

  const step =
    TICK_STEPS.find((candidate) => Math.ceil(peak / candidate) <= 5) ??
    // Past the ladder, fall back to whatever keeps five intervals.
    Math.ceil(peak / 5);

  const rounded = Math.ceil(peak / step) * step;
  // Headroom: never let the series sit on the top gridline.
  const top = rounded === peak ? rounded + step : rounded;

  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { ticks, top };
}
