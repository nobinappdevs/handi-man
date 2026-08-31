"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, ChevronDown, Search, ShoppingCart, Menu, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell } from "@/components/context/ShellContext";
import { ThemeToggle } from "@/components/share/ThemeToggle";
import { cn } from "@/components/ui/cn";

/** `caret: true` renders the design's dropdown chevron (menus are not in this design). */
const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/services", key: "nav.services", caret: true },
  { href: "/vendors", key: "nav.vendors", caret: true },
  { href: "/delivery", key: "nav.delivery" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/contact", key: "nav.contact" },
];

export function Navbar() {
  const { t } = useLang();
  const pathname = usePathname();
  const { openCart, openMenu, count } = useShell();

  return (
    <header className="border-b border-border bg-bg">
      {/* No right padding by design — the "Get a quote" block runs to the edge. */}
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-stretch gap-[clamp(10px,2.4vw,36px)] whitespace-nowrap ps-[clamp(14px,2.4vw,34px)] wide:h-20">
        <Link href="/" className="flex flex-none items-center gap-[11px] hover:text-inherit">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary text-white shadow-[0_0_0_4px_rgba(var(--primary__color),0.18)]">
            <Wrench size={19} strokeWidth={2.4} aria-hidden />
          </span>
          <span className="text-[clamp(19px,2vw,22px)] font-extrabold tracking-[-0.02em] text-heading">
            {t("brand.name")}
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-[0_1_auto] items-center gap-[clamp(12px,1.9vw,26px)] font-display text-[14.5px] font-bold uppercase tracking-[0.1em] wide:flex">
          {LINKS.map(({ href, key, caret }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-[5px] py-1 text-[14.5px] leading-none hover:text-brand",
                  active ? "border-b-2 border-primary text-brand" : "text-heading",
                )}
              >
                {t(key)}
                {caret && <ChevronDown size={10} strokeWidth={3} aria-hidden />}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex flex-none items-center gap-[clamp(10px,1.2vw,16px)]">
          <ThemeToggle />

          {/* Present in the design as an entry point; the search overlay itself
              is not part of it. Wire it up when that design arrives. */}
          <button
            type="button"
            aria-label={t("common.search")}
            className="flex cursor-pointer p-1 text-heading transition-colors hover:text-brand"
          >
            <Search size={18} strokeWidth={2.2} aria-hidden />
          </button>

          <button
            type="button"
            onClick={openCart}
            title={t("cart.title")}
            aria-label={t("cart.title")}
            className="relative flex cursor-pointer p-1 text-heading transition-colors hover:text-brand"
          >
            <ShoppingCart size={19} strokeWidth={2.2} aria-hidden />
            <span className="absolute -top-0.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-lg bg-primary px-[3px] text-[9.5px] font-extrabold leading-none text-white">
              {count}
            </span>
          </button>

          <button
            type="button"
            onClick={openMenu}
            title={t("nav.menu")}
            aria-label={t("nav.menu")}
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-lg border border-border text-heading transition-colors hover:border-primary hover:text-brand wide:hidden"
          >
            <Menu size={18} strokeWidth={2.4} aria-hidden />
          </button>

          <span aria-hidden className="hidden h-[26px] w-px bg-border wide:block" />

          <Link
            href="/contact"
            className="hidden items-center gap-[9px] self-stretch bg-primary px-[clamp(18px,2.2vw,34px)] font-display text-[14.5px] font-bold uppercase leading-none tracking-[0.12em] text-white transition-colors hover:bg-primary-dark hover:text-white wide:flex"
          >
            {t("nav.getQuote")}
            <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
