"use client";

import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { Panel, PanelHeader, PANEL_BODY } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/page/vendor/VendorOrders";
import { DASH_ROUTES } from "@/components/dashboard/dashboardData";
import {
  VENDOR_KPIS, VENDOR_BALANCE, VENDOR_ORDERS, VENDOR_SCHEDULE,
} from "@/components/dashboard/page/vendor/vendorData";

export function VendorOverview() {
  const { t } = useLang();
  const upcoming = VENDOR_SCHEDULE.flatMap((d) => d.slots).slice(0, 3);

  return (
    <>
      <KpiGrid items={VENDOR_KPIS} ns="dashboard.vendor.kpi" />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[clamp(16px,1.8vw,24px)] min-[1180px]:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        {/* ── the job queue ── */}
        <Panel>
          <PanelHeader title={t("dashboard.vendor.overview.recentJobs")}>
            <Link
              href={DASH_ROUTES.vendorOrders}
              className="flex flex-none items-center gap-2 text-[12.5px] font-bold tracking-[0.12em] text-brand uppercase"
            >
              {t("common.viewAll")}
              <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
            </Link>
          </PanelHeader>

          <div className="scroll-x">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("dashboard.vendor.orders.colJob")}</th>
                  <th>{t("dashboard.vendor.orders.colCustomer")}</th>
                  <th>{t("dashboard.delivery.colStatus")}</th>
                  <th className="text-end">{t("dashboard.vendor.orders.colPayout")}</th>
                </tr>
              </thead>
              <tbody>
                {VENDOR_ORDERS.map((order) => {
                  const Icon = order.icon;
                  return (
                    <tr key={order.no}>
                      <td>
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                            <Icon size={16} strokeWidth={2} aria-hidden />
                          </span>
                          <span className="flex flex-col gap-0.5">
                            <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">
                              {t(`${order.copyNs ?? "servicesPage.items"}.${order.serviceKey}.title`)}
                            </span>
                            <span className="text-[11.5px] font-medium tracking-[0.1em] text-muted uppercase">
                              #{order.no}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap">{order.customer}</td>
                      <td><StatusPill status={order.status} /></td>
                      <td className="text-end font-bold whitespace-nowrap text-heading">
                        {order.totals.payout}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="flex min-w-0 flex-col gap-[clamp(16px,1.8vw,24px)]">
          {/* ── balance ── the one dark panel, same as the customer's tracker. */}
          <section className="relative overflow-hidden bg-rail p-[clamp(18px,1.9vw,24px)]">
            <div aria-hidden className="absolute inset-y-0 -right-10 w-30 skew-x-[-13deg] bg-primary opacity-85" />
            <div className="relative flex flex-col gap-4">
              <span className="text-[12px] font-bold tracking-[0.13em] text-primary-on-dark uppercase">
                {t("dashboard.vendor.overview.available")}
              </span>
              <span className="text-[clamp(26px,2.6vw,34px)] leading-none font-bold tracking-[-0.03em] text-white">
                {VENDOR_BALANCE.available}
              </span>
              <span className="flex flex-col gap-1.5 border-t border-white/15 pt-3.5">
                <span className="flex items-center justify-between gap-3 text-[13px] text-white/65">
                  {t("dashboard.vendor.overview.pending")}
                  <span className="font-bold text-white">{VENDOR_BALANCE.pending}</span>
                </span>
                <span className="flex items-center justify-between gap-3 text-[13px] text-white/65">
                  {t("dashboard.vendor.overview.lifetime")}
                  <span className="font-bold text-white">{VENDOR_BALANCE.lifetime}</span>
                </span>
              </span>
              <Link
                href={DASH_ROUTES.moneyOut}
                className="flex h-11 items-center justify-center gap-2.5 bg-white text-[13.5px] font-bold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-primary-on-dark"
              >
                <Wallet size={15} strokeWidth={2.4} aria-hidden />
                {t("dashboard.vendor.overview.withdraw")}
              </Link>
            </div>
          </section>

          {/* ── next up ── */}
          <Panel>
            <PanelHeader title={t("dashboard.vendor.overview.nextUp")} />
            {upcoming.length === 0 ? (
              <p className={`text-center text-[13.5px] text-muted ${PANEL_BODY}`}>
                {t("dashboard.vendor.schedule.emptyDay")}
              </p>
            ) : (
              upcoming.map((slot) => (
                <div
                  key={slot.orderNo}
                  className="flex items-center gap-3 border-t border-border px-[clamp(16px,1.8vw,22px)] py-3.5 first:border-t-0"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                    <slot.icon size={16} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-auto flex-col gap-0.5">
                    <span className="truncate text-[14px] font-bold text-heading">
                      {t(`${slot.copyNs ?? "servicesPage.items"}.${slot.serviceKey}.title`)}
                    </span>
                    <span className="text-[12px] text-muted">{slot.time}</span>
                  </span>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
