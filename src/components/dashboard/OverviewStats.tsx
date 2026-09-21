"use client";

import { Wallet, FileCheck, Ticket, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { FilledCard, StatCard, STAT_ROW } from "@/components/dashboard/StatCards";
import { useUserDashboard } from "@/hooks/useDashboard";
import { num } from "@/lib/money";
import type { OverviewRange } from "@/components/dashboard/dashboardData";

/**
 * The customer overview's headline row: balance, then the account's counters.
 *
 * ── These four do NOT follow the range control ──
 * `complete_order`, `active_ticket` and `pending_ticket` arrive as single
 * lifetime totals, not per-period series. The mock they replaced was sliced by
 * range, so switching to "week" used to change them; it no longer does, because
 * the backend has no weekly figure to give and re-deriving one from the chart
 * would be a different number wearing the same label. `range` is still taken so
 * the charts below and this row share one prop, and so a per-period counter can
 * be honoured here the day the API sends one.
 */
export function OverviewStats({ range }: { range: OverviewRange }) {
  const { t } = useLang();
  const { data: res } = useUserDashboard();
  const data = res?.data;

  const balance = data?.user_wallet?.balance ?? 0;
  const completed = data?.complete_order ?? 0;
  const activeTickets = data?.active_ticket ?? 0;
  const pendingTickets = data?.pending_ticket ?? 0;
  const allTickets = activeTickets + pendingTickets;

  /* A share of nothing is not 0% — it is unanswerable, and a bar sitting at
     zero reads as "none of them" rather than "none yet". */
  const pctOf = (value: number, of: number) => (of === 0 ? 0 : Math.round((value / of) * 100));
  const share = (value: number, of: number) => `${value} ${t("dashboard.common.of")} ${of}`;

  return (
    <div className={`${STAT_ROW} min-[1060px]:grid-cols-4`}>
      <FilledCard
        icon={Wallet}
        label={t("dashboard.kpi.balance.label")}
        value={num(balance)}
        unit={t("dashboard.kpi.balance.unit")}
        caption={t("dashboard.kpi.balance.available")}
      />
      <StatCard
        icon={FileCheck}
        label={t("dashboard.kpi.completedServices.label")}
        value={String(completed)}
        note={t("dashboard.overview.lifetimeNote")}
        pct={completed > 0 ? 100 : 0}
        share={String(completed)}
      />
      <StatCard
        icon={Ticket}
        label={t("dashboard.kpi.activeTickets.label")}
        value={String(activeTickets)}
        note={t("dashboard.overview.activeNote")}
        pct={pctOf(activeTickets, allTickets)}
        share={share(activeTickets, allTickets)}
      />
      <StatCard
        icon={Clock}
        label={t("dashboard.kpi.pendingTickets.label")}
        value={String(pendingTickets)}
        note={t("dashboard.overview.pendingNote")}
        pct={pctOf(pendingTickets, allTickets)}
        share={share(pendingTickets, allTickets)}
      />
    </div>
  );
}
