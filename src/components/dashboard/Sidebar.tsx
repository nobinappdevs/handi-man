"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { Logo, LogoMark } from "@/components/share/Logo";
import { navGroupsFor, areaFromPath, DASH_ROUTES } from "@/components/dashboard/dashboardData";

/**
 * The rail has THREE states, not two, and they are pure CSS — no JS reads the
 * viewport:
 *
 *   < 1024   off-canvas drawer, 260px, slid out by `drawer`
 *   1024-1279  76px icon rail, every label hidden
 *   >= 1280  260px, labels back
 *
 * So anything textual is `block lg:hidden xl:block` — shown at BOTH ends and
 * hidden only in the middle band. That is the shape to copy for anything new
 * in here; a plain `hidden xl:block` would also blank it inside the mobile
 * drawer, which is 260px wide and has all the room in the world.
 */
const RAIL_TEXT = "block lg:hidden xl:block";

export function Sidebar({ drawer, onNavigate }: { drawer: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const { t } = useLang();
  /* Customer rail or vendor rail, decided by the URL — see `areaFromPath`. */
  const groups = navGroupsFor(areaFromPath(pathname));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-[45] flex w-[260px] max-w-[86vw] flex-none flex-col overflow-hidden bg-rail",
        "transition-transform duration-[260ms] ease-[cubic-bezier(.3,.75,.2,1)]",
        "lg:sticky lg:top-0 lg:h-screen lg:w-[76px] lg:max-w-none lg:translate-x-0 xl:w-[260px]",
        drawer ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* ── Brand ── the skewed plum wedge is the hero's, shrunk to 78px. */}
      <div className="relative flex h-[78px] flex-none items-center gap-[11px] overflow-hidden border-b border-white/10 px-5">
        {/* Sits at the far right of a 260px header, clear of the lockup — but
            in the 76px band it lands directly under the mark and turns a white
            line drawing into mush. RAIL_TEXT drops it in exactly that band. */}
        <div
          aria-hidden
          className={cn(
            RAIL_TEXT,
            "absolute inset-y-0 -right-[18px] w-16 skew-x-[-13deg] bg-primary opacity-90",
          )}
        />
        {/* `tone="on-dark"` in BOTH themes — the rail is near-black either way,
            so the lockup must not follow the page theme. The wordmark is
            dropped for the mark alone in the 76px band, which is the one state
            it cannot fit; note the inverse of RAIL_TEXT, not `xl:hidden`
            alone, or the mark would also replace the lockup in the drawer. */}
        <Link href="/" aria-label={t("brand.name")} className="relative flex items-center">
          <span className={RAIL_TEXT}>
            <Logo tone="on-dark" size="lg" />
          </span>
          <span className="hidden lg:block xl:hidden">
            <LogoMark tone="on-dark" size={36} />
          </span>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto pt-[18px] pb-2.5">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-0.5">
            <span
              className={cn(
                RAIL_TEXT,
                "px-5 pb-2 text-[14px] font-medium tracking-[0.14em] text-white/35 uppercase",
              )}
            >
              {t(`dashboard.nav.${group.key}`)}
            </span>

            {group.items.map(({ key, icon: Icon, count }) => {
              const href = DASH_ROUTES[key];
              const active = pathname === href;
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={t(`dashboard.pages.${key}.nav`)}
                  className={cn(
                    "relative flex min-h-[46px] w-full items-center gap-[13px] px-5 transition-colors duration-150",
                    active ? "bg-white/8 text-white" : "text-white/60 hover:bg-white/6 hover:text-white",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 start-0 w-[3px]",
                      active ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <Icon size={18} strokeWidth={2} aria-hidden className="flex-none" />
                  <span
                    className={cn(
                      RAIL_TEXT,
                      "truncate text-[14px] font-medium tracking-[0.1em] uppercase",
                    )}
                  >
                    {t(`dashboard.pages.${key}.nav`)}
                  </span>
                  {count != null && (
                    <span
                      className={cn(
                        RAIL_TEXT,
                        "ms-auto min-w-[22px] bg-primary px-1.5 py-0.5 text-center text-[11.5px] font-medium tracking-[0.06em] text-white",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Support ── */}
      <div className={cn(RAIL_TEXT, "flex-none border-t border-white/10 px-5 pt-[18px] pb-[22px]")}>
        <span className="text-[14px] font-medium tracking-[0.13em] text-primary-on-dark uppercase">
          {t("dashboard.support.label")}
        </span>
        <span className="mt-1.5 text-[17px] font-semibold tracking-[-0.01em] text-white">
          {t("dashboard.support.phone")}
        </span>
        <span className="mt-1.5 text-[14px] leading-[1.5] font-normal text-white/60">
          {t("dashboard.support.note")}
        </span>
      </div>
    </aside>
  );
}
