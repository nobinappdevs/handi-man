"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, Check, MapPin, Package, Phone, Receipt, User } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY } from "@/components/dashboard/Panel";
import { CARD_PHOTOS } from "@/components/services/servicesData";
import { cn } from "@/components/ui/cn";
import {
  findOrder, ordersFor, ORDER_STEPS, STATUS_TONE,
  type OrderItem, type OrderKind, type ServiceOrder,
} from "@/components/dashboard/page/history/historyData";

/** Thumbnail: the catalogue photo when there is one, its icon otherwise —
 *  the same pairing the services catalogue uses, so one service looks like
 *  itself wherever it appears. */
function Thumb({ item }: { item: OrderItem }) {
  const photo = CARD_PHOTOS[item.key];
  const Icon = item.icon;
  return (
    <span className="relative flex h-16 w-16 flex-none overflow-hidden border border-border">
      {photo ? (
        <Image src={photo} alt="" aria-hidden fill sizes="64px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-brand/12 text-brand">
          <Icon size={22} strokeWidth={1.6} aria-hidden />
        </span>
      )}
    </span>
  );
}

function StatusPill({ status }: { status: ServiceOrder["status"] }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center gap-[7px] px-[11px] py-1.5 text-[11.5px] font-bold tracking-[0.12em] uppercase",
        STATUS_TONE[status],
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {t(`dashboard.history.status.${status}`)}
    </span>
  );
}

function ItemRow({ item }: { item: OrderItem }) {
  const { t } = useLang();
  const ns = item.copyNs ?? "servicesPage.items";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-[clamp(16px,1.8vw,24px)] py-4 not-last:border-b not-last:border-border">
      <Thumb item={item} />
      <span className="min-w-[180px] flex-auto text-[15px] font-bold tracking-[-0.015em] text-heading">
        {t(`${ns}.${item.key}.title`)}
      </span>
      <span className="flex-none text-[13px] font-medium text-muted">
        {t("dashboard.history.qty")} {item.qty}
      </span>
      <span className="flex-none text-[15px] font-bold tracking-[-0.02em] text-heading">{item.price}</span>
    </div>
  );
}

/* ─────────────────────────── list ─────────────────────────── */

function OrderList({ kind }: { kind: OrderKind }) {
  const { t } = useLang();
  const orders = ordersFor(kind);

  if (orders.length === 0) {
    return (
      <Panel>
        <div className={`flex flex-col items-center gap-4 py-[clamp(32px,5vw,64px)] text-center ${PANEL_BODY}`}>
          <span className="flex h-14 w-14 items-center justify-center bg-brand/14 text-brand">
            <Receipt size={24} strokeWidth={1.8} aria-hidden />
          </span>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-heading">
            {t("dashboard.history.emptyTitle")}
          </span>
          <p className="max-w-[42ch] text-[13.5px] leading-[1.55]">{t("dashboard.history.emptyBody")}</p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      {orders.map((order) => (
        <Panel key={order.no}>
          {/* Order-level header. The old screen put the status on the item row,
              which only worked because every order had exactly one item — an
              order with two would have claimed two different statuses. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border bg-sunk px-[clamp(16px,1.8vw,24px)] py-3.5">
            <span className="flex min-w-0 flex-auto flex-col gap-1">
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="text-[15px] font-bold tracking-[-0.015em] text-heading">
                  {t("dashboard.history.order")} #{order.no}
                </span>
                <span className="text-[12px] font-bold tracking-[0.1em] text-brand uppercase">
                  {t(`dashboard.history.payment.${order.payment}`)}
                </span>
              </span>
              <span className="text-[12.5px] text-muted">
                {t("dashboard.history.placedOn")} {order.placedOn}
              </span>
            </span>

            <StatusPill status={order.status} />

            <Link
              href={`/dashboard/history/${kind}?order=${order.no}`}
              className="flex flex-none items-center gap-2 text-[12.5px] font-bold tracking-[0.12em] text-brand uppercase"
            >
              {t("dashboard.history.manage")}
              <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
            </Link>
          </div>

          <div className="flex flex-col">
            {order.items.map((item) => (
              <ItemRow key={item.key} item={item} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border px-[clamp(16px,1.8vw,24px)] py-3">
            <span className="text-[12px] font-bold tracking-[0.12em] text-muted uppercase">
              {t("dashboard.history.total")}
            </span>
            <span className="text-[16px] font-bold tracking-[-0.02em] text-heading">
              {order.totals.total}
            </span>
          </div>
        </Panel>
      ))}
    </div>
  );
}

/* ─────────────────────────── detail ─────────────────────────── */

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 not-last:border-b not-last:border-border">
      <span className="flex items-center gap-2 text-[13px] text-muted">
        <span className="flex-none text-muted">{icon}</span>
        {label}
      </span>
      <span className="text-end text-[13.5px] font-bold text-heading">{value}</span>
    </div>
  );
}

function Tracker({ status }: { status: ServiceOrder["status"] }) {
  const { t } = useLang();
  const current = ORDER_STEPS.indexOf(status);

  return (
    <ol className="flex items-start">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
            {/* The rail is drawn by the dot's own row so it can sit behind the
                dot and stop at the last one, rather than needing a wrapper per
                gap. `first`/`last` clip the halves that would hang off. */}
            <span className="relative flex h-3 w-full items-center justify-center">
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-1/2 start-0 h-0.5 w-1/2 -translate-y-1/2",
                  i === 0 ? "bg-transparent" : i <= current ? "bg-primary" : "bg-border",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-1/2 end-0 h-0.5 w-1/2 -translate-y-1/2",
                  i === ORDER_STEPS.length - 1 ? "bg-transparent" : i < current ? "bg-primary" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "relative flex h-3.5 w-3.5 items-center justify-center rounded-full",
                  done ? "bg-primary text-white" : "bg-border",
                )}
              >
                {done && <Check size={9} strokeWidth={4} aria-hidden />}
              </span>
            </span>
            <span
              className={cn(
                "text-center text-[12px] font-bold tracking-[0.1em] uppercase",
                done ? "text-heading" : "text-muted",
              )}
            >
              {t(`dashboard.history.status.${step}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetail({ kind, order }: { kind: OrderKind; order: ServiceOrder }) {
  const { t } = useLang();

  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      <Link
        href={`/dashboard/history/${kind}`}
        className="flex w-fit items-center gap-2 text-[12.5px] font-bold tracking-[0.12em] text-brand uppercase"
      >
        <ArrowLeft size={14} strokeWidth={2.6} aria-hidden />
        {t("dashboard.history.backToList")}
      </Link>

      <Panel>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border bg-sunk px-[clamp(16px,1.8vw,24px)] py-3.5">
          <span className="flex min-w-0 flex-auto flex-col gap-1">
            <span className="text-[16px] font-bold tracking-[-0.015em] text-heading">
              {t("dashboard.history.order")} #{order.no}
            </span>
            <span className="text-[12.5px] text-muted">
              {t("dashboard.history.placedOn")} {order.placedOn}
            </span>
          </span>
          <StatusPill status={order.status} />
        </div>
        <div className={`${PANEL_BODY} pt-6 pb-7`}>
          <Tracker status={order.status} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title={t("dashboard.history.itemsTitle")} />
        <div className="flex flex-col">
          {order.items.map((item) => (
            <ItemRow key={item.key} item={item} />
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 items-start gap-[clamp(16px,1.8vw,24px)] min-[1180px]:grid-cols-2">
        <Panel>
          <PanelHeader title={t("dashboard.history.scheduleTitle")} />
          <div className={PANEL_BODY}>
            <Row icon={<User size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.name")} value={order.schedule.name} />
            <Row icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.addressType")} value={t(`dashboard.address.labels.${order.schedule.addressLabel}`)} />
            <Row icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.scheduleDate")} value={order.schedule.date} />
            <Row icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.scheduleTime")} value={order.schedule.time} />
            <Row icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.address")} value={order.schedule.address} />
            <Row icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.phone")} value={order.schedule.phone} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title={t("dashboard.history.summaryTitle")} />
          <div className={PANEL_BODY}>
            <Row icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.subtotal")} value={order.totals.subtotal} />
            <Row icon={<Package size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.charge")} value={order.totals.charge} />
            <Row icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.discount")} value={order.totals.discount} />

            <div className="mt-3 flex items-center justify-between gap-4 border-t-2 border-border pt-3.5">
              <span className="text-[13px] font-bold tracking-[0.1em] text-heading uppercase">
                {t("dashboard.history.total")}
              </span>
              <span className="text-[20px] font-bold tracking-[-0.03em] text-heading">{order.totals.total}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 border border-border bg-sunk px-3.5 py-2.5">
              <span className="text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
                {t("dashboard.history.paymentType")}
              </span>
              <span className="text-[12.5px] font-bold tracking-[0.1em] text-brand uppercase">
                {t(`dashboard.history.payment.${order.payment}`)}
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ─────────────────────────── screen ─────────────────────────── */

/**
 * List and detail in one screen, selected by `?order=`.
 *
 * A static export cannot prerender `[no]` without `generateStaticParams`, and
 * order numbers are not known at build time — so the detail is a query param,
 * which is the project's rule for every dynamic detail page. `useSearchParams`
 * must sit under a `<Suspense>` boundary; the route file provides it.
 */
export function OrderHistory({ kind }: { kind: OrderKind }) {
  const { t } = useLang();
  const params = useSearchParams();
  const requested = params.get("order");
  const order = findOrder(kind, requested);

  if (requested && !order) {
    return (
      <Panel>
        <div className={`flex flex-col items-center gap-4 py-[clamp(32px,5vw,64px)] text-center ${PANEL_BODY}`}>
          <span className="flex h-14 w-14 items-center justify-center bg-warn/14 text-warn">
            <Receipt size={24} strokeWidth={1.8} aria-hidden />
          </span>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-heading">
            {t("dashboard.history.notFoundTitle")}
          </span>
          <p className="max-w-[42ch] text-[13.5px] leading-[1.55]">{t("dashboard.history.notFoundBody")}</p>
          <Link
            href={`/dashboard/history/${kind}`}
            className="flex items-center gap-2 text-[12.5px] font-bold tracking-[0.12em] text-brand uppercase"
          >
            <ArrowLeft size={14} strokeWidth={2.6} aria-hidden />
            {t("dashboard.history.backToList")}
          </Link>
        </div>
      </Panel>
    );
  }

  return order ? <OrderDetail kind={kind} order={order} /> : <OrderList kind={kind} />;
}
