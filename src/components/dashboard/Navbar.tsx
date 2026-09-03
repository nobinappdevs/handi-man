"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { SquareIconButton } from "@/components/ui/SquareIconButton";
import { ThemeToggle } from "@/components/share/ThemeToggle";
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
 */
export function Navbar({ onMenu }: { onMenu: () => void }) {
  const { t } = useLang();
  /* Read from the URL, not a prop: this bar lives in the layout, which never
     sees which page rendered underneath it. */
  const pathname = usePathname();
  const page = pageFromPath(pathname);
  const menuItems = profileMenuFor(areaFromPath(pathname));
  const [menu, setMenu] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  /* Close on any click that is not inside the dropdown's own wrapper, and on
     Escape. `pointerdown` rather than `click` so it fires before a link inside
     the menu navigates away. */
  useEffect(() => {
    if (!menu) return;
    function onDown(e: PointerEvent) {
      if (!wrap.current?.contains(e.target as Node)) setMenu(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenu(false);
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <header className="sticky top-0 z-30 flex h-[78px] flex-none items-center gap-[clamp(10px,1.4vw,18px)] border-b border-border bg-bg px-[clamp(14px,2.2vw,30px)]">
      <SquareIconButton onClick={onMenu} aria-label={t("nav.menu")} className="lg:hidden">
        <Menu size={18} strokeWidth={2.3} aria-hidden />
      </SquareIconButton>

      <span className="hidden flex-none text-[13px] font-medium tracking-[0.12em] text-muted uppercase min-[560px]:block">
        {t("brand.name")} <span className="inline text-brand">/ {t(`dashboard.pages.${page}.nav`)}</span>
      </span>

      <label className="relative ms-auto hidden max-w-[380px] flex-auto items-center min-[860px]:flex">
        <Search
          size={16}
          strokeWidth={2.2}
          aria-hidden
          className="absolute start-[13px] text-muted"
        />
        <input
          type="search"
          placeholder={t("dashboard.searchPlaceholder")}
          aria-label={t("dashboard.searchPlaceholder")}
          className="h-11 w-full border border-border bg-card ps-[38px] pe-3.5 text-[14.5px] font-medium text-heading outline-none transition-colors focus:border-primary"
        />
      </label>

      <div className="ms-auto flex flex-none items-center gap-[clamp(8px,1vw,12px)] min-[860px]:ms-0">
        {/* Not in the design's header, which has no theme or language control
            at all — but the dashboard is a whole shell of its own, and without
            these two the only way to reach either setting is to leave it. */}
        <LanguageSwitcher variant="square" />
        <ThemeToggle variant="square" />

        <SquareIconButton aria-label={t("dashboard.notifications")} className="relative">
          <Bell size={18} strokeWidth={2} aria-hidden />
          {/* The ring is `--bar`, so the dot reads as punched out of the bar. */}
          <span
            aria-hidden
            className="absolute top-[7px] right-2 h-[7px] w-[7px] bg-primary shadow-[0_0_0_2px_rgb(var(--bg))]"
          />
        </SquareIconButton>

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
            <span className="flex h-[34px] w-[34px] flex-none items-center justify-center bg-primary text-[15px] font-semibold text-white">
              {t("dashboard.user.name").charAt(0)}
            </span>
            <span className="hidden flex-col items-start leading-[1.15] min-[700px]:flex">
              <span className="text-[14px] font-semibold text-heading">{t("dashboard.user.name")}</span>
              <span className="text-[11.5px] font-medium tracking-[0.14em] text-muted uppercase">
                {t("dashboard.user.role")}
              </span>
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
                  "flex w-full items-center gap-[11px] px-3 py-[11px] text-[14px] font-semibold transition-colors hover:bg-sunk";
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
