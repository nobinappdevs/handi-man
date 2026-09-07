"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useIsClient } from "@/hooks/useIsClient";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";

/**
 * The dashboard's modal shell — portal, backdrop, Escape, scroll lock.
 *
 * Portalled to `<body>` rather than rendered in place: the rail and header are
 * `sticky` with their own stacking contexts, and a dialog inside `<main>`
 * cannot reliably paint over them however high its z-index.
 *
 * Everything modal in here goes through this, so the two behaviours that are
 * easy to get wrong — Escape while a request is in flight, and the page
 * scrolling underneath — are decided once. `busy` disables every dismissal:
 * tearing the dialog away mid-request leaves the user unsure whether it landed.
 */
const WIDTH = { sm: "max-w-sm", lg: "max-w-lg", xl: "max-w-[980px]" } as const;

export function Modal({
  open,
  onClose,
  busy = false,
  size = "sm",
  tone = "plain",
  title,
  icon,
  aside,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  busy?: boolean;
  /** `sm` for a confirmation, `lg` for a form, `xl` for the two-column record. */
  size?: keyof typeof WIDTH;
  /**
   * `accent` puts the header on a plum bar in white — the design's treatment
   * for a RECORD you opened (an order, a receipt), as against the plain
   * header a form or a confirmation gets.
   */
  tone?: "plain" | "accent";
  /** Header row. Omit for a bare panel (the confirm dialog centres its own). */
  title?: ReactNode;
  icon?: ReactNode;
  /** Trailing header slot, before the close button — a reference number. */
  aside?: ReactNode;
  children: ReactNode;
  labelledBy?: string;
}) {
  const { t } = useLang();
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onClose]);

  if (!open || !isClient) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[rgba(6,4,4,0.55)] p-4"
      onClick={() => { if (!busy) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "my-auto max-h-[90dvh] w-full overflow-y-auto border border-border bg-card shadow-[0_40px_80px_-40px_rgba(18,16,15,0.6)]",
          WIDTH[size],
        )}
      >
        {title != null && (
          <div
            className={cn(
              "flex items-center gap-3 p-[clamp(16px,1.8vw,22px)]",
              tone === "accent" ? "bg-primary" : "border-b border-border",
            )}
          >
            {icon && (
              <span
                className={cn(
                  "flex flex-none items-center justify-center",
                  tone === "accent" ? "h-[30px] w-[30px] bg-white/15 text-white" : "h-9 w-9 bg-brand/14 text-brand",
                )}
              >
                {icon}
              </span>
            )}
            <h3
              id={labelledBy}
              className={cn(
                "min-w-0 flex-auto truncate",
                tone === "accent"
                  ? "text-[16.5px] font-semibold tracking-[-0.015em] text-white"
                  : "text-[17px] font-bold tracking-[-0.02em]",
              )}
            >
              {title}
            </h3>
            {aside && (
              <span
                className={cn(
                  "flex-none text-[13px] whitespace-nowrap tabular-nums",
                  tone === "accent" ? "text-white/70" : "text-muted",
                )}
              >
                {aside}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label={t("common.close")}
              className={cn(
                "flex flex-none cursor-pointer items-center justify-center transition-colors disabled:opacity-50",
                tone === "accent"
                  ? "h-8 w-8 border border-white/30 text-white hover:bg-white/15"
                  : "h-8 w-8 text-muted hover:text-heading",
              )}
            >
              <X size={tone === "accent" ? 15 : 16} strokeWidth={2.4} aria-hidden />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
