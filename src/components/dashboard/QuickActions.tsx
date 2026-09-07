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

/**
 * Three shortcuts under the tracker. The filled plum icon tile on each row is
 * gone — the same square repeated three times said nothing the label did not,
 * and the column now has one accent in it rather than four.
 */
export function QuickActions() {
  const { t } = useLang();

  return (
    <section className="border border-border bg-card">
      <span className="block border-b border-border px-[clamp(18px,1.9vw,24px)] py-3.5 text-[13.5px] font-medium text-heading">
        {t("dashboard.actions.title")}
      </span>

      {QUICK_ACTIONS.map(({ key, icon: Icon }) => (
        <Link
          key={key}
          href={HREFS[key]}
          className="group flex items-center gap-3 border-b border-border px-[clamp(18px,1.9vw,24px)] py-3.5 transition-colors last:border-b-0 hover:bg-sunk"
        >
          <Icon size={17} strokeWidth={1.9} aria-hidden className="flex-none text-muted" />
          <span className="flex min-w-0 flex-auto flex-col gap-0.5">
            <span className="truncate text-[14px] font-medium text-heading">
              {t(`dashboard.actions.${key}.label`)}
            </span>
            <span className="truncate text-[12.5px] font-normal text-muted">
              {t(`dashboard.actions.${key}.note`)}
            </span>
          </span>
          <ChevronRight
            size={15}
            strokeWidth={2}
            aria-hidden
            className="flex-none text-muted transition-colors group-hover:text-brand"
          />
        </Link>
      ))}
    </section>
  );
}
