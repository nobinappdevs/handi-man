"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Banknote,
  CalendarClock,
  Hash,
  Receipt,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY, SkLine } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { Field } from "@/components/dashboard/page/vendor/VendorOrders";
import { cn } from "@/components/ui/cn";
import { useMoneyOutInfo } from "@/hooks/useMoneyOut";
import { formatMoneyString, formatRateString, formatDate, formatDateTime } from "@/lib/money";
import type { MoneyOutTransaction } from "@/services/moneyout.service";

/*
 * Payout history — the table and its record modal.
 *
 * Lives on its own because two screens show it: the logs page in full, and the
 * withdraw page as a short recent list under the form. One implementation, so a
 * column added in one place cannot go missing in the other.
 *
 * There is no logs endpoint — the rows arrive in `transactions` on
 * `/vendors/money-out/info`, the same call the withdraw form makes, so both
 * screens share a single query and the second costs nothing.
 */

/* ── status ──
 *
 * The API sends a LABEL ("Rejected"), not a code, and a `status_info` legend
 * ({ success: 1, pending: 2, rejected: 3 }) beside it. Matching the lower-cased
 * label covers both: a numeric `status` resolves through the legend, and
 * anything unrecognised still renders, just without a colour.
 */
type PayoutTone = "success" | "pending" | "rejected" | "unknown";

const TONE: Record<PayoutTone, string> = {
  success: "bg-ok/14 text-ok",
  pending: "bg-warn/14 text-warn",
  rejected: "bg-danger/14 text-danger",
  unknown: "bg-sunk text-muted",
};

function toneFor(row: MoneyOutTransaction): PayoutTone {
  const raw = row.status;
  if (typeof raw === "string") {
    const key = raw.trim().toLowerCase();
    if (key === "success" || key === "approved" || key === "complete" || key === "completed")
      return "success";
    if (key === "pending" || key === "processing") return "pending";
    if (key === "rejected" || key === "cancelled" || key === "canceled") return "rejected";
    return "unknown";
  }
  const legend = row.status_info ?? {};
  const hit = Object.entries(legend).find(([, code]) => code === raw)?.[0];
  if (hit === "success") return "success";
  if (hit === "pending") return "pending";
  if (hit === "rejected") return "rejected";
  return "unknown";
}

/** The label as the API worded it — it is already human-readable. */
function statusLabel(row: MoneyOutTransaction): string {
  if (typeof row.status === "string" && row.status.trim()) return row.status;
  const legend = row.status_info ?? {};
  const hit = Object.entries(legend).find(([, code]) => code === row.status)?.[0];
  return hit ? hit[0].toUpperCase() + hit.slice(1) : String(row.status ?? "—");
}

function PayoutPill({ row }: { row: MoneyOutTransaction }) {
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center gap-[7px] px-[9px] py-1 text-[11px] font-bold tracking-[0.1em] whitespace-nowrap uppercase",
        TONE[toneFor(row)],
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {statusLabel(row)}
    </span>
  );
}

function HistorySkeleton({ rows }: { rows: number }) {
  return (
    <Panel>
      <div className={`flex flex-col gap-3 ${PANEL_BODY}`}>
        {Array.from({ length: rows }, (_, i) => (
          <SkLine key={i} className="h-12 w-full" />
        ))}
      </div>
    </Panel>
  );
}

export function MoneyOutHistory({ limit }: { limit?: number }) {
  const { t } = useLang();
  const { data: res, isLoading } = useMoneyOutInfo();
  const [open, setOpen] = useState<MoneyOutTransaction | null>(null);

  const all = res?.data?.transactions ?? [];
  const rows = limit ? all.slice(0, limit) : all;

  if (isLoading && !res) return <HistorySkeleton rows={limit ?? 6} />;

  return (
    <>
      <Panel>
        <PanelHeader title={t("dashboard.vendor.logs.title")}>
          <span className="flex-none text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {all.length} {t("dashboard.vendor.logs.payouts")}
          </span>
        </PanelHeader>

        {rows.length === 0 ? (
          <p className={`text-[13.5px] text-muted ${PANEL_BODY}`}>
            {t("dashboard.vendor.logs.empty")}
          </p>
        ) : (
          <div className="scroll-x">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("dashboard.vendor.logs.colRef")}</th>
                  <th>{t("dashboard.vendor.logs.colMethod")}</th>
                  <th>{t("dashboard.vendor.logs.colRequested")}</th>
                  <th>{t("dashboard.delivery.colStatus")}</th>
                  <th className="text-end">{t("dashboard.vendor.moneyOut.totalCharge")}</th>
                  <th className="text-end">{t("dashboard.vendor.logs.colReceived")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id ?? row.trx}
                    onClick={() => setOpen(row)}
                    className="cursor-pointer transition-colors hover:bg-sunk"
                  >
                    <td>
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                          <Banknote size={16} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">
                            {formatMoneyString(row.request_amount)}
                          </span>
                          <span className="text-[11.5px] font-medium tracking-[0.1em] text-muted uppercase">
                            #{row.trx}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap">{row.gateway_currency_name}</td>
                    <td className="whitespace-nowrap">{formatDate(row.date_time)}</td>
                    <td>
                      <PayoutPill row={row} />
                    </td>
                    <td className="text-end whitespace-nowrap tabular-nums text-body">
                      {formatMoneyString(row.total_charge)}
                    </td>
                    <td className="text-end font-bold whitespace-nowrap tabular-nums text-heading">
                      {formatMoneyString(row.payable)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* `xl`, not `lg`: this record carries ten fields plus a rejection note,
          and at `lg` every value wrapped onto its own line. Two columns at this
          width put the money figures beside their labels again. */}
      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        size="xl"
        labelledBy="payout-title"
        icon={<Wallet size={17} strokeWidth={2.2} aria-hidden />}
        title={open ? `${t("dashboard.vendor.logs.payout")} #${open.trx}` : ""}
        aside={open ? formatDateTime(open.date_time) : undefined}
      >
        {open && (
          <div className={`flex flex-col gap-5 ${PANEL_BODY}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-sunk px-3.5 py-2.5">
              <PayoutPill row={open} />
              <span className="text-[12.5px] text-muted">{open.gateway_name}</span>
            </div>

            {/* The admin's note, when they turned it down. Given its own block
                rather than a `Field` row: it is prose, not a figure, and it is
                the one thing the vendor actually came here to read. */}
            {open.rejection_reason ? (
              <div className="flex gap-3 border border-danger/40 bg-danger/8 px-3.5 py-3">
                <TriangleAlert
                  size={16}
                  strokeWidth={2.2}
                  aria-hidden
                  className="mt-0.5 flex-none text-danger"
                />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold tracking-[0.1em] text-danger uppercase">
                    {t("dashboard.vendor.logs.rejectionReason")}
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[1.55] break-words text-body">
                    {open.rejection_reason}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <section>
                <Field
                  icon={<Hash size={13} strokeWidth={2} aria-hidden />}
                  label={t("dashboard.vendor.logs.colRef")}
                  value={open.trx}
                />
                <Field
                  icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />}
                  label={t("dashboard.vendor.logs.colRequested")}
                  value={formatDateTime(open.date_time)}
                />
                <Field
                  icon={<Banknote size={13} strokeWidth={2} aria-hidden />}
                  label={t("dashboard.vendor.logs.colMethod")}
                  value={open.gateway_currency_name}
                />
                <Field
                  icon={<ArrowRightLeft size={13} strokeWidth={2} aria-hidden />}
                  label={t("dashboard.vendor.moneyOut.exchangeRate")}
                  value={formatRateString(open.exchange_rate)}
                />
              </section>

              <section>
                <Field
                  icon={<Wallet size={13} strokeWidth={2} aria-hidden />}
                  label={t("dashboard.vendor.moneyOut.enteredAmount")}
                  value={formatMoneyString(open.request_amount)}
                />
                <Field
                  icon={<Receipt size={13} strokeWidth={2} aria-hidden />}
                  label={t("dashboard.vendor.moneyOut.totalCharge")}
                  value={formatMoneyString(open.total_charge)}
                />
                <Field
                  icon={<Wallet size={13} strokeWidth={2} aria-hidden />}
                  label={t("dashboard.vendor.logs.balanceAfter")}
                  value={formatMoneyString(open.current_balance)}
                />
              </section>
            </div>

            <div className="flex items-center justify-between gap-4 border-t-2 border-border pt-3.5">
              <span className="text-[13px] font-bold tracking-[0.1em] text-heading uppercase">
                {t("dashboard.vendor.logs.colReceived")}
              </span>
              <span className="text-[20px] font-bold tracking-[-0.03em] tabular-nums text-heading">
                {formatMoneyString(open.payable)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
