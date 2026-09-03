"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleCheck, CirclePause, Plus } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PANEL_BODY } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { CARD_PHOTOS } from "@/components/services/servicesData";
import { VENDOR_SERVICES } from "@/components/dashboard/page/vendor/vendorData";

/**
 * The listings this vendor offers.
 *
 * Same card vocabulary as the public catalogue — photo where one exists, the
 * service icon on a brand-tinted panel otherwise — so a vendor sees a listing
 * the way a customer will. What is added is state: a paused listing stays on
 * the account but takes no bookings, and is dimmed rather than hidden so it can
 * be found and switched back on.
 */
export function VendorServices() {
  const { t } = useLang();

  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[clamp(16px,1.6vw,19px)] font-semibold tracking-[-0.02em] text-heading">
          {t("dashboard.vendor.services.title")}
          <span className="ms-2 inline text-muted">({VENDOR_SERVICES.length})</span>
        </span>
        <Button leftIcon={<Plus size={16} strokeWidth={2.4} aria-hidden />}>
          {t("dashboard.vendor.services.add")}
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-[clamp(16px,1.8vw,24px)] min-[700px]:grid-cols-2 min-[1180px]:grid-cols-3">
        {VENDOR_SERVICES.map((svc) => {
          const photo = CARD_PHOTOS[svc.key];
          const Icon = svc.icon;
          return (
            <Panel key={svc.key} className={cn("flex flex-col", !svc.live && "opacity-70")}>
              <div className={cn("relative aspect-[1.6] overflow-hidden", photo ? "bg-form" : "bg-surface")}>
                {photo ? (
                  <Image
                    src={photo}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 700px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-brand/12 text-brand">
                    <Icon size={38} strokeWidth={1.4} aria-hidden />
                  </span>
                )}
                <span
                  className={cn(
                    "absolute top-0 left-0 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-[0.1em] text-white uppercase",
                    svc.live ? "bg-ok" : "bg-muted",
                  )}
                >
                  {svc.live ? (
                    <CircleCheck size={11} strokeWidth={3} aria-hidden />
                  ) : (
                    <CirclePause size={11} strokeWidth={3} aria-hidden />
                  )}
                  {t(svc.live ? "dashboard.vendor.services.live" : "dashboard.vendor.services.paused")}
                </span>
              </div>

              <div className={`flex flex-auto flex-col gap-2 ${PANEL_BODY}`}>
                <span className="text-[15.5px] font-bold tracking-[-0.015em] text-heading">
                  {t(`${svc.copyNs ?? "servicesPage.items"}.${svc.key}.title`)}
                </span>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[clamp(18px,1.8vw,22px)] leading-none font-bold tracking-[-0.03em] text-brand">
                    {svc.price}
                  </span>
                  <span className="text-[12.5px] text-muted">
                    {svc.booked} {t("dashboard.vendor.services.booked")}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 border-t border-border bg-sunk px-[clamp(14px,1.6vw,18px)] py-2.5">
                <button
                  type="button"
                  className="flex-auto cursor-pointer text-start text-[12px] font-bold tracking-[0.1em] text-brand uppercase transition-opacity hover:opacity-70"
                >
                  {t(svc.live ? "dashboard.vendor.services.pause" : "dashboard.vendor.services.resume")}
                </button>
                <Link
                  href="/services"
                  className="flex-none text-[12px] font-bold tracking-[0.1em] text-muted uppercase transition-colors hover:text-brand"
                >
                  {t("dashboard.vendor.services.preview")}
                </Link>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
