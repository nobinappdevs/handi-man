"use client";

import { useLang } from "@/hooks/useLang";
import { Panel, SkLine } from "@/components/dashboard/Panel";
import { STAT_ROW } from "@/components/dashboard/StatCards";
import { cn } from "@/components/ui/cn";

/**
 * The dashboard's own outline, shown while `AuthGuard` waits for the profile
 * to say the session is good - in place of a centred spinner on a blank page.
 *
 * It is drawn to the shell's real measurements (the 76 / 260px rail, the 68px
 * header, `PageShell`'s padding, the overview's stat row, chart and table), so
 * when the dashboard arrives it lands on top of its own silhouette and nothing
 * jumps. No data, no nav labels: this renders before anyone is known to be
 * signed in.
 *
 * `motion-safe:` - the pulse is decoration, and stops for reduced motion.
 */

/** The rail is near-black in both themes, so its bones are white-on-dark. */
const RAIL_BONE = "motion-safe:animate-pulse bg-white/10";
const RAIL_TEXT = "block lg:hidden xl:block";

function RailSkeleton() {
  return (
    <aside
      aria-hidden
      className="sticky top-0 hidden h-screen flex-none flex-col bg-rail lg:flex lg:w-19 xl:w-65"
    >
      <div className="flex h-17 flex-none items-center border-b border-white/10 px-5">
        <span className={cn(RAIL_BONE, "h-8 w-8 lg:mx-auto xl:mx-0")} />
        <span className={cn(RAIL_BONE, RAIL_TEXT, "ms-3 h-4 w-28")} />
      </div>

      <div className="flex flex-1 flex-col gap-6 px-3 pt-5 lg:px-2.5 xl:px-3">
        {[4, 3].map((count, g) => (
          <div key={g} className="flex flex-col gap-1">
            <span className={cn(RAIL_BONE, RAIL_TEXT, "mx-2.5 mb-2 h-2.5 w-16")} />
            {Array.from({ length: count }, (_, i) => (
              <span key={i} className="flex h-10 items-center gap-3 px-2.5 lg:justify-center xl:justify-start">
                <span className={cn(RAIL_BONE, "h-5 w-5 flex-none")} />
                <span className={cn(RAIL_BONE, RAIL_TEXT, "h-3 flex-none")} style={{ width: `${55 + ((i * 23 + g * 17) % 35)}%` }} />
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className={cn(RAIL_TEXT, "flex-none border-t border-white/10 px-5 pt-4 pb-5")}>
        <span className={cn(RAIL_BONE, "h-2.5 w-20")} />
        <span className={cn(RAIL_BONE, "mt-2.5 h-3.5 w-32")} />
      </div>
    </aside>
  );
}

export function DashboardSkeleton() {
  const { t } = useLang();

  return (
    <div role="status" aria-live="polite" className="flex min-h-screen items-stretch bg-page">
      <span className="sr-only">{t("common.loading")}</span>

      <RailSkeleton />

      <div aria-hidden className="flex min-w-0 flex-auto flex-col">
        {/* ── Header ── */}
        <div className="flex h-17 flex-none items-center gap-[clamp(10px,1.4vw,18px)] border-b border-border bg-bg px-[clamp(16px,2.4vw,34px)]">
          <SkLine className="h-10 w-10 lg:hidden" />
          <SkLine className="hidden h-3.5 w-40 min-[560px]:block" />
          <span className="ms-auto flex items-center gap-2.5">
            <SkLine className="h-10 w-10" />
            <SkLine className="h-10 w-10" />
            <SkLine className="hidden h-10 w-32 min-[760px]:block" />
          </span>
        </div>

        {/* ── Page, on PageShell's own padding ── */}
        <div className="flex min-w-0 flex-auto flex-col gap-[clamp(18px,2vw,28px)] px-[clamp(16px,2.4vw,34px)] pt-[clamp(22px,2.8vw,38px)] pb-[clamp(32px,3.4vw,52px)]">
          <SkLine className="h-[clamp(28px,2.6vw,38px)] w-[min(280px,60%)]" />

          <div className={`${STAT_ROW} min-[1060px]:grid-cols-4`}>
            {Array.from({ length: 4 }, (_, i) => (
              <Panel key={i} className="flex flex-col gap-4 p-[clamp(16px,1.7vw,22px)]">
                <span className="flex items-center justify-between">
                  <SkLine className="h-3 w-24" />
                  <SkLine className="h-9 w-9" />
                </span>
                <SkLine className="h-7 w-28" />
                <SkLine className="h-2 w-full" />
              </Panel>
            ))}
          </div>

          <Panel className="flex flex-col gap-5 p-[clamp(16px,1.8vw,24px)]">
            <span className="flex items-center justify-between gap-4">
              <SkLine className="h-4 w-40" />
              <SkLine className="h-8 w-48" />
            </span>
            {/* A row of bars, not a block - it reads as "a chart is coming". */}
            <div className="flex h-[clamp(180px,22vw,260px)] items-end gap-[clamp(4px,0.8vw,10px)]">
              {Array.from({ length: 18 }, (_, i) => (
                <div key={i} className="flex-1" style={{ height: `${30 + ((i * 37) % 65)}%` }}>
                  <SkLine className="h-full w-full" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-4 p-[clamp(16px,1.8vw,22px)]">
              <SkLine className="h-4 w-36" />
              <SkLine className="h-9 w-28" />
            </div>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 border-t border-border px-[clamp(16px,1.8vw,24px)] py-4">
                <SkLine className="h-9.5 w-9.5 flex-none" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <SkLine className="h-3.5 w-[min(220px,70%)]" />
                  <SkLine className="h-2.5 w-[min(140px,45%)]" />
                </span>
                <SkLine className="hidden h-3.5 w-24 min-[760px]:block" />
                <SkLine className="h-6 w-20" />
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
