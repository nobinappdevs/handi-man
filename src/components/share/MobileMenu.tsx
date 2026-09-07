"use client";

import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell } from "@/components/context/ShellContext";
import { CircleIconButton } from "@/components/share/CircleIconButton";
import { Logo } from "@/components/share/Logo";
import { ACCOUNT_LINKS, SITE_LINKS, VENDOR_LINK } from "@/components/share/navLinks";

/**
 * Left slide-over navigation, shown below the header's nav breakpoint — the
 * one `NAV_SHOW`/`NAV_HIDE` in `navLinks.ts` define, which is what opens this.
 *
 * It stacks both link groups in the order the header lays them out: the site's
 * content first, then account, separated by the same rule the header draws
 * between them.
 */
export function MobileMenu() {
  const { t, dir } = useLang();
  const { drawer, closeDrawer } = useShell();
  const open = drawer === "menu";
  /* Docked at `start` — the left edge in ltr, the right edge in rtl. The
     closed state has to slide off THAT same edge, so the sign flips with it;
     a hardcoded negative offset would land the "closed" drawer back on
     screen once `start` flips sides. */
  const rtl = dir === "rtl";

  return (
    <aside
      aria-label={t("nav.menu")}
      aria-hidden={!open}
      className={`fixed inset-y-0 start-0 z-50 flex w-[min(320px,84vw)] flex-col bg-drawer text-drawer-ink transition-transform duration-[320ms] ease-[cubic-bezier(.4,0,.2,1)] ${
        rtl ? "shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.6)]" : "shadow-[30px_0_60px_-30px_rgba(0,0,0,0.6)]"
      } ${open ? "translate-x-0" : rtl ? "translate-x-[105%]" : "translate-x-[-105%]"}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-drawer-line px-[22px] py-5">
        <Logo size="sm" />
        <CircleIconButton size={40} tone="soft" onClick={closeDrawer} aria-label={t("common.close")}>
          <X size={15} strokeWidth={2.6} aria-hidden />
        </CircleIconButton>
      </div>

      <nav
        aria-label={t("nav.menu")}
        className="flex flex-1 flex-col overflow-y-auto py-2.5 font-nav text-[14px] font-medium"
      >
        {SITE_LINKS.map(({ href, key }) => (
          <Link
            key={href}
            href={href}
            onClick={closeDrawer}
            className="border-b border-drawer-line px-[22px] py-3.5 text-base leading-none text-drawer-ink hover:text-brand"
          >
            {t(key)}
          </Link>
        ))}

        {/* The vendor path has a button of its own in the header, so it needs
            a home here too — otherwise it is reachable on desktop only. */}
        <Link
          href={VENDOR_LINK.href}
          onClick={closeDrawer}
          className="border-b border-drawer-line px-[22px] py-3.5 text-base leading-none font-semibold text-brand"
        >
          {t(VENDOR_LINK.key)}
        </Link>

        {/* Account, set apart the way the header sets it apart — a gap and a
            lighter weight, so the two groups read as two. */}
        <span className="mt-3 flex flex-col gap-0 pt-3">
          {ACCOUNT_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              onClick={closeDrawer}
              className="px-[22px] py-3 text-[15px] leading-none font-medium text-drawer-ink/75 hover:text-brand"
            >
              {t(key)}
            </Link>
          ))}
        </span>
      </nav>

      <div className="px-[22px] py-[18px]">
        <Link
          href="/services"
          onClick={closeDrawer}
          className="flex h-12 items-center justify-center gap-[9px] bg-primary font-nav text-[14px] font-medium  leading-none  text-white transition-colors hover:bg-primary-dark hover:text-white"
        >
          {t("nav.bookService")}
          <ArrowRight size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
        </Link>
      </div>
    </aside>
  );
}
