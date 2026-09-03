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
      <div className="p-6 text-center">
        {icon && (
          <span className={cn("mx-auto flex h-12 w-12 items-center justify-center", toneCls)}>
            {icon}
          </span>
        )}
        <h3 className="mt-4 text-[18px] font-bold tracking-[-0.02em]">{title}</h3>
        {description && <p className="mt-1.5 text-[13.5px] leading-[1.55]">{description}</p>}

        {children}

        <div className="mt-6 flex gap-3">
          <Button variant="outline" fullWidth disabled={busy} onClick={onClose} className="flex-1">
            {cancelLabel ?? t("common.cancel")}
          </Button>
          <Button
            variant={tone === "primary" ? "primary" : "danger"}
            fullWidth
            loading={busy}
            disabled={confirmDisabled}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
