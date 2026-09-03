"use client";

import { useState } from "react";
import { Banknote, CalendarClock, Hash, Receipt, Wallet } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { Field, StatusPill } from "@/components/dashboard/page/vendor/VendorOrders";
import { PAYOUT_ICON, PAYOUT_LOGS, type PayoutLog } from "@/components/dashboard/page/vendor/vendorData";

/**
 * Payout history — the same table-plus-modal split as the delivery log: the
 * columns are what you scan for, the fee breakdown and the settlement note
 * open on click.
 */
export function MoneyOutLogs() {
  const { t } = useLang();
  const [open, setOpen] = useState<PayoutLog | null>(null);

  const methodLabel = (m: string) =>
    t(`dashboard.history.payment.${m === "bank" ? "card" : m}`);

  return (
    <>
      <Panel>
        <PanelHeader title={t("dashboard.vendor.logs.title")}>
          <span className="flex-none text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {PAYOUT_LOGS.length} {t("dashboard.vendor.logs.payouts")}
          </span>
        </PanelHeader>

        <div className="scroll-x">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{t("dashboard.vendor.logs.colRef")}</th>
                <th>{t("dashboard.vendor.logs.colMethod")}</th>
                <th>{t("dashboard.vendor.logs.colRequested")}</th>
                <th>{t("dashboard.delivery.colStatus")}</th>
                <th className="text-end">{t("dashboard.vendor.logs.colReceived")}</th>
                <th>
                  <span className="sr-only">{t("dashboard.delivery.colActions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {PAYOUT_LOGS.map((row) => {
                const Icon = PAYOUT_ICON[row.method] ?? Banknote;
                return (
                  <tr
                    key={row.ref}
                    onClick={() => setOpen(row)}
                    className="cursor-pointer transition-colors hover:bg-sunk"
                  >
                    <td>
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                          <Icon size={16} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">
                            {row.amount}
                          </span>
                          <span className="text-[11.5px] font-medium tracking-[0.1em] text-muted uppercase">
                            #{row.ref}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap">{methodLabel(row.method)}</td>
                    <td className="whitespace-nowrap">{row.requestedOn}</td>
                    <td><StatusPill status={row.status} /></td>
                    <td className="text-end font-bold whitespace-nowrap text-heading">{row.received}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setOpen(row); }}
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
        labelledBy="payout-title"
        icon={<Wallet size={17} strokeWidth={2.2} aria-hidden />}
        title={open ? `${t("dashboard.vendor.logs.payout")} #${open.ref}` : ""}
      >
        {open && (
          <div className={`flex flex-col gap-6 ${PANEL_BODY}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-sunk px-3.5 py-2.5">
              <StatusPill status={open.status} />
              <span className="text-[12.5px] text-muted">{open.note}</span>
            </div>

            <section>
              <Field icon={<Hash size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.vendor.logs.colRef")} value={open.ref} />
              <Field icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.vendor.logs.colRequested")} value={open.requestedOn} />
              <Field icon={<Banknote size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.vendor.logs.colMethod")} value={methodLabel(open.method)} />
              <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.vendor.moneyOut.requesting")} value={open.amount} />
              <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.vendor.moneyOut.fee")} value={open.fee} />

              <div className="mt-3 flex items-center justify-between gap-4 border-t-2 border-border pt-3.5">
                <span className="text-[13px] font-bold tracking-[0.1em] text-heading uppercase">
                  {t("dashboard.vendor.logs.colReceived")}
                </span>
                <span className="text-[20px] font-bold tracking-[-0.03em] text-heading">
                  {open.received}
                </span>
              </div>
            </section>
          </div>
        )}
      </Modal>
    </>
  );
}
