"use client";

import type { ReactNode } from "react";
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
 *
 * The date used to be a plum uppercase eyebrow behind an arrow glyph, which
 * made the least important line on the screen the most decorated. It is a
 * muted caption above the heading now, and the heading carries the page.
 */
export function PageShell({
  page,
  actions,
  head,
  children,
}: {
  page: PageKey;
  actions?: ReactNode;
  /**
   * Replaces the whole head block, not just its trailing slot. The overview
   * heads itself: the design gives that one screen a month caption, a bare
   * "Overview" title and a range switcher where every other screen has a
   * date, a lead paragraph and CTAs. `<main>` and its rhythm still come from
   * here, so the two cannot drift apart on padding.
   */
  head?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLang();
  const isClient = useIsClient();

  /* The date is live data, and a static export prerenders at BUILD time — so
     formatting it during render would bake the build date into the HTML and
     mismatch on hydration. Client-only; `min-h` holds the line's height so
     nothing below it jumps when the value arrives.

     en-GB rather than the visitor locale: the design writes "Wednesday, 3
     September" and the US order reads wrong against the rest of the copy.
     Swap to `lang` once the dictionaries carry translations. */
  const today = isClient
    ? new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <main className="flex min-w-0 flex-auto flex-col gap-[clamp(18px,2vw,28px)] px-[clamp(16px,2.4vw,34px)] pt-[clamp(22px,2.8vw,38px)] pb-[clamp(32px,3.4vw,52px)]">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5">
        {head ?? (
          <>
            <div className="flex min-w-0 flex-col gap-2">
              <span className="min-h-[18px] text-[13px] leading-none font-normal text-muted">
                {today}
              </span>
              <h1 className="text-[clamp(24px,2.6vw,34px)] leading-[1.1] font-semibold tracking-[-0.025em]">
                {t(`dashboard.pages.${page}.heading`)}
              </h1>
              <p className="max-w-[560px] text-[14.5px] leading-[1.6] font-normal text-muted">
                {t(`dashboard.pages.${page}.sub`)}
              </p>
            </div>
            {actions}
          </>
        )}
      </div>

      {children}
    </main>
  );
}
