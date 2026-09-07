"use client";

import { Wallet, FileCheck, Ticket, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { FilledCard, StatCard, STAT_ROW } from "@/components/dashboard/StatCards";
import {
  BALANCE, serviceSeriesFor, ticketsFor, type OverviewRange,
} from "@/components/dashboard/dashboardData";

/**
 * The customer overview's headline row: balance, then what the period did.
 * The cards themselves are `StatCards` — this file is only which four
 * figures the customer sees and where they come from.
 */
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function OverviewStats({ range }: { range: OverviewRange }) {
  const { t } = useLang();

  const { totals, completed } = serviceSeriesFor(range);
  const requests = sum(totals);
  const done = sum(completed);
  const tickets = ticketsFor(range);
  const share = (value: number, of: number) => `${value} ${t("dashboard.common.of")} ${of}`;

  return (
    <div className={`${STAT_ROW} min-[1060px]:grid-cols-4`}>
      <FilledCard
        icon={Wallet}
        label={t("dashboard.kpi.balance.label")}
        value={BALANCE.value}
        unit={BALANCE.unit}
        caption={t("dashboard.kpi.balance.available")}
      />
      <StatCard
        icon={FileCheck}
        label={t("dashboard.kpi.completedServices.label")}
        value={String(done)}
        note={t(`dashboard.charts.span.${range}`)}
        pct={requests === 0 ? 0 : Math.round((done / requests) * 100)}
        share={share(done, requests)}
      />
      <StatCard
        icon={Ticket}
        label={t("dashboard.kpi.activeTickets.label")}
        value={String(tickets.active)}
        note={t("dashboard.overview.activeNote")}
        pct={Math.round((tickets.active / tickets.all) * 100)}
        share={share(tickets.active, tickets.all)}
      />
      <StatCard
        icon={Clock}
        label={t("dashboard.kpi.pendingTickets.label")}
        value={String(tickets.waiting)}
        note={t("dashboard.overview.pendingNote")}
        pct={Math.round((tickets.waiting / tickets.all) * 100)}
        share={share(tickets.waiting, tickets.all)}
      />
    </div>
  );
}
