/**
 * Display helpers for the money screens.
 *
 * The vendor money-out API hands back figures as ready-made strings — "10 USD",
 * "2789.6 PKR", "1 USD = 278.96 PKR". Those are the authoritative numbers, but
 * they are not presentation: no thousands separator, and however many decimals
 * the value happened to have, so 2789.6 sits beside 10 and nothing lines up.
 *
 * Everything here re-renders the SAME value and falls back to the original
 * string when it cannot parse one. A figure shown oddly beats a figure not
 * shown, and on a payout screen it must never silently blank.
 */

/** Grouped, fixed-decimal number. */
export function num(value: number, dp = 2) {
  return value.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/** A figure plus its currency code. The unit always travels with the number on
 *  these screens, because two currencies are on them at once. */
export function money(value: number, code: string, dp = 2) {
  return `${num(value, dp)} ${code}`;
}

/** Splits a server figure into its number and its unit. No regex — a plain
 *  token split is enough and reads better than an escaped pattern. */
function splitAmount(value: string) {
  const parts = (value ?? "").trim().split(" ").filter(Boolean);
  if (!parts.length) return null;
  const amount = Number(parts[0].split(",").join(""));
  if (!Number.isFinite(amount)) return null;
  return { amount, unit: parts.slice(1).join(" ") };
}

/** "2789.6 PKR" → "2,789.60 PKR". Unparseable input is returned untouched. */
export function formatMoneyString(value: string, dp = 2) {
  const parsed = splitAmount(value);
  if (!parsed) return value;
  return parsed.unit ? `${num(parsed.amount, dp)} ${parsed.unit}` : num(parsed.amount, dp);
}

/** "1 USD = 278.96 PKR" → "1 USD = 278.9600 PKR" (4dp, as the design shows). */
export function formatRateString(value: string) {
  // Shape: <n> <base> = <rate> <code>
  const parts = (value ?? "").trim().split(" ").filter(Boolean);
  if (parts.length !== 5 || parts[2] !== "=") return value;
  const rate = Number(parts[3].split(",").join(""));
  if (!Number.isFinite(rate)) return value;
  return `${parts[0]} ${parts[1]} = ${num(rate, 4)} ${parts[4]}`;
}

/*
 * Dates are formatted in UTC ON PURPOSE.
 *
 * This is a static export: a page is prerendered at build time on the server and
 * hydrated in the browser. A local-timezone format would produce two different
 * strings for the same instant and React would report a hydration mismatch — the
 * same trap the auth screen's fixed week avoids. Pinning the zone makes the
 * output deterministic, and a payout timestamp is a record of when the backend
 * acted, which is what UTC describes anyway.
 */
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "2026-09-15T04:59:36.000000Z" → "15 Sep 2026". */
export function formatDate(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : DATE_FMT.format(date);
}

/** "2026-09-15T04:59:36.000000Z" → "15 Sep 2026, 04:59". */
export function formatDateTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${DATE_FMT.format(date)}, ${TIME_FMT.format(date)}`;
}
