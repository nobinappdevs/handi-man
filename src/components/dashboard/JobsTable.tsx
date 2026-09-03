"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import {
  rowsFor,
  filterRows,
  TAB_KEYS,
  type TabKey,
  type RowKind,
  type PageKey,
} from "@/components/dashboard/dashboardData";

/**
 * Not a `<table>`. Every row is a link to the job, and an `<a>` cannot wrap
 * `<tr>` — so the design's row is a grid and this is a list of them. The
 * column template lives in one constant because the header strip and every
 * row have to agree on it exactly.
 *
 * Below 760px the vendor and schedule cells are dropped rather than squeezed,
 * and the template collapses from five columns to three (job, status, amount).
 * The header strip goes with them: three of its five labels would be lying.
 */
const ROW_COLS =
  "grid-cols-[minmax(0,1fr)_auto_auto] min-[760px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_152px_92px]";

/** Only `--accent-soft` needs comment: `bg-brand/14` rather than a fixed plum
 *  at 14%, so the pill is still visible on the near-black dark page. */
const STATUS_TONE: Record<RowKind, string> = {
  active: "bg-brand/14 text-brand",
  ok: "bg-ok/14 text-ok",
  wait: "bg-warn/14 text-warn",
  done: "bg-muted/16 text-muted",
};

const CELL = "min-w-0 hidden min-[760px]:flex flex-col gap-[3px]";

export function JobsTable({ page }: { page: PageKey }) {
  const { t } = useLang();
  const [tab, setTab] = useState<TabKey>("all");

  const pool = rowsFor(page);
  const rows = filterRows(pool, tab);

  return (
    <section className="min-w-0 border border-border bg-card">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border p-[clamp(16px,1.6vw,22px)_clamp(16px,1.8vw,24px)]">
        <h2 className="min-w-0 flex-auto text-[clamp(18px,1.9vw,23px)] font-semibold tracking-[-0.03em]">
          {t(`dashboard.pages.${page}.table`)}
        </h2>

        <div className="flex flex-none">
          {TAB_KEYS.map((key) => {
            const on = key === tab;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={on}
                className={cn(
                  "cursor-pointer border border-s-0 px-[15px] py-[9px] text-[12.5px] font-medium tracking-[0.12em] uppercase transition-colors",
                  on ? "border-primary bg-primary text-white" : "border-border bg-transparent text-muted",
                )}
              >
                {t(`dashboard.tabs.${key}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "hidden gap-3.5 bg-sunk px-[clamp(16px,1.8vw,24px)] py-3 text-[11.5px] font-medium tracking-[0.12em] text-muted uppercase min-[760px]:grid",
          ROW_COLS,
        )}
      >
        <span>{t("dashboard.table.job")}</span>
        <span>{t("dashboard.table.vendor")}</span>
        <span>{t("dashboard.table.schedule")}</span>
        <span>{t("dashboard.table.status")}</span>
        <span className="text-end">{t("dashboard.table.amount")}</span>
      </div>

      <div className="flex flex-col">
        {rows.map(({ title, ref, vendor, meta, day, time, status, kind, amount, icon: Icon }) => (
          <Link
            key={ref}
            href={`/dashboard/bookings?ref=${ref}`}
            className={cn(
              "grid items-center gap-3.5 border-b border-border px-[clamp(16px,1.8vw,24px)] py-[clamp(14px,1.5vw,18px)] transition-colors hover:bg-sunk",
              ROW_COLS,
            )}
          >
            <span className="flex min-w-0 items-center gap-[13px]">
              <span className="flex h-10 w-10 flex-none items-center justify-center bg-brand/14 text-brand">
                <Icon size={19} strokeWidth={2} aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col gap-[3px]">
                <span className="truncate text-[15.5px] font-semibold tracking-[-0.015em] text-heading">
                  {title}
                </span>
                <span className="text-[11.5px] font-medium tracking-[0.14em] text-muted uppercase">
                  {ref}
                </span>
              </span>
            </span>

            <span className={CELL}>
              <span className="truncate text-[14.5px] font-bold text-heading">{vendor}</span>
              <span className="text-[12.5px] font-normal text-muted">{meta}</span>
            </span>

            <span className={CELL}>
              <span className="text-[14.5px] font-bold text-heading">{day}</span>
              <span className="text-[12.5px] font-normal text-muted">{time}</span>
            </span>

            <span className="min-w-0">
              <span
                className={cn(
                  "inline-flex items-center gap-[7px] px-[11px] py-1.5 text-[11.5px] font-medium tracking-[0.14em] whitespace-nowrap uppercase",
                  STATUS_TONE[kind],
                )}
              >
                <span aria-hidden className="h-1.5 w-1.5 bg-current" />
                {t(`dashboard.status.${status}`)}
              </span>
            </span>

            <span className="text-end text-[16px] font-semibold tracking-[-0.03em] whitespace-nowrap text-heading">
              {amount}
            </span>
          </Link>
        ))}

        {/* The design has no empty state, and the Completed tab reaches one on
            every page whose pool has no finished row — Overview, for instance. */}
        {rows.length === 0 && (
          <span className="border-b border-border px-[clamp(16px,1.8vw,24px)] py-10 text-center text-[14px] font-normal text-muted">
            {t("dashboard.common.empty")}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3.5 px-[clamp(16px,1.8vw,24px)] py-3.5">
        <span className="text-[12.5px] font-medium tracking-[0.14em] text-muted uppercase">
          {rows.length} {t("dashboard.common.of")} {pool.length} {t("dashboard.common.shown")}
        </span>
        <Link
          href="/dashboard/bookings"
          className="flex items-center gap-2 text-[13px] font-medium tracking-[0.14em] text-brand uppercase"
        >
          {t("common.viewAll")}
          <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
