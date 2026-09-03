"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDownToLine, CalendarClock, CreditCard, MapPin, Package, Phone,
  Receipt, Store, User,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { cn } from "@/components/ui/cn";
import {
  deliveryOrders, STATUS_TONE,
  type DeliveryOrder, type OrderStatus,
} from "@/components/dashboard/page/history/historyData";

function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center gap-[7px] px-[9px] py-1 text-[11px] font-bold tracking-[0.1em] whitespace-nowrap uppercase",
        STATUS_TONE[status],
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {t(`dashboard.history.status.${status}`)}
    </span>
  );
}

/**
 * One field in the modal.
 *
 * An empty value renders as an em dash rather than an empty row. The old screen
 * left eight blank lines on a typical parcel, which reads as a broken layout;
 * a dash says "we asked, it was not given".
 */
function Field({ icon, label, value }: { icon: ReactNode; label: string; value?: string | number }) {
  const has = value !== undefined && value !== null && String(value).trim() !== "";
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 not-last:border-b not-last:border-border">
      <span className="flex items-center gap-2 text-[13px] text-muted">
        <span className="flex-none">{icon}</span>
        {label}
      </span>
      <span className={cn("text-end text-[13.5px]", has ? "font-bold text-heading" : "text-muted")}>
        {has ? value : "—"}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-1 text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">{title}</h4>
      {children}
    </section>
  );
}

function DetailModal({ order, onClose }: { order: DeliveryOrder | null; onClose: () => void }) {
  const { t } = useLang();
  const k = (s: string) => t(`dashboard.delivery.${s}`);

  return (
    <Modal
      open={order !== null}
      onClose={onClose}
      size="lg"
      labelledBy="delivery-modal-title"
      icon={<ArrowDownToLine size={17} strokeWidth={2.2} aria-hidden />}
      title={order ? `${t("dashboard.history.order")} #${order.no}` : ""}
    >
      {order && (
        <div className="flex flex-col gap-6 p-[clamp(16px,1.8vw,22px)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-sunk px-3.5 py-2.5">
            <StatusPill status={order.status} />
            <span className="text-[12.5px] text-muted">
              {t("dashboard.history.placedOn")} {order.placedOn}
            </span>
          </div>

          <Section title={k("parcelSection")}>
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("parcelName")} value={order.parcel.name} />
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("brand")} value={order.parcel.brand} />
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("size")} value={order.parcel.size} />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={k("price")} value={order.parcel.price} />
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("quantity")} value={order.parcel.quantity} />
            <Field icon={<Store size={13} strokeWidth={2} aria-hidden />} label={k("shop")} value={order.parcel.shop} />
            <Field icon={<Store size={13} strokeWidth={2} aria-hidden />} label={k("shopAddress")} value={order.parcel.shopAddress} />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={k("details")} value={order.parcel.details} />
          </Section>

          <Section title={k("pickupSection")}>
            <Field icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />} label={k("schedule")} value={order.schedule} />
            <Field icon={<User size={13} strokeWidth={2} aria-hidden />} label={k("name")} value={order.pickup.name} />
            <Field icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={k("phone")} value={order.pickup.phone} />
            <Field
              icon={<MapPin size={13} strokeWidth={2} aria-hidden />}
              label={k("addressType")}
              value={t(`dashboard.address.labels.${order.pickup.addressLabel}`)}
            />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("address")} value={order.pickup.address} />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("landmark")} value={order.pickup.landmark} />
          </Section>

          <Section title={k("dropoffSection")}>
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("shortAddress")} value={order.dropoff.shortAddress} />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("fullAddress")} value={order.dropoff.fullAddress} />
            <Field icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={k("deliveryPhone")} value={order.dropoff.phone} />
          </Section>

          <Section title={k("paymentSection")}>
            <Field
              icon={<CreditCard size={13} strokeWidth={2} aria-hidden />}
              label={k("paymentType")}
              value={t(`dashboard.history.payment.${order.payment}`)}
            />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.subtotal")} value={order.totals.subtotal} />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.charge")} value={order.totals.charge} />

            <div className="mt-3 flex items-center justify-between gap-4 border-t-2 border-border pt-3.5">
              <span className="text-[13px] font-bold tracking-[0.1em] text-heading uppercase">
                {k("totalPayable")}
              </span>
              <span className="text-[20px] font-bold tracking-[-0.03em] text-heading">
                {order.totals.total}
              </span>
            </div>
          </Section>
        </div>
      )}
    </Modal>
  );
}

/**
 * The delivery log as a TABLE.
 *
 * A parcel record has twenty-odd fields and most are blank, so the old screen
 * stacked every one of them into a card per delivery and you scrolled a screen
 * and a half to see two parcels. The five columns here are the ones you scan a
 * log for; everything else opens in a modal.
 *
 * Not a `<div>` grid, unlike the jobs table: nothing here is a link, so a real
 * `<table>` gets the row/column semantics for free — and `.scroll-x` +
 * `.dash-table` in globals.css exist exactly for this, keeping every column and
 * scrolling sideways on a phone rather than hiding data.
 *
 * The row is clickable for convenience, but the accessible control is the real
 * `<button>` in the last cell — a `<tr>` cannot take focus.
 */
export function DeliveryLog() {
  const { t } = useLang();
  const orders = deliveryOrders();
  const [open, setOpen] = useState<DeliveryOrder | null>(null);

  if (orders.length === 0) {
    return (
      <Panel>
        <div className={`flex flex-col items-center gap-4 py-[clamp(32px,5vw,64px)] text-center ${PANEL_BODY}`}>
          <span className="flex h-14 w-14 items-center justify-center bg-brand/14 text-brand">
            <ArrowDownToLine size={24} strokeWidth={1.8} aria-hidden />
          </span>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-heading">
            {t("dashboard.delivery.emptyTitle")}
          </span>
          <p className="max-w-[42ch] text-[13.5px] leading-[1.55]">
            {t("dashboard.delivery.emptyBody")}
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel>
        <PanelHeader title={t("dashboard.delivery.logTitle")}>
          <span className="flex-none text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {orders.length} {t("dashboard.delivery.parcels")}
          </span>
        </PanelHeader>

        <div className="scroll-x">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{t("dashboard.delivery.colParcel")}</th>
                <th>{t("dashboard.delivery.colSchedule")}</th>
                <th>{t("dashboard.delivery.colTo")}</th>
                <th>{t("dashboard.delivery.colStatus")}</th>
                <th className="text-end">{t("dashboard.delivery.colTotal")}</th>
                <th>
                  <span className="sr-only">{t("dashboard.delivery.colActions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.no}
                  onClick={() => setOpen(order)}
                  className="cursor-pointer transition-colors hover:bg-sunk"
                >
                  <td>
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                        <ArrowDownToLine size={16} strokeWidth={2} aria-hidden />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">
                          {order.parcel.name}
                        </span>
                        <span className="text-[11.5px] font-medium tracking-[0.1em] text-muted uppercase">
                          #{order.no} · {t("dashboard.history.qty")} {order.parcel.quantity}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap">{order.schedule}</td>
                  <td>{order.dropoff.shortAddress || order.dropoff.fullAddress || "—"}</td>
                  <td>
                    <StatusPill status={order.status} />
                  </td>
                  <td className="text-end font-bold whitespace-nowrap text-heading">
                    {order.totals.total}
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setOpen(order); }}
                      className="cursor-pointer text-[12px] font-bold tracking-[0.12em] whitespace-nowrap text-brand uppercase transition-opacity hover:opacity-70"
                    >
                      {t("dashboard.delivery.viewAll")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <DetailModal order={open} onClose={() => setOpen(null)} />
    </>
  );
}
