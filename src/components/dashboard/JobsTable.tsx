"use client";

import { useState } from "react";
import Link from "next/link";
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
  "grid-cols-[minmax(0,1fr)_auto_auto] min-[760px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_136px_92px]";

/**
 * Status reads as a coloured dot and a plain word rather than a filled pill.
 * Five saturated chips down a column fought the amounts and the row titles for
 * the eye; a dot carries the same four states at a fraction of the weight, and
 * the colours still mean what they mean everywhere else — plum working, teal
 * settled, amber waiting, grey finished.
 */
const STATUS_DOT: Record<RowKind, string> = {
  active: "bg-brand",
  ok: "bg-ok",
  wait: "bg-warn",
  done: "bg-muted",
};

const CELL = "min-w-0 hidden min-[760px]:flex flex-col gap-0.5";

export function JobsTable({ page }: { page: PageKey }) {
  const { t } = useLang();
  const [tab, setTab] = useState<TabKey>("all");

  const pool = rowsFor(page);
  const rows = filterRows(pool, tab);

  return (
    <section className="min-w-0 border border-border bg-card">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border p-[clamp(16px,1.7vw,22px)_clamp(18px,2vw,26px)]">
        <h2 className="min-w-0 flex-auto text-[clamp(16px,1.7vw,19px)] font-semibold tracking-[-0.02em]">
          {t(`dashboard.pages.${page}.table`)}
        </h2>

        {/* A segmented control, not three outlined buttons: one hairline frame
            around the set and a quiet fill on the one that is on. */}
        <div className="flex flex-none border border-border">
          {TAB_KEYS.map((key) => {
            const on = key === tab;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={on}
                className={cn(
                  "cursor-pointer px-3.5 py-1.5 text-[13px] transition-colors",
                  on
                    ? "bg-sunk font-medium text-heading"
                    : "bg-transparent font-normal text-muted hover:text-heading",
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
          "hidden gap-4 border-b border-border px-[clamp(18px,2vw,26px)] py-2.5 text-[12.5px] font-normal text-muted min-[760px]:grid",
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
        {rows.map(({ title, ref, vendor, meta, day, time, status, kind, amount }) => (
          <Link
            key={ref}
            href={`/dashboard/bookings?ref=${ref}`}
            className={cn(
              "grid items-center gap-4 border-b border-border px-[clamp(18px,2vw,26px)] py-[clamp(13px,1.4vw,17px)] transition-colors hover:bg-sunk",
              ROW_COLS,
            )}
          >
            {/* The filled plum square that used to hold a per-row glyph is
                gone. It repeated the job title in pictogram form five times
                down the column and was the loudest thing in the panel. */}
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[15px] font-medium text-heading">{title}</span>
              <span className="text-[12.5px] font-normal text-muted">{ref}</span>
            </span>

            <span className={CELL}>
              <span className="truncate text-[14px] font-normal text-heading">{vendor}</span>
              <span className="truncate text-[12.5px] font-normal text-muted">{meta}</span>
            </span>

            <span className={CELL}>
              <span className="text-[14px] font-normal text-heading">{day}</span>
              <span className="text-[12.5px] font-normal text-muted">{time}</span>
            </span>

            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden className={cn("h-1.5 w-1.5 flex-none rounded-full", STATUS_DOT[kind])} />
              <span className="truncate text-[13px] font-normal text-body">
                {t(`dashboard.status.${status}`)}
              </span>
            </span>

            <span className="text-end text-[14.5px] font-medium whitespace-nowrap text-heading">
              {amount}
            </span>
          </Link>
        ))}

        {/* The design has no empty state, and the Completed tab reaches one on
            every page whose pool has no finished row — Overview, for instance. */}
        {rows.length === 0 && (
          <span className="border-b border-border px-[clamp(18px,2vw,26px)] py-12 text-center text-[14px] font-normal text-muted">
            {t("dashboard.common.empty")}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3.5 px-[clamp(18px,2vw,26px)] py-3.5">
        <span className="text-[13px] font-normal text-muted">
          {rows.length} {t("dashboard.common.of")} {pool.length} {t("dashboard.common.shown")}
        </span>
        <Link
          href="/dashboard/bookings"
          className="text-[13px] font-medium text-brand transition-colors hover:text-primary-lite"
        >
          {t("common.viewAll")}
        </Link>
      </div>
    </section>
  );
}
