"use client";

import { useLang } from "@/hooks/useLang";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { VendorJobsPanel } from "@/components/dashboard/page/vendor/VendorJobsPanel";

/** How many jobs the overview previews before "View all". */
const RECENT_LIMIT = 5;

/**
 * The overview's recent jobs: the newest few rows of the vendor's order list,
 * with their actions, and a way through to the full list.
 *
 * It reads `/vendors/order/list`, not the dashboard's `order_log`. Those rows
 * carry no service name, charge or payable, so the table showed a dash in
 * three columns; the list has all of it, and the Orders page shares its cache.
 * No status filter here - a preview of five rows does not need one, and the
 * full list has it.
 */
export function VendorRecentJobs() {
  const { t } = useLang();
  const { data, isLoading } = useVendorOrders();

  return (
    <VendorJobsPanel
      title={t("dashboard.vendor.overview.recentJobs")}
      jobs={data?.jobs ?? []}
      currency={data?.currency ?? ""}
      isLoading={isLoading}
      limit={RECENT_LIMIT}
      viewAllHref="/vendors/dashboard/orders"
    />
  );
}
