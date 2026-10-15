"use client";

import { Wrench } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { OrdersPanel, STATUS_INK, type PanelOrder } from "@/components/dashboard/OrdersPanel";
import { useVendorDashboard } from "@/hooks/useDashboard";
import { money, formatDate, formatDateTime } from "@/lib/money";
import type { StatusKey } from "@/components/dashboard/dashboardData";
import type { VendorOrderRow } from "@/services/dashboard.service";

/**
 * The vendor half of the design's recent-orders table, drawn from `order_log`
 * on `GET /vendors/dashboard`.
 *
 * ── The Customer column is not a customer ──
 * The order payload carries `user_id` and nothing else about the person — no
 * name, no phone. The mock this replaced invented both. So that column now
 * shows what the order itself says: the item and quantity. Wrong data under a
 * right-looking heading is the worse failure of the two.
 *
 * When `order_log` is empty the table is empty. It used to show three fictional
 * jobs on an account that had none.
 */

/**
 * The API's status onto the panel's four-word vocabulary.
 *
 * Read from `stringStatus.value` ("Rejected") rather than the numeric `status`,
 * because the numbers are not documented and the string is what the backend
 * itself renders. Anything unrecognised lands on "pending" — the neutral one,
 * and never "completed", which would claim a job was finished.
 */
function statusOf(row: VendorOrderRow): StatusKey {
  const label = String(row.stringStatus?.value ?? row.status ?? "").trim().toLowerCase();
  if (label === "success" || label === "completed" || label === "complete") return "completed";
  if (label === "processing" || label === "progress") return "processing";
  if (label === "rejected" || label === "canceled" || label === "cancelled") return "canceled";
  return "pending";
}

export function VendorRecentJobs() {
  const { t } = useLang();
  const { data: res } = useVendorDashboard();

  const currency = res?.data?.currency ?? "";
  const rows = res?.data?.order_log ?? [];

  const cash = (value: number | undefined) =>
    value === undefined || value === null ? "—" : money(Number(value) || 0, currency);

  const orders: PanelOrder[] = rows.map((row) => {
    const line = row.order_details_info?.[0];
    const service = line?.service_name ?? row.attribute ?? "—";
    const status = statusOf(row);

    return {
      ref: `#${row.trx_id ?? row.id ?? ""}`,
      subject: service,
      icon: Wrench,
      who: line?.item ?? "—",
      whoSub: line?.quantity ? `× ${line.quantity}` : "",
      when: formatDate(row.created_at),
      whenSub: "",
      status,
      amount: cash(row.payable),
      columns: [
        {
          title: t("dashboard.overview.orderInfo"),
          fields: [
            {
              label: t("dashboard.overview.transactionId"),
              value: `#${row.trx_id ?? row.id ?? ""}`,
              ink: "text-heading",
            },
            { label: t("dashboard.history.placedOn"), value: formatDateTime(row.created_at) },
            {
              label: t("dashboard.overview.paymentStatus"),
              value: row.stringStatus?.value ?? t(`dashboard.charts.status.${status}`),
              ink: STATUS_INK[status],
            },
            /* Only when there is one — an empty "Reason" line under every
               completed job reads as a missing value rather than a non-event. */
            ...(row.reject_reason
              ? [{ label: t("dashboard.vendor.logs.rejectionReason"), value: row.reject_reason }]
              : []),
          ],
        },
        {
          title: t("dashboard.vendor.orders.service"),
          fields: [
            { label: t("dashboard.overview.serviceName"), value: service },
            ...(line?.item ? [{ label: t("dashboard.vendor.orders.colJob"), value: line.item }] : []),
            ...(line?.quantity
              ? [{ label: t("dashboard.table.quantity"), value: String(line.quantity) }]
              : []),
          ],
        },
      ],
      totals: [
        { label: t("dashboard.history.subtotal"), value: cash(row.request_amount) },
        { label: t("dashboard.vendor.orders.commission"), value: cash(row.total_charge) },
        { label: t("dashboard.vendor.orders.yourPayout"), value: cash(row.payable) },
      ],
    };
  });

  return (
    <OrdersPanel
      title={t("dashboard.vendor.overview.recentJobs")}
      headers={[
        t("dashboard.vendor.orders.colJob"),
        t("dashboard.vendor.orders.service"),
        t("dashboard.history.placedOn"),
        t("dashboard.table.status"),
        t("dashboard.vendor.orders.colPayout"),
      ]}
      orders={orders}
      noun={t("dashboard.vendor.orders.jobs")}
    />
  );
}
