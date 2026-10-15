"use client";

import { useState } from "react";
import { CalendarCheck, CheckCircle2, Ticket, Wallet } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { PageShell } from "@/components/dashboard/PageShell";
import { OverviewHead } from "@/components/dashboard/Overview";
import { FilledCard, StatCard, STAT_ROW } from "@/components/dashboard/StatCards";
import { ActivityChart } from "@/components/dashboard/charts/ActivityChart";
import { VendorRecentJobs } from "@/components/dashboard/page/vendor/VendorRecentJobs";
import { type OverviewRange } from "@/components/dashboard/dashboardData";
import { useVendorDashboard } from "@/hooks/useDashboard";
import { segmentSeries, rangeCaption } from "@/lib/dashboardSeries";
import { num } from "@/lib/money";

/**
 * The vendor overview, on the customer overview's design — the same head with
 * its Today / Week / Month switch, the same stat row, the same composed
 * activity chart, the same orders table and record modal, all reading vendor
 * data.
 *
 * The table is the last block: the money panel and the schedule preview that
 * used to sit under it are gone. Both had a whole page of their own on the
 * rail — Money Out and Schedule — and a preview of a page one click away is
 * the kind of thing that ends up being the stale copy.
 *
 * ── The fourth card is tickets, not a rating ──
 * It used to show a star rating from the mock. `/vendors/dashboard` sends no
 * rating and no review count, so the card now shows `active_ticket`, which the
 * payload does carry. A five-star score nobody computes is worse than a
 * smaller true number.
 */
export function VendorOverview() {
  const { t } = useLang();
  const [range, setRange] = useState<OverviewRange>("month");

  const { data: res } = useVendorDashboard();
  const data = res?.data;
  const chart = data?.chart;
  const jobs = segmentSeries(chart, "service", range);

  /* The wallet arrives as a long string - "987.80394322" - so it is parsed
     once here and formatted, rather than printed at whatever precision the
     backend happened to store. */
  const balance = Number(data?.vendor_wallet ?? 0) || 0;
  const currency = data?.currency ?? "";
  const completed = data?.service_order ?? 0;
  const open = data?.pending_order ?? 0;
  const tickets = data?.active_ticket ?? 0;
  const total = completed + open;

  const share = (value: number, of: number) => `${value} ${t("dashboard.common.of")} ${of}`;

  return (
    <PageShell
      page="vendorOverview"
      head={
        <OverviewHead
          title={t("dashboard.pages.vendorOverview.heading")}
          range={range}
          onRange={setRange}
        />
      }
    >
      <div className={`${STAT_ROW} min-[1060px]:grid-cols-4`}>
        {/* The value already carries its currency, so no unit beside it. */}
        <FilledCard
          icon={Wallet}
          label={t("dashboard.vendor.overview.available")}
          value={num(balance)}
          unit={currency}
          caption={t("dashboard.kpi.balance.available")}
        />
        <StatCard
          icon={CalendarCheck}
          label={t("dashboard.vendor.kpi.openJobs.label")}
          value={String(open)}
          note={t("dashboard.vendor.overview.openNote")}
          pct={total === 0 ? 0 : Math.round((open / total) * 100)}
          share={share(open, total)}
        />
        <StatCard
          icon={CheckCircle2}
          label={t("dashboard.vendor.kpi.completed.label")}
          value={String(completed)}
          note={t("dashboard.overview.lifetimeNote")}
          pct={total === 0 ? 0 : Math.round((completed / total) * 100)}
          share={share(completed, total)}
        />
        <StatCard
          icon={Ticket}
          label={t("dashboard.kpi.activeTickets.label")}
          value={String(tickets)}
          note={t("dashboard.overview.activeNote")}
          pct={tickets > 0 ? 100 : 0}
          share={String(tickets)}
        />
      </div>

      <ActivityChart
        range={range}
        series={jobs}
        title={t("dashboard.charts.vendorJobs.title")}
        caption={rangeCaption(chart, range)}
        allLabel={t("dashboard.charts.vendorJobs.legendAll")}
        emptyLabel={t("dashboard.charts.vendorJobs.empty")}
      />

      <VendorRecentJobs />
    </PageShell>
  );
}
