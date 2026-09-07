"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useDismiss } from "@/hooks/useDismiss";
import { cn } from "@/components/ui/cn";
import { SquareIconButton } from "@/components/ui/SquareIconButton";
import {
  DASH_ROUTES, notificationsFor, type DashArea, type Notification,
} from "@/components/dashboard/dashboardData";

/**
 * The header bell and what it drops down.
 *
 * Self-contained rather than coordinated with the profile menu beside it:
 * both dismiss on an outside `pointerdown`, and opening one IS a pointerdown
 * outside the other, so they are mutually exclusive without either knowing
 * the other exists.
 *
 * Read state is a list of ids, not a copy of the rows. The area can change
 * under this component — customer rail to vendor rail is a client navigation
 * inside the same layout — and a cloned list would keep showing the notices
 * of the dashboard you just left.
 */
const TONE: Record<Notification["tone"], string> = {
  brand: "bg-brand/12 text-brand",
  ok: "bg-ok/12 text-ok",
  warn: "bg-warn/12 text-warn",
  danger: "bg-danger/12 text-danger",
};

export function NotificationMenu({ area }: { area: DashArea }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const wrap = useDismiss(open, () => setOpen(false));

  const items = notificationsFor(area);
  const isUnread = (n: Notification) => n.unread && !read.includes(n.id);
  const unread = items.filter(isUnread).length;

  return (
    <div ref={wrap} className="relative">
      <SquareIconButton
        onClick={() => setOpen((v) => !v)}
        aria-label={t("dashboard.notifications")}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn("relative", open && "border-primary text-brand")}
      >
        <Bell size={18} strokeWidth={2} aria-hidden />
        {/* The ring is `--bar`, so the dot reads as punched out of the bar. */}
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute top-1.75 right-2 h-1.75 w-1.75 bg-primary shadow-[0_0_0_2px_rgb(var(--bg))]"
          />
        )}
      </SquareIconButton>

      {open && (
        <div
          role="menu"
          aria-label={t("dashboard.notifications")}
          className="absolute end-0 top-[calc(100%+9px)] flex w-[min(360px,calc(100vw-32px))] flex-col border border-border bg-card shadow-[0_30px_60px_-30px_rgba(18,16,15,0.5)]"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
            <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.015em] text-heading">
              <span aria-hidden className="h-3.75 w-0.75 flex-none bg-primary" />
              {t("dashboard.notify.title")}
            </h2>
            {unread > 0 && (
              <>
                <span className="flex-none bg-brand/10 px-2.25 py-0.75 text-[11.5px] font-medium text-brand tabular-nums">
                  {unread}
                </span>
                <button
                  type="button"
                  onClick={() => setRead(items.map((n) => n.id))}
                  className="ms-auto flex-none cursor-pointer text-[12.5px] font-medium text-brand transition-colors hover:text-primary-lite"
                >
                  {t("dashboard.notify.markAll")}
                </button>
              </>
            )}
          </div>

          {/* Capped and scrolled: the bar is `sticky`, so a list long enough to
              run past the fold would have no way to reach its own bottom. */}
          <div className="flex max-h-[min(60vh,392px)] flex-col overflow-y-auto">
            {items.length === 0 && (
              <span className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
                <BellOff size={20} strokeWidth={1.6} aria-hidden className="text-muted" />
                <span className="text-[13px] text-muted">{t("dashboard.notify.empty")}</span>
              </span>
            )}
            {items.map((item) => (
              <Row
                key={item.id}
                item={item}
                unread={isUnread(item)}
                onOpen={() => {
                  setRead((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
                  if (item.page) setOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * A link when the notice has a screen that answers it, a button when it is
 * only news — either way the whole row is the target, and opening it marks it
 * read.
 */
function Row({
  item,
  unread,
  onOpen,
}: {
  item: Notification;
  unread: boolean;
  onOpen: () => void;
}) {
  const { t } = useLang();
  const Icon = item.icon;

  const body = (
    <>
      <span
        aria-hidden
        className={cn("absolute inset-y-0 start-0 w-0.5", unread ? "bg-primary" : "bg-transparent")}
      />
      <span
        className={cn("flex h-9 w-9 flex-none items-center justify-center", TONE[item.tone])}
      >
        <Icon size={16} strokeWidth={1.8} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-auto flex-col gap-1">
        <span
          className={cn(
            "text-[13.5px] text-heading",
            unread ? "font-semibold" : "font-medium",
          )}
        >
          {t(`dashboard.notify.items.${item.key}.title`)}
        </span>
        <span className="text-[12.5px] leading-normal text-muted">
          {t(`dashboard.notify.items.${item.key}.body`)}
        </span>
        <span className="text-[11.5px] text-muted">{item.at}</span>
      </span>
      {unread && <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none bg-primary" />}
    </>
  );

  const cls =
    "group relative flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-sunk";

  return item.page ? (
    <Link href={DASH_ROUTES[item.page]} role="menuitem" onClick={onOpen} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" role="menuitem" onClick={onOpen} className={cn(cls, "cursor-pointer")}>
      {body}
    </button>
  );
}
