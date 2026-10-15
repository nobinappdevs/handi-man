"use client";

import type { ReactNode } from "react";
import { useLang } from "@/hooks/useLang";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/dashboard/Modal";
import { cn } from "@/components/ui/cn";

/**
 * A destructive-or-not confirmation. The portal, Escape handling and scroll
 * lock all come from `Modal`; this only lays out the icon, copy and buttons.
 *
 * `children` is the slot for anything the confirmation itself needs — the 2FA
 * toggle puts its authenticator-code field there — which is why this is not
 * just a message box.
 *
 * ── It is a `<form>`, and that matters ──
 * Because `children` can hold a field, the body has to submit on Enter. It used
 * to be a `<div>` with the confirm wired to `onClick`, so typing a 2FA code and
 * pressing Enter did nothing at all and the user had to reach for the mouse.
 * Now the confirm button is `type="submit"` and Enter in any field inside
 * `children` runs the same path as clicking it.
 *
 * Consequence for callers: do NOT pass a `<form>` in `children` — nested forms
 * are invalid HTML and the inner one is dropped. Pass the fields alone, as the
 * 2FA panel does.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  icon,
  tone = "primary",
  busy = false,
  confirmDisabled = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel?: ReactNode;
  icon?: ReactNode;
  tone?: "primary" | "danger" | "warn";
  busy?: boolean;
  confirmDisabled?: boolean;
  children?: ReactNode;
}) {
  const { t } = useLang();

  const toneCls =
    tone === "danger" ? "bg-danger/14 text-danger"
    : tone === "warn" ? "bg-warn/14 text-warn"
    : "bg-brand/14 text-brand";

  return (
    <Modal open={open} onClose={onClose} busy={busy} size="sm">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          // Enter reaches here even when the confirm button is disabled, so the
          // guard lives in the handler rather than relying on the button alone.
          if (busy || confirmDisabled) return;
          onConfirm();
        }}
        className="p-6 text-center"
      >
        {icon && (
          <span className={cn("mx-auto flex h-12 w-12 items-center justify-center", toneCls)}>
            {icon}
          </span>
        )}
        <h3 className="mt-4 text-[18px] font-bold tracking-[-0.02em]">{title}</h3>
        {description && <p className="mt-1.5 text-[13.5px] leading-[1.55]">{description}</p>}

        {children}

        <div className="mt-6 flex gap-3">
          {/* Explicitly `type="button"` — inside a form, a bare button submits. */}
          <Button
            type="button"
            variant="outline"
            fullWidth
            disabled={busy}
            onClick={onClose}
            className="flex-1"
          >
            {cancelLabel ?? t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant={tone === "primary" ? "primary" : "danger"}
            fullWidth
            loading={busy}
            disabled={confirmDisabled}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
