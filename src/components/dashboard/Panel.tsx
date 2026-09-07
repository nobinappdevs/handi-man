import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Panel primitives for the dashboard's inner screens.
 *
 * These replace the old `dashboard/ui.tsx`, which was deleted with the scaffold
 * it belonged to. Deliberately NOT a port of it: that file was `rounded-2xl`
 * with raw `amber-500` / `rose-500` / `gray-50`, and the dashboard this now
 * sits in is square-cornered and token-only. Every surface here is the same
 * `border-border` + `bg-card` the KPI and table panels use, so a settings
 * screen and the overview read as one product.
 */
export function Panel({ className, children }: { className?: string; children?: ReactNode }) {
  return <section className={cn("min-w-0 border border-border bg-card", className)}>{children}</section>;
}

export function PanelHeader({
  title,
  children,
}: {
  title?: ReactNode;
  /** Trailing slot — a badge, a count, an icon. */
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border p-[clamp(16px,1.7vw,22px)_clamp(18px,2vw,26px)]">
      <h2 className="min-w-0 flex-auto truncate text-[clamp(16px,1.7vw,19px)] font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      {children}
    </div>
  );
}

/**
 * The design's section title — a short plum bar, then the name.
 *
 * The overview's four panels label themselves this way instead of with
 * `PanelHeader`: their heading sits INSIDE the panel's padding next to a
 * legend or a period caption, with no rule under it, so a header row that
 * draws its own bottom border is the wrong primitive. An `h2` rather than the
 * design's `span` — it is the section's heading either way.
 */
export function PanelTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "flex items-center gap-[11px] text-[17px] font-semibold tracking-[-0.02em] text-heading",
        className,
      )}
    >
      <span aria-hidden className="h-[18px] w-[3px] flex-none bg-primary" />
      {children}
    </h2>
  );
}

/** Standard padding for a panel's body, matching the header's. */
export const PANEL_BODY = "p-[clamp(18px,2vw,26px)]";

/**
 * The label above a control that is NOT an `Input` — a `Select`, the read-only
 * secret field, a file picker.
 *
 * Styled to match `Input`'s own label exactly (`text-sm font-medium`), because
 * the two sit side by side in the same grid: an uppercase tracked label next to
 * a sentence-case one reads as two different form systems on one screen.
 */
export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-heading">
      {children}
      {required && <span className="ms-1 inline text-danger">*</span>}
    </label>
  );
}

/** Full-width pulse block for a loading skeleton. */
export function SkLine({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse bg-border", className)} />;
}
