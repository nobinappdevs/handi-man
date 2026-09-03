"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell } from "@/components/context/ShellContext";
import { Logo } from "@/components/share/Logo";
import { ThemeToggle } from "@/components/share/ThemeToggle";
import { LanguageSwitcher } from "@/components/share/LanguageSwitcher";
import { cn } from "@/components/ui/cn";
import { SITE_LINKS } from "@/components/share/navLinks";

export function Navbar() {
  const { t } = useLang();
  const pathname = usePathname();
  const { openCart, openMenu, count } = useShell();

  return (
    <header className="border-b border-border bg-bg">
      {/* No right padding by design — the "Get a quote" block runs to the edge. */}
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-stretch gap-[clamp(10px,2.4vw,36px)] whitespace-nowrap ps-[clamp(14px,2.4vw,34px)] wide:h-20">
        <Link href="/" className="flex flex-none items-center hover:text-inherit">
          <Logo />
        </Link>

        <nav className="hidden min-w-0 flex-[0_1_auto] items-center gap-[clamp(9px,1.1vw,18px)]  font-nav text-[14px] font-medium min-[1280px]:flex">
          {SITE_LINKS.map(({ href, key, accent }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-[5px] py-1 text-[14.5px] leading-none hover:text-brand",
                  active ? "border-b-2 border-primary text-brand" : accent ? "text-brand" : "text-heading",
                )}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex flex-none items-center gap-[clamp(10px,1.2vw,16px)]">
          <div className="flex items-center gap-1">
            <ThemeToggle />

            <LanguageSwitcher />

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
          </div>

          <button
            type="button"
            onClick={openMenu}
            title={t("nav.menu")}
            aria-label={t("nav.menu")}
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-lg border border-border text-heading transition-colors hover:border-primary hover:text-brand min-[1280px]:hidden"
          >
            <Menu size={18} strokeWidth={2.4} aria-hidden />
          </button>

          <span aria-hidden className="hidden h-[26px] w-px bg-border min-[1280px]:block" />

          <Link
            href="/services"
            className="hidden items-center gap-[9px] self-stretch bg-primary px-[clamp(18px,2.2vw,34px)] font-nav text-[14.5px] leading-none font-medium  text-white  transition-colors hover:bg-primary-dark hover:text-white min-[1280px]:flex"
          >
            {t("nav.bookService")}
            <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
