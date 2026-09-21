"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { cn } from "@/components/ui/cn";
import { STATUS_TONE, type OrderStatus } from "@/components/dashboard/page/history/historyData";

/**
 * The parcel log — the screen BOTH `DeliveryLog` and `PickupLog` are.
 *
 * A parcel record has twenty-odd fields and most are blank, so the old screen
 * stacked every one of them into a card per parcel and you scrolled a screen
 * and a half to see two of them. The five columns here are the ones you scan a
 * log for; everything else opens in a modal.
 *
 * Pickup and Delivery are the same table over a different pool — the same
 * relationship `historyData` already notes for the three History entries — so
 * they share this component rather than being two copies that drift. What
 * genuinely differs is threaded through props: the icon, the i18n namespace,
 * the one route column (a parcel is collected FROM somewhere or delivered TO
 * somewhere), and the modal's own sections.
 *
 * Not a `<div>` grid, unlike the jobs table: nothing here is a link, so a real
 * `<table>` gets the row/column semantics for free — and `.scroll-x` +
 * `.dash-table` in globals.css exist exactly for this, keeping every column and
 * scrolling sideways on a phone rather than hiding data.
 *
 * The row is clickable for convenience, but the accessible control is the real
 * `<button>` in the last cell — a `<tr>` cannot take focus.
 */

export function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center gap-[7px] px-[9px] py-1 text-[11px] font-bold tracking-[0.1em] whitespace-nowrap uppercase",
        STATUS_TONE[status],
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {t(`dashboard.history.status.${status}`)}
    </span>
  );
}

/**
 * One field in the modal.
 *
 * An empty value renders as an em dash rather than an empty row. The old screen
 * left eight blank lines on a typical parcel, which reads as a broken layout;
 * a dash says "we asked, it was not given".
 */
export function Field({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | number;
}) {
  const has = value !== undefined && value !== null && String(value).trim() !== "";
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 not-last:border-b not-last:border-border">
      <span className="flex items-center gap-2 text-[13px] text-muted">
        <span className="flex-none">{icon}</span>
        {label}
      </span>
      <span className={cn("text-end text-[13.5px]", has ? "font-bold text-heading" : "text-muted")}>
        {has ? value : "—"}
      </span>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-1 text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">{title}</h4>
      {children}
    </section>
  );
}

/** The columns the table itself reads. Each log's record carries far more. */
export type ParcelRow = {
  no: string;
  status: OrderStatus;
  placedOn: string;
  /** Pre-formatted window; the API sends it as one string. */
  schedule: string;
  parcel: { name: string; quantity: number };
  totals: { total: string };
};

export function ParcelLog<T extends ParcelRow>({
  ns,
  icon: Icon,
  orders,
  routeHeading,
  routeValue,
  details,
}: {
  /** i18n namespace the chrome is read from — `dashboard.delivery` and friends. */
  ns: string;
  icon: LucideIcon;
  orders: T[];
  /** Header of the one column that differs: "Deliver to" / "Collect from". */
  routeHeading: string;
  routeValue: (order: T) => string;
  /** The modal's sections, below the shared status strip. */
  details: (order: T) => ReactNode;
}) {
  const { t } = useLang();
  const k = (s: string) => t(`${ns}.${s}`);
  const [open, setOpen] = useState<T | null>(null);

  if (orders.length === 0) {
    return (
      <Panel>
        <div className={`flex flex-col items-center gap-4 py-[clamp(32px,5vw,64px)] text-center ${PANEL_BODY}`}>
          <span className="flex h-14 w-14 items-center justify-center bg-brand/14 text-brand">
            <Icon size={24} strokeWidth={1.8} aria-hidden />
          </span>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-heading">
            {k("emptyTitle")}
          </span>
          <p className="max-w-[42ch] text-[13.5px] leading-[1.55]">{k("emptyBody")}</p>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel>
        <PanelHeader title={k("logTitle")}>
          <span className="flex-none text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {orders.length} {k("parcels")}
          </span>
        </PanelHeader>

        <div className="scroll-x">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{k("colParcel")}</th>
                <th>{k("colSchedule")}</th>
                <th>{routeHeading}</th>
                <th>{k("colStatus")}</th>
                <th className="text-end">{k("colTotal")}</th>
                <th>
                  <span className="sr-only">{k("colActions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.no}
                  onClick={() => setOpen(order)}
                  className="cursor-pointer transition-colors hover:bg-sunk"
                >
                  <td>
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                        <Icon size={16} strokeWidth={2} aria-hidden />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">
                          {order.parcel.name}
                        </span>
                        <span className="text-[11.5px] font-medium tracking-[0.1em] text-muted uppercase">
                          #{order.no} · {t("dashboard.history.qty")} {order.parcel.quantity}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap">{order.schedule}</td>
                  <td>{routeValue(order)}</td>
                  <td>
                    <StatusPill status={order.status} />
                  </td>
                  <td className="text-end font-bold whitespace-nowrap text-heading">
                    {order.totals.total}
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setOpen(order); }}
                      className="cursor-pointer text-[12px] font-bold tracking-[0.12em] whitespace-nowrap text-brand uppercase transition-opacity hover:opacity-70"
                    >
                      {k("viewAll")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        size="lg"
        labelledBy="parcel-modal-title"
        icon={<Icon size={17} strokeWidth={2.2} aria-hidden />}
        title={open ? `${t("dashboard.history.order")} #${open.no}` : ""}
      >
        {open && (
          <div className="flex flex-col gap-6 p-[clamp(16px,1.8vw,22px)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-sunk px-3.5 py-2.5">
              <StatusPill status={open.status} />
              <span className="text-[12.5px] text-muted">
                {t("dashboard.history.placedOn")} {open.placedOn}
              </span>
            </div>

            {details(open)}
          </div>
        )}
      </Modal>
    </>
  );
}
