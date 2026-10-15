"use client";

import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { PageShell } from "@/components/dashboard/PageShell";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { ActivityChart } from "@/components/dashboard/charts/ActivityChart";
import { PickupChart } from "@/components/dashboard/charts/PickupChart";
import { DeliveryChart } from "@/components/dashboard/charts/DeliveryChart";
import {
  OVERVIEW_PERIOD, OVERVIEW_RANGES, type OverviewRange,
} from "@/components/dashboard/dashboardData";
import { useUserDashboard } from "@/hooks/useDashboard";
import { segmentSeries, rangeCaption } from "@/lib/dashboardSeries";

/**
 * The dashboard's home screen, built off `home/Handiman Overview.dc.html`:
 * stats, the service chart, then pickup and delivery split below.
 *
 * The range is the ONE piece of state here, and ONE request feeds everything:
 * `/user/dashboard/cart_count` returns the wallet, the counters and a month of
 * daily buckets, and each panel is a window over that. So no panel keeps its
 * own idea of the period, and changing range costs nothing — it re-slices data
 * already in hand rather than refetching.
 *
 * The design's recent-orders table is not on this screen: the two History pages
 * are where an order list belongs, and it survives here as the vendor's job
 * queue (`VendorRecentJobs`).
 */
export function Overview() {
  const { t } = useLang();
  const [range, setRange] = useState<OverviewRange>("month");

  const { data: res } = useUserDashboard();
  const chart = res?.data?.chart;
  const caption = rangeCaption(chart, range);

  return (
    <PageShell page="overview" head={<OverviewHead range={range} onRange={setRange} />}>
      <OverviewStats range={range} />
      <ActivityChart
        range={range}
        series={segmentSeries(chart, "service", range)}
        title={t("dashboard.charts.service.title")}
        caption={caption}
        allLabel={t("dashboard.charts.service.legendAll")}
        emptyLabel={t("dashboard.charts.service.empty")}
      />
      <div className="grid grid-cols-1 gap-[clamp(18px,2vw,28px)] wide:grid-cols-2">
        <PickupChart range={range} series={segmentSeries(chart, "pickup", range)} />
        <DeliveryChart range={range} series={segmentSeries(chart, "delivery", range)} />
      </div>
    </PageShell>
  );
}

/**
 * The design's page head — month caption, page name, range switcher. Shared
 * by both overviews, which is why it lives here rather than inline: the
 * vendor screen heads itself the same way with its own title.
 */
export function OverviewHead({
  title,
  range,
  onRange,
}: {
  /** Defaults to the customer overview's own heading. */
  title?: string;
  range: OverviewRange;
  onRange: (range: OverviewRange) => void;
}) {
  const { t } = useLang();

  return (
    <>
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[13px] font-medium tracking-widest text-muted uppercase">
          {OVERVIEW_PERIOD}
        </span>
        <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.05] font-semibold tracking-[-0.03em]">
          {title ?? t("dashboard.pages.overview.heading")}
        </h1>
      </div>

      <div className="flex flex-none items-center gap-2 border border-border bg-card p-1">
        {OVERVIEW_RANGES.map((key) => {
          const on = key === range;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onRange(key)}
              aria-pressed={on}
              className={cn(
                "cursor-pointer px-4 py-2.25 text-[14px] font-medium whitespace-nowrap transition-colors",
                on ? "bg-primary text-white" : "bg-transparent text-body hover:text-heading",
              )}
            >
              {t(`dashboard.ranges.${key}`)}
            </button>
          );
        })}
      </div>
    </>
  );
}
