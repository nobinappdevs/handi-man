"use client";

import { useState } from "react";
import { ChevronRight, Info, Printer, type LucideIcon } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { Panel, PanelTitle } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { ORDER_FILTERS, type OrderFilter, type StatusKey } from "@/components/dashboard/dashboardData";

/**
 * The design's recent-orders table and the record behind a row, shared by
 * both overviews.
 *
 * It is presentational on purpose: a customer's order and a vendor's job are
 * different records with different fields, but they are ONE table and ONE
 * modal in the design. So each side maps its own records into `PanelOrder`
 * and the layout, filters, hover, status vocabulary and print button are
 * decided once here.
 *
 * The row is a `<button>`, not a `<tr>`, because the whole row opens the
 * modal — the same reason the design builds it out of a grid. Two of the six
 * columns and the chevron drop below 760px, leaving reference, status and
 * amount: the three a phone can still read at a glance.
 */
const COLS =
  "grid-cols-[minmax(0,1fr)_auto_auto] min-[760px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_132px_96px_26px]";
/** The cells that only exist on the wide layout. */
const WIDE_ONLY = "hidden min-[760px]:flex";
const GUTTER = "px-[clamp(16px,1.8vw,24px)]";

/* The chip is an outline, not a fill — the design marks state with a border
   and matching ink so a table full of them does not read as coloured blocks.
   Two maps rather than one joined string: Tailwind reads these literally, and
   the record needs the ink half on its own. */
const STATUS_LINE: Record<StatusKey, string> = {
  pending: "border-warn",
  processing: "border-primary",
  completed: "border-ok",
  canceled: "border-danger",
};
export const STATUS_INK: Record<StatusKey, string> = {
  pending: "text-warn",
  processing: "text-brand",
  completed: "text-ok",
  canceled: "text-danger",
};

/** One label/value line in a record column. `ink` is a Tailwind text class. */
export type RecordField = { label: string; value: string; ink?: string };

export type PanelOrder = {
  /** Reference shown in the first column, and the row's key. */
  ref: string;
  /** Second line under the reference — what the order is for. */
  subject: string;
  icon: LucideIcon;
  /** Who it is with, and how to reach them. */
  who: string;
  whoSub: string;
  /** When it happens. */
  when: string;
  whenSub: string;
  status: StatusKey;
  /** The money in the last column — a total, or a vendor's payout. */
  amount: string;
  /** The record's two columns, left then right. */
  columns: { title: string; fields: RecordField[] }[];
  /** The money block under the right column; the last row is emphasised. */
  totals: { label: string; value: string }[];
};

function StatusChip({ status, label }: { status: StatusKey; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.75 border py-1.25 pe-2.5 ps-2 text-[12px] font-medium tracking-[0.04em] whitespace-nowrap uppercase",
        STATUS_LINE[status],
        STATUS_INK[status],
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {label}
    </span>
  );
}

function Line({ label, value, ink = "text-muted" }: RecordField) {
  return (
    <span className="flex items-baseline justify-between gap-4 border-b border-border py-2.25">
      <span className="flex-none text-[13.5px] font-medium text-body">{label}</span>
      <span className={`min-w-0 text-end text-[13.5px] [overflow-wrap:anywhere] ${ink}`}>{value}</span>
    </span>
  );
}

export function OrdersPanel({
  title,
  headers,
  orders,
  noun,
}: {
  title: string;
  /** Reference, who, when, status, amount — in that order. */
  headers: [string, string, string, string, string];
  orders: PanelOrder[];
  /** Plural word for the footer count: "orders" / "jobs". */
  noun: string;
}) {
  const { t } = useLang();
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [open, setOpen] = useState<PanelOrder | null>(null);

  const rows = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const statusLabel = (status: StatusKey) => t(`dashboard.charts.status.${status}`);

  return (
    <>
      <Panel>
        <div className={`flex flex-wrap items-center gap-x-4.5 gap-y-3 py-[clamp(16px,1.8vw,22px)] ${GUTTER}`}>
          <PanelTitle>{title}</PanelTitle>
          <span className="flex-none bg-brand/10 px-2.25 py-0.75 text-[12px] font-medium text-brand tabular-nums">
            {rows.length} / {orders.length}
          </span>

          <div className="ms-auto flex flex-none border border-border">
            {ORDER_FILTERS.map((key, i) => {
              const on = key === filter;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={on}
                  className={cn(
                    "cursor-pointer px-3.5 py-2.25 text-[13px] font-medium whitespace-nowrap transition-colors",
                    i > 0 && "border-s border-border",
                    on ? "bg-primary text-white" : "bg-transparent text-body hover:text-heading",
                  )}
                >
                  {key === "all" ? t("dashboard.tabs.all") : statusLabel(key)}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "hidden gap-4 pb-2.5 text-[11.5px] font-medium tracking-widest text-muted uppercase min-[760px]:grid",
            COLS,
            GUTTER,
          )}
        >
          <span>{headers[0]}</span>
          <span>{headers[1]}</span>
          <span>{headers[2]}</span>
          <span>{headers[3]}</span>
          <span className="text-end">{headers[4]}</span>
          <span />
        </div>

        {rows.map((order) => {
          const Icon = order.icon;
          return (
            <button
              key={order.ref}
              type="button"
              onClick={() => setOpen(order)}
              className={cn(
                "group relative grid w-full cursor-pointer items-center gap-4 border-t border-border bg-transparent py-4 text-left transition-colors hover:bg-sunk",
                COLS,
                GUTTER,
              )}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 start-0 w-0.5 bg-transparent transition-colors group-hover:bg-primary"
              />

              <span className="flex min-w-0 items-center gap-3.25">
                <span className="flex h-9.5 w-9.5 flex-none items-center justify-center bg-sunk text-brand transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon size={18} strokeWidth={1.5} aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col gap-0.75">
                  <span className="text-[14.5px] font-medium text-heading tabular-nums">{order.ref}</span>
                  <span className="truncate text-[12.5px] text-muted">{order.subject}</span>
                </span>
              </span>

              <span className={`min-w-0 flex-col gap-0.75 ${WIDE_ONLY}`}>
                <span className="truncate text-[14px] text-body">{order.who}</span>
                <span className="truncate text-[12.5px] text-muted tabular-nums">{order.whoSub}</span>
              </span>

              <span className={`min-w-0 flex-col gap-0.75 ${WIDE_ONLY}`}>
                <span className="truncate text-[14px] text-body">{order.when}</span>
                <span className="truncate text-[12.5px] text-muted">{order.whenSub}</span>
              </span>

              <span className="min-w-0">
                <StatusChip status={order.status} label={statusLabel(order.status)} />
              </span>

              <span className="text-end text-[15px] font-semibold tracking-[-0.02em] whitespace-nowrap text-heading tabular-nums">
                {order.amount}
              </span>

              <span
                className={`items-center justify-end text-muted transition-[color,transform] group-hover:translate-x-[3px] group-hover:text-brand rtl:group-hover:-translate-x-[3px] ${WIDE_ONLY}`}
              >
                <ChevronRight size={16} strokeWidth={1.7} aria-hidden className="rtl:rotate-180" />
              </span>
            </button>
          );
        })}

        {rows.length === 0 && (
          <span className={`block border-t border-border py-12 text-center text-[14px] text-muted ${GUTTER}`}>
            {t("dashboard.common.empty")}
          </span>
        )}

        <div
          className={`flex flex-wrap items-center justify-between gap-2.5 border-t border-border py-3.5 ${GUTTER}`}
        >
          <span className="text-[12.5px] text-muted">
            {t("dashboard.common.showing")} {rows.length} {t("dashboard.common.of")} {orders.length} {noun}
          </span>
          <span className="flex items-center gap-1.75 text-[12.5px] text-muted">
            <ChevronRight size={14} strokeWidth={1.6} aria-hidden className="rtl:rotate-180" />
            {t("dashboard.overview.clickRow")}
          </span>
        </div>
      </Panel>

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        size="xl"
        tone="accent"
        labelledBy="panel-order-title"
        icon={<Info size={16} strokeWidth={1.6} aria-hidden />}
        title={t("dashboard.overview.orderDetails")}
        aside={open?.ref}
      >
        {open && (
          <>
            <div className="grid grid-cols-1 gap-[clamp(14px,1.6vw,20px)] p-[clamp(16px,1.9vw,24px)] min-[760px]:grid-cols-2">
              {open.columns.map((column, ci) => (
                <div
                  key={column.title}
                  className="flex min-w-0 flex-col gap-3.5 border border-border p-[clamp(16px,1.7vw,22px)]"
                >
                  <h4 className="text-[15.5px] font-semibold tracking-[-0.015em] text-heading">
                    {column.title}
                  </h4>
                  <div className="flex flex-col">
                    {column.fields.map((field) => (
                      <Line key={field.label} {...field} />
                    ))}
                  </div>

                  {/* The money sits under the right-hand column, as in the design. */}
                  {ci === open.columns.length - 1 && (
                    <div className="mt-1 flex flex-col">
                      {open.totals.map((total, ti) => {
                        const last = ti === open.totals.length - 1;
                        return (
                          <span
                            key={total.label}
                            className="flex items-baseline justify-between gap-4 border-t border-border py-2.5"
                          >
                            <span className="flex-none text-[13.5px] font-medium text-body">
                              {total.label}
                            </span>
                            <span
                              className={cn(
                                "flex-none font-semibold tabular-nums",
                                last ? "text-[17px] text-brand" : "text-[14.5px] text-heading",
                              )}
                            >
                              {total.value}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2.5 px-[clamp(16px,1.9vw,24px)] pb-[clamp(16px,1.9vw,24px)]">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="cursor-pointer border border-border px-5 py-2.75 text-[14px] font-medium text-heading transition-colors hover:border-primary hover:text-brand"
              >
                {t("common.close")}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex cursor-pointer items-center gap-2.25 bg-primary px-5 py-2.75 text-[14px] font-medium text-white transition-colors hover:bg-primary-dark"
              >
                <Printer size={15} strokeWidth={1.6} aria-hidden />
                {t("common.print")}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
