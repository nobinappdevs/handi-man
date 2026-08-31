"use client";

import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell } from "@/components/context/ShellContext";
import { CircleIconButton } from "@/components/share/CircleIconButton";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/services", key: "nav.services" },
  { href: "/vendors", key: "nav.vendors" },
  { href: "/delivery", key: "nav.delivery" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/contact", key: "nav.contact" },
];

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
        <span className="text-xl font-extrabold tracking-[-0.02em]">{t("brand.name")}</span>
        <CircleIconButton size={32} tone="soft" onClick={closeDrawer} aria-label={t("common.close")}>
          <X size={15} strokeWidth={2.6} aria-hidden />
        </CircleIconButton>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto py-2.5 font-display text-base font-bold uppercase tracking-[0.12em]">
        {LINKS.map(({ href, key }) => (
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
          href="/contact"
          onClick={closeDrawer}
          className="flex h-12 items-center justify-center gap-[9px] bg-primary font-display text-[14.5px] font-bold uppercase leading-none tracking-[0.13em] text-white transition-colors hover:bg-primary-dark hover:text-white"
        >
          {t("nav.getQuote")}
          <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
