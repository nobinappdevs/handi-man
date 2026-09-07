"use client";

import { useLang } from "@/hooks/useLang";
import { OrdersPanel, STATUS_INK, type PanelOrder } from "@/components/dashboard/OrdersPanel";
import { VENDOR_ORDERS } from "@/components/dashboard/page/vendor/vendorData";

/**
 * The vendor half of the design's recent-orders table: it maps a job onto
 * `PanelOrder` and `OrdersPanel` draws it, exactly as `RecentOrders` does for
 * the customer. The differences are the ones the record actually has — the
 * customer is the other party here, and the money column is the payout after
 * commission rather than what was charged.
 */
export function VendorRecentJobs() {
  const { t } = useLang();

  const title = (order: (typeof VENDOR_ORDERS)[number]) =>
    t(`${order.copyNs ?? "servicesPage.items"}.${order.serviceKey}.title`);

  const orders: PanelOrder[] = VENDOR_ORDERS.map((order) => ({
    ref: `#${order.no}`,
    subject: title(order),
    icon: order.icon,
    who: order.customer,
    whoSub: order.phone,
    when: order.schedule.date,
    whenSub: order.schedule.time,
    status: order.status,
    amount: order.totals.payout,
    columns: [
      {
        title: t("dashboard.overview.orderInfo"),
        fields: [
          { label: t("dashboard.overview.transactionId"), value: `#${order.no}`, ink: "text-heading" },
          { label: t("dashboard.vendor.orders.colCustomer"), value: order.customer },
          { label: t("dashboard.history.phone"), value: order.phone },
          { label: t("dashboard.history.address"), value: order.address },
          { label: t("dashboard.history.scheduleDate"), value: order.schedule.date },
          { label: t("dashboard.history.scheduleTime"), value: order.schedule.time },
          { label: t("dashboard.history.placedOn"), value: order.placedOn },
          {
            label: t("dashboard.overview.paymentMethod"),
            value: t(`dashboard.history.payment.${order.payment}`),
          },
          {
            label: t("dashboard.overview.paymentStatus"),
            value: t(`dashboard.charts.status.${order.status}`),
            ink: STATUS_INK[order.status],
          },
        ],
      },
      {
        title: t("dashboard.vendor.orders.service"),
        fields: [{ label: t("dashboard.overview.serviceName"), value: title(order) }],
      },
    ],
    totals: [
      { label: t("dashboard.history.subtotal"), value: order.totals.subtotal },
      { label: t("dashboard.vendor.orders.commission"), value: order.totals.charge },
      { label: t("dashboard.vendor.orders.yourPayout"), value: order.totals.payout },
    ],
  }));

  return (
    <OrdersPanel
      title={t("dashboard.vendor.overview.recentJobs")}
      headers={[
        t("dashboard.vendor.orders.colJob"),
        t("dashboard.vendor.orders.colCustomer"),
        t("dashboard.vendor.orders.colSchedule"),
        t("dashboard.table.status"),
        t("dashboard.vendor.orders.colPayout"),
      ]}
      orders={orders}
      noun={t("dashboard.vendor.orders.jobs")}
    />
  );
}
