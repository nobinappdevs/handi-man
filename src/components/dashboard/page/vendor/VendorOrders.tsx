"use client";

import type { ReactNode } from "react";
import { useLang } from "@/hooks/useLang";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { VendorJobsPanel } from "@/components/dashboard/page/vendor/VendorJobsPanel";
import { cn } from "@/components/ui/cn";

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
 * Every service order the vendor has (`GET /vendors/order/list`), with the
 * status filter and each row's actions. The overview's recent jobs are the
 * first five rows of this same table.
 */
export function VendorOrders() {
  const { t } = useLang();
  const { data, isLoading } = useVendorOrders();

  return (
    <VendorJobsPanel
      title={t("dashboard.vendor.orders.title")}
      jobs={data?.jobs ?? []}
      currency={data?.currency ?? ""}
      isLoading={isLoading}
      filterable
    />
  );
}
