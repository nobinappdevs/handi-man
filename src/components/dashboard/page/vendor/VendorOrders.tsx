"use client";

import { useState, type ReactNode } from "react";
import {
  CalendarClock, CreditCard, MapPin, Phone, Receipt, User, Wallet,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { cn } from "@/components/ui/cn";
import { STATUS_TONE, type OrderStatus } from "@/components/dashboard/page/history/historyData";
import { VENDOR_ORDERS, type VendorOrder } from "@/components/dashboard/page/vendor/vendorData";

export function StatusPill({ status }: { status: OrderStatus }) {
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

/** Shared with the payout log — a label/value line that says "—" when empty. */
export function Field({ icon, label, value }: { icon: ReactNode; label: string; value?: string | number }) {
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

/**
 * The vendor's side of the bookings the customer sees in History.
 *
 * Table + modal, the same split as the delivery log: the columns are what you
 * scan a job queue for, and the customer's contact details and the payout
 * breakdown open on click.
 */
export function VendorOrders() {
  const { t } = useLang();
  const [open, setOpen] = useState<VendorOrder | null>(null);
  const title = (o: VendorOrder) => t(`${o.copyNs ?? "servicesPage.items"}.${o.serviceKey}.title`);

  return (
    <>
      <Panel>
        <PanelHeader title={t("dashboard.vendor.orders.title")}>
          <span className="flex-none text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {VENDOR_ORDERS.length} {t("dashboard.vendor.orders.jobs")}
          </span>
        </PanelHeader>

        <div className="scroll-x">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{t("dashboard.vendor.orders.colJob")}</th>
                <th>{t("dashboard.vendor.orders.colCustomer")}</th>
                <th>{t("dashboard.vendor.orders.colSchedule")}</th>
                <th>{t("dashboard.delivery.colStatus")}</th>
                <th className="text-end">{t("dashboard.vendor.orders.colPayout")}</th>
                <th>
                  <span className="sr-only">{t("dashboard.delivery.colActions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {VENDOR_ORDERS.map((order) => {
                const Icon = order.icon;
                return (
                  <tr
                    key={order.no}
                    onClick={() => setOpen(order)}
                    className="cursor-pointer transition-colors hover:bg-sunk"
                  >
                    <td>
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                          <Icon size={16} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">
                            {title(order)}
                          </span>
                          <span className="text-[11.5px] font-medium tracking-[0.1em] text-muted uppercase">
                            #{order.no}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap">{order.customer}</td>
                    <td className="whitespace-nowrap">{order.schedule}</td>
                    <td><StatusPill status={order.status} /></td>
                    <td className="text-end font-bold whitespace-nowrap text-heading">
                      {order.totals.payout}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        size="lg"
        labelledBy="vendor-order-title"
        icon={<Receipt size={17} strokeWidth={2.2} aria-hidden />}
        title={open ? `${t("dashboard.history.order")} #${open.no}` : ""}
      >
        {open && (
          <div className={`flex flex-col gap-6 ${PANEL_BODY}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-sunk px-3.5 py-2.5">
              <StatusPill status={open.status} />
              <span className="text-[12.5px] text-muted">
                {t("dashboard.history.placedOn")} {open.placedOn}
              </span>
            </div>

            <section>
              <h4 className="mb-1 text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">
                {t("dashboard.vendor.orders.jobSection")}
              </h4>
              <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.vendor.orders.service")} value={title(open)} />
              <Field icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.scheduleTime")} value={open.schedule} />
              <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.address")} value={open.address} />
            </section>

            <section>
              <h4 className="mb-1 text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">
                {t("dashboard.vendor.orders.customerSection")}
              </h4>
              <Field icon={<User size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.name")} value={open.customer} />
              <Field icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.phone")} value={open.phone} />
            </section>

            <section>
              <h4 className="mb-1 text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">
                {t("dashboard.vendor.orders.payoutSection")}
              </h4>
              <Field icon={<CreditCard size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.paymentType")} value={t(`dashboard.history.payment.${open.payment}`)} />
              <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.subtotal")} value={open.totals.subtotal} />
              <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.vendor.orders.commission")} value={open.totals.charge} />

              <div className="mt-3 flex items-center justify-between gap-4 border-t-2 border-border pt-3.5">
                <span className="flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-heading uppercase">
                  <Wallet size={14} strokeWidth={2.2} aria-hidden />
                  {t("dashboard.vendor.orders.yourPayout")}
                </span>
                <span className="text-[20px] font-bold tracking-[-0.03em] text-heading">
                  {open.totals.payout}
                </span>
              </div>
            </section>
          </div>
        )}
      </Modal>
    </>
  );
}
