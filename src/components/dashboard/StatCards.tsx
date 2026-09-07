import type { LucideIcon } from "lucide-react";

/**
 * The overview stat card, in its two skins.
 *
 * Shared by both dashboards because it is one design, not two: the customer's
 * row leads with a balance and the vendor's with its job queue, but the box,
 * the skewed highlight, the progress bar and the hover behaviour are the same
 * card either way. Every other dashboard screen uses the flat `KpiGrid` (see
 * its own comment for why that one was simplified) — this emphasis belongs to
 * an overview's headline row and nowhere else.
 *
 * The design inverts a card's ENTIRE skin on hover: the lead card starts
 * filled and empties, the rest start empty and fill. That is why every child
 * carries a `group-hover:` pair rather than the row tracking a hovered index
 * in state — a longer class list, and it buys back the render.
 */
const CARD =
  "group relative flex min-w-0 flex-col gap-3.5 overflow-hidden border p-[clamp(18px,1.9vw,24px)] transition-colors";
const STRIPE = "absolute inset-y-0 -right-6 w-19 flex-none skew-x-[-13deg] transition-colors";
const LABEL = "text-[13px] font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors";
const VALUE =
  "text-[clamp(28px,2.9vw,34px)] leading-none font-semibold tracking-[-0.035em] tabular-nums transition-colors";
const CAPTION =
  "flex-none text-[11.5px] font-medium tracking-widest whitespace-nowrap uppercase transition-colors";

/** The row's lead card — filled by default, emptying on hover. */
export function FilledCard({
  icon: Icon,
  label,
  value,
  unit,
  caption,
  pct = 100,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Set beside the value — the balance's "USD". Omit when the value carries it. */
  unit?: string;
  caption: string;
  pct?: number;
}) {
  return (
    <div className={`${CARD} border-primary bg-primary hover:border-border hover:bg-card`}>
      <span aria-hidden className={`${STRIPE} bg-white/[0.07] group-hover:bg-transparent`} />
      <span className="relative flex items-center justify-between gap-3">
        <span className={`${LABEL} min-w-0 truncate text-white/70 group-hover:text-muted`}>{label}</span>
        <Icon
          size={21}
          strokeWidth={1.4}
          aria-hidden
          className="flex-none text-white/85 transition-colors group-hover:text-brand"
        />
      </span>
      <span className="relative flex flex-wrap items-baseline gap-1.75">
        <span className={`${VALUE} text-white group-hover:text-heading`}>{value}</span>
        {unit && (
          <span className="text-[15px] font-medium text-white/70 transition-colors group-hover:text-muted">
            {unit}
          </span>
        )}
      </span>
      <span className="relative flex items-center gap-2">
        <span className="h-0.5 flex-auto bg-white/20 transition-colors group-hover:bg-border">
          <span
            style={{ width: `${pct}%` }}
            className="block h-full bg-white/55 transition-colors group-hover:bg-primary-lite"
          />
        </span>
        <span className={`${CAPTION} text-white/60 group-hover:text-muted`}>{caption}</span>
      </span>
    </div>
  );
}

/** The other three — outlined by default, filling on hover. */
export function StatCard({
  icon: Icon,
  label,
  value,
  note,
  pct,
  share,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  pct: number;
  share: string;
}) {
  return (
    <div className={`${CARD} border-border bg-card hover:border-primary hover:bg-primary`}>
      <span aria-hidden className={`${STRIPE} bg-transparent group-hover:bg-white/[0.07]`} />
      <span className="relative flex items-center justify-between gap-3">
        <span className={`${LABEL} min-w-0 truncate text-muted group-hover:text-white/70`}>{label}</span>
        <Icon
          size={21}
          strokeWidth={1.4}
          aria-hidden
          className="flex-none text-brand transition-colors group-hover:text-white/85"
        />
      </span>
      <span className="relative flex items-baseline gap-2.25">
        <span className={`${VALUE} text-heading group-hover:text-white`}>{value}</span>
        <span className="truncate text-[13.5px] text-muted transition-colors group-hover:text-white/65">
          {note}
        </span>
      </span>
      <span className="relative flex items-center gap-2">
        <span className="h-0.5 flex-auto bg-border transition-colors group-hover:bg-white/20">
          <span
            style={{ width: `${pct}%` }}
            className="block h-full bg-primary-lite transition-colors group-hover:bg-white/55"
          />
        </span>
        <span className={`${CAPTION} text-muted group-hover:text-white/60`}>{share}</span>
      </span>
    </div>
  );
}

/** The row itself — one column on a phone, two at 640, all of them at 1060. */
export const STAT_ROW = "grid grid-cols-1 gap-[clamp(12px,1.3vw,16px)] min-[640px]:grid-cols-2";
