"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ChevronDown } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useDismiss } from "@/hooks/useDismiss";
import { cn } from "@/components/ui/cn";
import { SquareIconButton } from "@/components/ui/SquareIconButton";
import { ThemeToggle } from "@/components/share/ThemeToggle";
import { NotificationMenu } from "@/components/dashboard/NotificationMenu";
import { LanguageSwitcher } from "@/components/share/LanguageSwitcher";
import { profileMenuFor, areaFromPath, DASH_ROUTES, pageFromPath } from "@/components/dashboard/dashboardData";

/**
 * Header bar. Four things drop out as the viewport narrows, each at its own
 * threshold rather than one shared breakpoint — the bar has to stay usable at
 * every width, and they do not all cost the same:
 *
 *   < 560  breadcrumb
 *   < 700  the name/role beside the avatar (the avatar itself stays)
 *   < 860  search, and the actions take over the `auto` margin it was holding
 *   < 1024 burger appears (the rail has gone off-canvas)
 *
 * `--bar` in the design is white in light and #12100f in dark, which is
 * exactly `--bg` — hence `bg-bg` and not `bg-card`.
 *
 * 68px to sit level with the rail's brand block. Every label in here is
 * sentence case now: a breadcrumb, a name and a role set in tracked uppercase
 * turned the quietest strip on the screen into three competing headlines.
 */
export function Navbar({ onMenu }: { onMenu: () => void }) {
  const { t } = useLang();
  /* Read from the URL, not a prop: this bar lives in the layout, which never
     sees which page rendered underneath it. */
  const pathname = usePathname();
  const page = pageFromPath(pathname);
  const area = areaFromPath(pathname);
  const menuItems = profileMenuFor(area);
  const [menu, setMenu] = useState(false);
  const wrap = useDismiss(menu, () => setMenu(false));

  return (
    <header className="sticky top-0 z-30 flex h-[68px] flex-none items-center gap-[clamp(10px,1.4vw,18px)] border-b border-border bg-bg px-[clamp(16px,2.4vw,34px)]">
      <SquareIconButton onClick={onMenu} aria-label={t("nav.menu")} className="lg:hidden">
        <Menu size={18} strokeWidth={2.3} aria-hidden />
      </SquareIconButton>

      <span className="hidden flex-none text-[13.5px] font-normal text-muted min-[560px]:block">
        {t("brand.name")} <span className="inline text-heading">/ {t(`dashboard.pages.${page}.nav`)}</span>
      </span>

      <label className="relative ms-auto hidden max-w-[380px] flex-auto items-center min-[860px]:flex">
        <Search
          size={16}
          strokeWidth={2.2}
          aria-hidden
          className="absolute start-3 text-muted"
        />
        <input
          type="search"
          placeholder={t("dashboard.searchPlaceholder")}
          aria-label={t("dashboard.searchPlaceholder")}
          className="h-10 w-full border border-border bg-card ps-9 pe-3.5 text-[14px] font-normal text-heading outline-none transition-colors placeholder:text-muted focus:border-primary"
        />
      </label>

      <div className="ms-auto flex flex-none items-center gap-[clamp(8px,1vw,12px)] min-[860px]:ms-0">
        {/* Not in the design's header, which has no theme or language control
            at all — but the dashboard is a whole shell of its own, and without
            these two the only way to reach either setting is to leave it. */}
        <LanguageSwitcher variant="square" />
        <ThemeToggle variant="square" />

        <NotificationMenu area={area} />

        <div ref={wrap} className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menu}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 border bg-card py-1 pe-2.5 ps-1 transition-colors hover:border-primary",
              menu ? "border-primary" : "border-border",
            )}
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center bg-primary text-[14px] font-medium text-white">
              {t("dashboard.user.name").charAt(0)}
            </span>
            <span className="hidden flex-col items-start leading-[1.15] min-[700px]:flex">
              <span className="text-[13.5px] font-medium text-heading">{t("dashboard.user.name")}</span>
              <span className="text-[12px] font-normal text-muted">{t("dashboard.user.role")}</span>
            </span>
            <ChevronDown
              size={13}
              strokeWidth={2.4}
              aria-hidden
              className={cn("text-muted transition-transform duration-200", menu && "rotate-180")}
            />
          </button>

          {menu && (
            <div
              role="menu"
              className="absolute end-0 top-[calc(100%+9px)] flex w-[250px] flex-col border border-border bg-card p-1.5 shadow-[0_30px_60px_-30px_rgba(18,16,15,0.5)]"
            >
              {menuItems.map(({ key, icon: Icon, danger }) => {
                const label = t(`dashboard.menu.${key}`);
                const cls =
                  "flex w-full items-center gap-3 px-3 py-2.5 text-[14px] font-normal transition-colors hover:bg-sunk";
                /* Sign out is the one entry that is not a route. */
                return danger ? (
                  <button
                    key={key}
                    type="button"
                    role="menuitem"
                    onClick={() => setMenu(false)}
                    className={cn(cls, "cursor-pointer text-danger")}
                  >
                    <Icon size={17} strokeWidth={2} aria-hidden className="flex-none" />
                    {label}
                  </button>
                ) : (
                  <Link
                    key={key}
                    href={DASH_ROUTES[key]}
                    role="menuitem"
                    onClick={() => setMenu(false)}
                    className={cn(cls, "text-heading")}
                  >
                    <Icon size={17} strokeWidth={2} aria-hidden className="flex-none" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
