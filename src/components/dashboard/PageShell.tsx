"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import type { PageKey } from "@/components/dashboard/dashboardData";

/**
 * `<main>` plus the page head every dashboard screen opens with — date, title,
 * lead, and an optional action slot.
 *
 * Extracted from `DashboardView` so the overview and the settings screens
 * cannot drift into two different headers. `actions` is a slot rather than a
 * prop list because the overview's two CTAs are its own; Profile, 2FA and KYC
 * pass nothing.
 */
export function PageShell({
  page,
  actions,
  children,
}: {
  page: PageKey;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLang();
  const isClient = useIsClient();

  /* The date is live data, and a static export prerenders at BUILD time — so
     formatting it during render would bake the build date into the HTML and
     mismatch on hydration. Client-only; the row height is already set by the
     arrow, so nothing jumps.

     en-GB rather than the visitor locale: the design writes "Wednesday, 3
     September" and the US order reads wrong against the rest of the copy.
     Swap to `lang` once the dictionaries carry translations. */
  const today = isClient
    ? new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <main className="flex min-w-0 flex-auto flex-col gap-[clamp(16px,1.8vw,24px)] px-[clamp(14px,2.2vw,30px)] pt-[clamp(18px,2.4vw,34px)] pb-[clamp(30px,3vw,44px)]">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-col gap-[7px]">
          <span className="flex items-center gap-[9px] text-[13px] leading-none font-medium tracking-[0.12em] text-brand uppercase">
            <ArrowRight size={15} strokeWidth={2.6} aria-hidden className="flex-none" />
            {today}
          </span>
          <h1 className="text-[clamp(26px,3vw,40px)] leading-[1.02] font-semibold tracking-[-0.035em]">
            {t(`dashboard.pages.${page}.heading`)}
          </h1>
          <p className="max-w-[470px] text-[15px] leading-[1.55]">
            {t(`dashboard.pages.${page}.sub`)}
          </p>
        </div>
        {actions}
      </div>

      {children}
    </main>
  );
}
