"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Headphones, Mail, Menu, Phone, ShoppingCart, Users } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell } from "@/components/context/ShellContext";
import { Logo } from "@/components/share/Logo";
import { ThemeToggle } from "@/components/share/ThemeToggle";
import { LanguageSwitcher } from "@/components/share/LanguageSwitcher";
import { ServicesMenu } from "@/components/share/ServicesMenu";
import { cn } from "@/components/ui/cn";
import { ACCOUNT_LINKS, NAV_HIDE, NAV_SHOW, SITE_LINKS, VENDOR_LINK } from "@/components/share/navLinks";

/* One nav link. The active page is marked by a plum rule under the label.

   That rule is an absolutely positioned span rather than a `border-b-2`: a
   border on the active link alone makes it 2px taller than its neighbours and
   nudges the whole row, whereas this takes no space at all. */
const LINK = "relative py-2 text-[14.5px] leading-none font-medium transition-colors";

/** The hairline that separates groups inside a tier. */
function Divider({ className }: { className?: string }) {
  return <span aria-hidden className={cn("h-4 w-px flex-none bg-border", className)} />;
}

/**
 * The public site header — two tiers.
 *
 *   1. A slim utility strip: how to reach a human, plus the two preferences
 *      that are not navigation (theme, language).
 *   2. The main bar: lockup, site nav, cart, and the three account/conversion
 *      actions.
 *
 * ── Why it is built this way ──
 *
 *  • **Only the main bar ends up pinned.** The whole header is sticky, but at
 *    `-top-[41px]` — a negative offset of exactly the strip's `h-10` plus its
 *    1px border. The strip therefore scrolls up out of view and the bar comes
 *    to rest at y=0, so what follows you down the page is one 72px bar rather
 *    than 113px of chrome. This is also why the header is one sticky box and
 *    not a sticky second tier: a sticky child is bounded by its parent's
 *    height, so a bar stuck inside the header would unstick after 40px of
 *    scroll. It keeps `--header-h` in `globals.css` honest too — the services
 *    rail, both request-form summaries and `scroll-padding-top` all offset
 *    against that variable, and it describes the bar alone.
 *  • **The tiers split by kind.** Tier one is contact and preferences, things
 *    you touch once. Tier two is where you are going and what you are here to
 *    do. The three-row header this replaces split by no principle at all: a
 *    slogan strip, then a row repeating the address and email that are also in
 *    the footer, then the nav.
 *  • **Buttons are square**, like every other CTA on the site (`CtaLink`).
 *    Only the icon controls are round, which keeps the two kinds of target
 *    telling themselves apart.
 *
 * Accent colours are `brand`, not `primary`: `--brand-ink` flips to the light
 * plum in dark mode while `--color-primary` stays #450C3F, so plum-on-dark ink
 * would all but vanish. See the note above the ramp in `globals.css`.
 */
export function Navbar() {
  const { t } = useLang();
  const pathname = usePathname();
  const { openCart, openMenu, count } = useShell();

  /* Purely cosmetic: the bar earns a shadow only once there is something
     scrolled underneath it, which is what makes it read as floating rather
     than as a band that was always there. Passive, and it never reads layout
     — `scrollY` alone, so there is no forced reflow on the scroll path. */
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const phone = t("footer.contacts.phone");
  const email = t("footer.contacts.email");
  const signIn = ACCOUNT_LINKS[ACCOUNT_LINKS.length - 1];

  return (
    /* -41px is the strip's full height, negated: its `h-10` plus the 1px
       `border-b` under it. Keep the two in step — that equality is what lands
       the main bar exactly at y=0 when pinned, and at -40px a 1px sliver of
       the strip's border stays on screen.
       Under `ScrollProgress`, which is fixed at z-60 — the hairline should
       cross the header, not slide beneath it. */
    <header className="sticky -top-[41px] z-50">
      {/* ── Tier 1 · utility strip ── */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-between gap-4 px-[clamp(14px,2.4vw,34px)]">
          <div className="flex min-w-0 items-center gap-3.5 overflow-hidden">
            <span className="hidden flex-none items-center gap-2 font-display text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase mid:flex">
              <Headphones size={14} strokeWidth={2.2} aria-hidden />
              {t("nav.support")}
            </span>

            <Divider className="hidden mid:block" />

            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="flex flex-none items-center gap-2 text-[13px] font-semibold text-body transition-colors hover:text-brand"
            >
              <Phone size={14} strokeWidth={2.2} aria-hidden />
              {phone}
            </a>

            <Divider className="hidden mid:block" />

            {/* One contact is enough on a phone; a 40px strip cannot hold two. */}
            <a
              href={`mailto:${email}`}
              className="hidden flex-none items-center gap-2 text-[13px] font-semibold text-body transition-colors hover:text-brand mid:flex"
            >
              <Mail size={14} strokeWidth={2.2} aria-hidden />
              {email}
            </a>
          </div>

          <div className="flex flex-none items-center gap-1">
            <ThemeToggle size={30} />
            <Divider />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* ── Tier 2 · main bar ── */}
      <div
        className={cn(
          "border-b border-border transition-shadow duration-300",
          /* Translucent + blurred, so content passing underneath is felt
             rather than hidden. Without backdrop-filter it is simply a
             90%-opaque bar, which is fine. */
          "bg-bg/90 backdrop-blur-xl",
          lifted && "shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)]",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-[clamp(12px,2vw,30px)] whitespace-nowrap px-[clamp(14px,2.4vw,34px)] wide:h-[72px]">
          <Link href="/" className="flex flex-none items-center hover:text-inherit">
            <Logo />
          </Link>

          <nav
            aria-label={t("nav.menu")}
            className={cn(
              "hidden min-w-0 items-center gap-[clamp(12px,1.5vw,24px)] font-nav",
              NAV_SHOW,
            )}
          >
            {SITE_LINKS.map(({ href, key, menu }) => {
              const active = pathname === href;

              if (menu) {
                return (
                  <ServicesMenu
                    key={href}
                    href={href}
                    label={t(key)}
                    active={active}
                    className={LINK}
                  />
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(LINK, "hover:text-brand", active ? "text-brand" : "text-heading")}
                >
                  {t(key)}
                  {active && (
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex flex-none items-center gap-[clamp(8px,1vw,14px)]">
            <button
              type="button"
              onClick={openCart}
              title={t("cart.title")}
              aria-label={t("cart.title")}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-heading transition-colors hover:bg-brand/[0.07] hover:text-brand"
            >
              <ShoppingCart size={20} strokeWidth={2.1} aria-hidden />
              {/* Only when there is something in it. The old badge rendered a
                  standing "0" on an empty cart, which reads as a notification
                  that is not one. */}
              {count > 0 && (
                <span className="absolute top-0.5 end-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-white">
                  {count}
                </span>
              )}
            </button>

            <Divider className={cn("mx-0.5 hidden h-6", NAV_SHOW)} />

            {/* Square, like every CTA on the site. Outlined, because vendor
                recruitment is the secondary path — "Book a service" is the one
                this page is actually for. */}
            <Link
              href={VENDOR_LINK.href}
              className={cn(
                "hidden h-11 items-center gap-2 border border-brand px-[clamp(12px,1.2vw,18px)] font-nav text-[14px] leading-none font-semibold text-brand transition-colors hover:bg-brand/[0.07] hover:text-brand",
                NAV_SHOW,
              )}
            >
              <Users size={16} strokeWidth={2.2} aria-hidden />
              {t(VENDOR_LINK.key)}
            </Link>

            <Link
              href={signIn.href}
              aria-current={pathname === signIn.href ? "page" : undefined}
              className={cn(
                "hidden items-center px-1 font-nav text-[14px] leading-none font-medium transition-colors hover:text-brand",
                pathname === signIn.href ? "text-brand" : "text-heading",
                NAV_SHOW,
              )}
            >
              {t(signIn.key)}
            </Link>

            <Link
              href="/services"
              className={cn(
                "hidden h-11 items-center gap-2.5 bg-primary px-[clamp(16px,1.6vw,24px)] font-nav text-[14px] leading-none font-semibold text-white transition-colors hover:bg-primary-dark hover:text-white",
                NAV_SHOW,
              )}
            >
              {t("nav.bookService")}
              <ArrowRight size={15} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            </Link>

            <button
              type="button"
              onClick={openMenu}
              title={t("nav.menu")}
              aria-label={t("nav.menu")}
              className={cn(
                "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-heading transition-colors hover:border-brand hover:text-brand",
                NAV_HIDE,
              )}
            >
              <Menu size={18} strokeWidth={2.4} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
