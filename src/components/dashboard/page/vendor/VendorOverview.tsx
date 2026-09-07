"use client";

import { useState } from "react";
import { CalendarCheck, CheckCircle2, Star, Wallet } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { PageShell } from "@/components/dashboard/PageShell";
import { OverviewHead } from "@/components/dashboard/Overview";
import { FilledCard, StatCard, STAT_ROW } from "@/components/dashboard/StatCards";
import { ActivityChart } from "@/components/dashboard/charts/ActivityChart";
import { VendorRecentJobs } from "@/components/dashboard/page/vendor/VendorRecentJobs";
import { RANGE_SPANS, type OverviewRange } from "@/components/dashboard/dashboardData";
import {
  VENDOR_BALANCE, VENDOR_RATING, vendorJobsFor,
} from "@/components/dashboard/page/vendor/vendorData";

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

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
 */
export function VendorOverview() {
  const { t } = useLang();
  const [range, setRange] = useState<OverviewRange>("month");

  const jobs = vendorJobsFor(range);
  const total = sum(jobs.totals);
  const done = sum(jobs.completed);
  const open = sum(jobs.pending);
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
          value={VENDOR_BALANCE.available}
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
          value={String(done)}
          note={t(`dashboard.charts.span.${range}`)}
          pct={total === 0 ? 0 : Math.round((done / total) * 100)}
          share={share(done, total)}
        />
        <StatCard
          icon={Star}
          label={t("dashboard.vendor.kpi.rating.label")}
          value={VENDOR_RATING.score}
          note={`${VENDOR_RATING.reviews} ${t("dashboard.vendor.kpi.rating.delta")}`}
          pct={Math.round((Number(VENDOR_RATING.score) / VENDOR_RATING.of) * 100)}
          share={`${VENDOR_RATING.score} ${t("dashboard.common.of")} ${VENDOR_RATING.of}`}
        />
      </div>

      <ActivityChart
        range={range}
        series={jobs}
        title={t("dashboard.charts.vendorJobs.title")}
        caption={RANGE_SPANS[range]}
        allLabel={t("dashboard.charts.vendorJobs.legendAll")}
        emptyLabel={t("dashboard.charts.vendorJobs.empty")}
      />

      <VendorRecentJobs />
    </PageShell>
  );
}
