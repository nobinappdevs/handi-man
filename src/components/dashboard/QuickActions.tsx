"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { QUICK_ACTIONS, DASH_ROUTES } from "@/components/dashboard/dashboardData";

const HREFS: Record<string, string> = {
  rebook: DASH_ROUTES.vendors,
  sendParcel: "/delivery",
  addAddress: DASH_ROUTES.address,
};

export function QuickActions() {
  const { t } = useLang();

  return (
    <section className="border border-border bg-card">
      <span className="block px-[clamp(16px,1.8vw,22px)] pt-4 pb-3 text-[12px] font-medium tracking-[0.12em] text-muted uppercase">
        {t("dashboard.actions.title")}
      </span>

      {QUICK_ACTIONS.map(({ key, icon: Icon }) => (
        <Link
          key={key}
          href={HREFS[key]}
          className="flex items-center gap-[13px] border-t border-border px-[clamp(16px,1.8vw,22px)] py-3.5 transition-colors hover:bg-sunk"
        >
          <span className="flex h-[34px] w-[34px] flex-none items-center justify-center bg-brand/14 text-brand">
            <Icon size={17} strokeWidth={2} aria-hidden />
          </span>
          <span className="flex min-w-0 flex-auto flex-col gap-0.5">
            <span className="text-[14.5px] font-semibold text-heading">
              {t(`dashboard.actions.${key}.label`)}
            </span>
            <span className="text-[12.5px] font-normal text-muted">
              {t(`dashboard.actions.${key}.note`)}
            </span>
          </span>
          <ChevronRight size={15} strokeWidth={2.4} aria-hidden className="flex-none text-muted" />
        </Link>
      ))}
    </section>
  );
}
