"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";

/**
 * Page numbers for a list paged on the client.
 *
 * At most seven slots: first, last, the current page with a neighbour either
 * side, and an ellipsis for each gap - so 50 pages never becomes 50 buttons.
 * Renders nothing for a single page.
 */
function slots(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | "gap")[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(count - 1, page + 1);
  if (from > 2) out.push("gap");
  for (let p = from; p <= to; p++) out.push(p);
  if (to < count - 1) out.push("gap");
  out.push(count);
  return out;
}

const CELL =
  "flex h-9 min-w-9 items-center justify-center px-2 text-[13.5px] font-semibold tabular-nums transition-colors";

export function Pagination({
  page,
  count,
  onPage,
  className,
}: {
  /** 1-based. */
  page: number;
  count: number;
  onPage: (page: number) => void;
  className?: string;
}) {
  const { t } = useLang();
  if (count <= 1) return null;

  return (
    <nav aria-label={t("dashboard.common.pagination")} className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label={t("dashboard.common.previous")}
        className={cn(CELL, "cursor-pointer border border-border text-heading hover:border-primary hover:text-brand disabled:pointer-events-none disabled:opacity-40")}
      >
        <ChevronLeft size={16} strokeWidth={2.2} aria-hidden className="rtl:rotate-180" />
      </button>

      {slots(page, count).map((slot, i) =>
        slot === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className={cn(CELL, "text-muted")}>
            …
          </span>
        ) : (
          <button
            key={slot}
            type="button"
            onClick={() => onPage(slot)}
            aria-current={slot === page ? "page" : undefined}
            className={cn(
              CELL,
              "cursor-pointer border",
              slot === page
                ? "border-primary bg-primary text-white"
                : "border-border text-heading hover:border-primary hover:text-brand",
            )}
          >
            {slot}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= count}
        aria-label={t("dashboard.common.next")}
        className={cn(CELL, "cursor-pointer border border-border text-heading hover:border-primary hover:text-brand disabled:pointer-events-none disabled:opacity-40")}
      >
        <ChevronRight size={16} strokeWidth={2.2} aria-hidden className="rtl:rotate-180" />
      </button>
    </nav>
  );
}
