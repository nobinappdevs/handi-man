"use client";

import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell } from "@/components/context/ShellContext";
import { CircleIconButton } from "@/components/share/CircleIconButton";
import { Logo } from "@/components/share/Logo";
import { SITE_LINKS } from "@/components/share/navLinks";

/** Left slide-over navigation, shown below the design's 980px nav breakpoint. */
export function MobileMenu() {
  const { t } = useLang();
  const { drawer, closeDrawer } = useShell();
  const open = drawer === "menu";

  return (
    <aside
      aria-label={t("nav.menu")}
      aria-hidden={!open}
      className={`fixed inset-y-0 start-0 z-50 flex w-[min(320px,84vw)] flex-col bg-drawer text-drawer-ink shadow-[30px_0_60px_-30px_rgba(0,0,0,0.6)] transition-transform duration-[320ms] ease-[cubic-bezier(.4,0,.2,1)] ${
        open ? "translate-x-0" : "-translate-x-[105%]"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-drawer-line px-[22px] py-5">
        <Logo size="sm" />
        <CircleIconButton size={32} tone="soft" onClick={closeDrawer} aria-label={t("common.close")}>
          <X size={15} strokeWidth={2.6} aria-hidden />
        </CircleIconButton>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto py-2.5 font-nav text-[14px] font-medium ">
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
      </nav>

      <div className="px-[22px] py-[18px]">
        <Link
          href="/services"
          onClick={closeDrawer}
          className="flex h-12 items-center justify-center gap-[9px] bg-primary font-nav text-[14px] font-medium  leading-none  text-white transition-colors hover:bg-primary-dark hover:text-white"
        >
          {t("nav.bookService")}
          <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
