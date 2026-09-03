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
export function Modal({
  open,
  onClose,
  busy = false,
  size = "sm",
  title,
  icon,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  busy?: boolean;
  /** `sm` for a confirmation, `lg` for a form. */
  size?: "sm" | "lg";
  /** Header row. Omit for a bare panel (the confirm dialog centres its own). */
  title?: ReactNode;
  icon?: ReactNode;
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
          size === "lg" ? "max-w-lg" : "max-w-sm",
        )}
      >
        {title != null && (
          <div className="flex items-center gap-3 border-b border-border p-[clamp(16px,1.8vw,22px)]">
            {icon && (
              <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                {icon}
              </span>
            )}
            <h3 id={labelledBy} className="min-w-0 flex-auto truncate text-[17px] font-bold tracking-[-0.02em]">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label={t("common.close")}
              className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center text-muted transition-colors hover:text-heading disabled:opacity-50"
            >
              <X size={16} strokeWidth={2.4} aria-hidden />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
