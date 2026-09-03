"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { PageShell } from "@/components/dashboard/PageShell";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { KPIS, type PageKey } from "@/components/dashboard/dashboardData";
import { JobsTable } from "@/components/dashboard/JobsTable";
import { ParcelTracker } from "@/components/dashboard/ParcelTracker";
import { SpendPanel } from "@/components/dashboard/SpendPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";

/**
 * Every dashboard route renders THIS — the design draws one screen and swaps
 * four strings and the table's row pool per route, so a second layout would be
 * a second thing to keep in sync for no gain. A page.tsx passes its key and
 * nothing else.
 */
export function DashboardView({ page }: { page: PageKey }) {
  const { t } = useLang();

  return (
    <PageShell
      page={page}
      actions={
        <div className="flex flex-none flex-wrap gap-2.5">
          <Link
            href="/services"
            className="flex h-12 flex-none items-center gap-[9px] bg-primary px-6 text-[14.5px] font-medium tracking-[0.13em] whitespace-nowrap text-white uppercase transition-colors hover:bg-primary-dark"
          >
            {t("dashboard.cta.book")}
            <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
          </Link>
          <Link
            href="/delivery"
            className="flex h-12 flex-none items-center gap-[9px] border border-border px-[22px] text-[14.5px] font-medium tracking-[0.13em] whitespace-nowrap text-heading uppercase transition-colors hover:border-primary hover:text-brand"
          >
            {t("dashboard.cta.parcel")}
          </Link>
        </div>
      }
    >
      <KpiGrid items={KPIS} ns="dashboard.kpi" />

      {/* ── Table + side column ── single column until 1180px. */}
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[clamp(16px,1.8vw,24px)] min-[1180px]:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <JobsTable page={page} />

        <div className="flex min-w-0 flex-col gap-[clamp(16px,1.8vw,24px)]">
          <ParcelTracker />
          <SpendPanel />
          <QuickActions />
        </div>
      </div>
    </PageShell>
  );
}
