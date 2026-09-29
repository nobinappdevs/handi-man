"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import {
  CalendarClock, Check, CreditCard, Eye, MapPin, Phone, Receipt, User, Wallet, X,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { SquareIconButton } from "@/components/ui/SquareIconButton";
import { cn } from "@/components/ui/cn";
import { STATUS_TONE, type OrderStatus } from "@/components/dashboard/page/history/historyData";
import { VENDOR_ORDERS, type VendorOrder } from "@/components/dashboard/page/vendor/vendorData";

const PILL_BASE =
  "inline-flex flex-none items-center gap-[7px] px-[9px] py-1 text-[11px] font-bold tracking-[0.1em] whitespace-nowrap uppercase";

export function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useLang();
  return (
    <span className={cn(PILL_BASE, STATUS_TONE[status])}>
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {t(`dashboard.history.status.${status}`)}
    </span>
  );
}

/** A vendor's decision on a still-`pending` job — local to this screen until
 *  a `PATCH` endpoint lands, same stand-in the pause/resume toggle uses on
 *  `VendorServices`. Not folded into `OrderStatus`: that vocabulary is shared
 *  with the customer-facing History screens and their step tracker, and a
 *  vendor's rejection is not a state a customer's order ever reaches there. */
type Decision = "accepted" | "rejected";

function RejectedPill() {
  const { t } = useLang();
  return (
    <span className={cn(PILL_BASE, "bg-danger/14 text-danger")}>
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {t("dashboard.vendor.orders.rejected")}
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
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [confirmReject, setConfirmReject] = useState<VendorOrder | null>(null);
  const title = (o: VendorOrder) => t(`${o.copyNs ?? "servicesPage.items"}.${o.serviceKey}.title`);

  function statusPillFor(order: VendorOrder) {
    const decision = decisions[order.no];
    if (decision === "rejected") return <RejectedPill />;
    return <StatusPill status={decision === "accepted" ? "processing" : order.status} />;
  }

  function accept(order: VendorOrder, e: MouseEvent) {
    e.stopPropagation();
    setDecisions((prev) => ({ ...prev, [order.no]: "accepted" }));
  }

  function reject(order: VendorOrder, e: MouseEvent) {
    e.stopPropagation();
    setConfirmReject(order);
  }

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
                    <td className="whitespace-nowrap">{order.schedule.time}, {order.schedule.date}</td>
                    <td>{statusPillFor(order)}</td>
                    <td className="text-end font-bold whitespace-nowrap text-heading">
                      {order.totals.payout}
                    </td>
                    <td className="text-end">
                      <span className="inline-flex items-center justify-end gap-2">
                        {order.status === "pending" && !decisions[order.no] && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={(e) => accept(order, e)}
                              leftIcon={<Check size={14} strokeWidth={2.6} aria-hidden />}
                            >
                              {t("dashboard.vendor.orders.accept")}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={(e) => reject(order, e)}
                              leftIcon={<X size={14} strokeWidth={2.6} aria-hidden />}
                            >
                              {t("dashboard.vendor.orders.reject")}
                            </Button>
                          </>
                        )}
                        <SquareIconButton
                          size={36}
                          onClick={(e) => { e.stopPropagation(); setOpen(order); }}
                          aria-label={t("dashboard.vendor.orders.viewDetails")}
                          title={t("dashboard.vendor.orders.viewDetails")}
                        >
                          <Eye size={15} strokeWidth={2} aria-hidden />
                        </SquareIconButton>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* `xl` + `accent`: the shell's own documented treatment for "the
          two-column record" — the same one `OrdersPanel` uses for a job opened
          from the overview, so an order reads the same wherever it is opened
          from. */}
      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        size="xl"
        tone="accent"
        labelledBy="vendor-order-title"
        icon={<Receipt size={16} strokeWidth={2} aria-hidden />}
        title={open ? `${t("dashboard.history.order")} #${open.no}` : ""}
      >
        {open && (
          <div className="flex flex-col gap-5 p-[clamp(16px,1.9vw,24px)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-sunk px-3.5 py-2.5">
              {statusPillFor(open)}
              <span className="text-[12.5px] text-muted">
                {t("dashboard.history.placedOn")} {open.placedOn}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-[clamp(14px,1.6vw,20px)] min-[760px]:grid-cols-2">
              <div className="flex min-w-0 flex-col border border-border p-[clamp(16px,1.7vw,22px)]">
                <h4 className="mb-1 text-[15.5px] font-semibold tracking-[-0.015em] text-heading">
                  {t("dashboard.overview.orderInfo")}
                </h4>
                <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.vendor.orders.service")} value={title(open)} />
                <Field icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.scheduleTime")} value={`${open.schedule.time}, ${open.schedule.date}`} />
                <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.address")} value={open.address} />
                <Field icon={<User size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.name")} value={open.customer} />
                <Field icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.phone")} value={open.phone} />
              </div>

              <div className="flex min-w-0 flex-col border border-border p-[clamp(16px,1.7vw,22px)]">
                <h4 className="mb-1 text-[15.5px] font-semibold tracking-[-0.015em] text-heading">
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
                  <span className="text-[20px] font-bold tracking-[-0.03em] text-brand">
                    {open.totals.payout}
                  </span>
                </div>
              </div>
            </div>

            {open.status === "pending" && !decisions[open.no] && (
              <div className="flex flex-wrap justify-end gap-2.5">
                <Button
                  variant="danger"
                  onClick={() => { setConfirmReject(open); }}
                  leftIcon={<X size={15} strokeWidth={2.6} aria-hidden />}
                >
                  {t("dashboard.vendor.orders.reject")}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => { setDecisions((prev) => ({ ...prev, [open.no]: "accepted" })); }}
                  leftIcon={<Check size={15} strokeWidth={2.6} aria-hidden />}
                >
                  {t("dashboard.vendor.orders.accept")}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Rejecting is the one decision here worth a confirm step — accepting
          only ever helps the vendor's queue, rejecting turns a job away. Both
          are local-only until `PATCH /vendors/orders/:no` exists; the toast and
          `invalidateQueries` move into that mutation's hook when it does, same
          as the pause/resume toggle on `VendorServices`. */}
      <ConfirmDialog
        open={confirmReject !== null}
        onClose={() => setConfirmReject(null)}
        tone="danger"
        icon={<X size={22} strokeWidth={2} aria-hidden />}
        title={t("dashboard.vendor.orders.rejectTitle")}
        description={confirmReject ? `#${confirmReject.no} · ${title(confirmReject)}` : ""}
        confirmLabel={t("dashboard.vendor.orders.reject")}
        onConfirm={() => {
          if (confirmReject) {
            setDecisions((prev) => ({ ...prev, [confirmReject.no]: "rejected" }));
          }
          setConfirmReject(null);
        }}
      />
    </>
  );
}
