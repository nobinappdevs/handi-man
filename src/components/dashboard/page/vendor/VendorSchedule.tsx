"use client";

import { CalendarClock, MapPin, User } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/page/vendor/VendorOrders";
import { VENDOR_SCHEDULE } from "@/components/dashboard/page/vendor/vendorData";

/**
 * The week, grouped by day.
 *
 * Not a table: a vendor reads a schedule as "what is today, then what is
 * tomorrow", and a flat list sorted by timestamp buries the day boundary that
 * matters most. A day with nothing booked still gets its panel, so an empty
 * Thursday reads as free rather than as missing data.
 */
export function VendorSchedule() {
  const { t } = useLang();

  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      {VENDOR_SCHEDULE.map((day) => (
        <Panel key={day.dayKey}>
          <PanelHeader title={t(`dashboard.vendor.schedule.${day.dayKey}`)}>
            <span className="flex flex-none items-center gap-2 text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
              <CalendarClock size={14} strokeWidth={2.2} aria-hidden />
              {day.date}
            </span>
          </PanelHeader>

          {day.slots.length === 0 ? (
            <p className={`text-center text-[13.5px] text-muted ${PANEL_BODY}`}>
              {t("dashboard.vendor.schedule.emptyDay")}
            </p>
          ) : (
            day.slots.map((slot) => (
              <div
                key={slot.orderNo}
                className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border px-[clamp(16px,1.8vw,24px)] py-4 first:border-t-0"
              >
                {/* The time is the anchor, so it leads and holds a fixed width
                    — the rows have to line up down the day to be scannable. */}
                <span className="flex w-[150px] flex-none flex-col gap-0.5 border-s-2 border-primary ps-3">
                  <span className="text-[14px] font-bold tracking-[-0.01em] text-heading">
                    {slot.time}
                  </span>
                  <span className="text-[11.5px] font-medium tracking-[0.1em] text-muted uppercase">
                    #{slot.orderNo}
                  </span>
                </span>

                <span className="flex min-w-[200px] flex-auto items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center bg-brand/14 text-brand">
                    <slot.icon size={16} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-[14.5px] font-bold tracking-[-0.015em] text-heading">
                      {t(`${slot.copyNs ?? "servicesPage.items"}.${slot.serviceKey}.title`)}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">
                      <span className="flex items-center gap-1.5">
                        <User size={12} strokeWidth={2} aria-hidden />
                        {slot.customer}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} strokeWidth={2} aria-hidden />
                        {slot.address}
                      </span>
                    </span>
                  </span>
                </span>

                <StatusPill status={slot.status} />
              </div>
            ))
          )}
        </Panel>
      ))}
    </div>
  );
}
