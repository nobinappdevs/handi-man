"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

/* One nav link. The plum rule that marks the active page is NOT drawn per
   link — a single bar slides between them (see `marker` below), which is the
   behaviour the demo project's header uses. A `border-b-2` per link would also
   make the active one 2px taller than its neighbours and nudge the row. */
const LINK = "relative py-2 text-[14.5px] leading-none font-medium transition-colors";

/**
 * Which nav item owns the current URL.
 *
 * Exact match for the home page, prefix match for the rest — otherwise
 * `/blog/some-post` would light up nothing at all. Taken from the demo's
 * `getActiveKey`.
 */
function activeHrefFor(pathname: string, hrefs: string[]) {
  if (pathname === "/") return "/";
  return hrefs.find((h) => h !== "/" && (pathname === h || pathname.startsWith(`${h}/`))) ?? "";
}

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
 *    `-top-[42px]` — a negative offset of exactly what sits above it: the
 *    gradient hairline, the strip's `h-10`, and the strip's border. Everything
 *    above the bar therefore scrolls up out of view and the bar comes to rest
 *    at y=0, so what follows you down the page is one 72px bar rather than
 *    114px of chrome. This is also why the header is one sticky box and
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
  const { t, lang } = useLang();
  const pathname = usePathname();
  const { openCart, openMenu, count } = useShell();

  /* ── Scroll state ──
     Two separate things come off one listener:

       `scrolled`  once anything is under the header it stops being a faint
                   overlay and becomes an opaque, bordered bar.
       `hidden`    scrolling DOWN slides the whole header up out of the way,
                   scrolling UP brings it back. Reading beats chrome; changing
                   your mind about where you are going beats reading.

     `REVEAL_AT` keeps the header put through the first screenful — hiding it
     over the hero, where it has not even been in the way yet, just flickers.
     `DEADZONE` ignores the sub-pixel jitter a trackpad and momentum scrolling
     produce, which would otherwise flip the direction several times a second.

     The listener is passive and reads `scrollY` only — no geometry, so it
     never forces a reflow — and it is throttled to one rAF, so a fast wheel
     cannot queue up more work than a frame can spend. */
  const REVEAL_AT = 160;
  const DEADZONE = 6;

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const read = () => {
      ticking.current = false;
      const y = Math.max(0, window.scrollY);
      setScrolled(y > 8);

      const delta = y - lastY.current;
      if (Math.abs(delta) < DEADZONE) return;
      lastY.current = y;
      setHidden(y > REVEAL_AT && delta > 0);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Anything that pins itself below the header has to move with it, or it
     hangs in mid-air over a header that is no longer there. One attribute on
     <html> lets `globals.css` swap `--header-offset` to 0, and the services
     rail and the two request-form summaries follow for free. */
  useEffect(() => {
    const root = document.documentElement;
    if (hidden) root.setAttribute("data-nav-hidden", "true");
    else root.removeAttribute("data-nav-hidden");
    return () => root.removeAttribute("data-nav-hidden");
  }, [hidden]);

  /* ── Sliding marker ──
     One plum rule for the whole nav, animated between items rather than drawn
     under each — the demo's sliding pill, in this header's underline idiom. It
     follows the pointer and returns to the current page on mouse-leave.

     Items are found by `data-nav-item` rather than a ref map because one of
     them is not a link at all (the Services dropdown is a wrapper round a
     button); a query treats both the same. `offsetLeft` is relative to the
     nearest positioned ancestor, which is why the <nav> is `relative`. */
  const navRef = useRef<HTMLElement>(null);
  const [marker, setMarker] = useState({ left: 0, width: 0, ready: false });

  const moveMarker = useCallback((href: string) => {
    const el = navRef.current?.querySelector<HTMLElement>(`[data-nav-item="${href}"]`);
    if (el) setMarker({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    else setMarker((m) => ({ ...m, ready: false }));
  }, []);

  const phone = t("footer.contacts.phone");
  const email = t("footer.contacts.email");
  const signIn = ACCOUNT_LINKS[ACCOUNT_LINKS.length - 1];
  const activeHref = activeHrefFor(
    pathname,
    SITE_LINKS.map((l) => l.href),
  );

  /* `lang` is a dependency because a translated label is a different width —
     the marker has to be re-measured, not just re-rendered. */
  useEffect(() => {
    moveMarker(activeHref);
    const onResize = () => moveMarker(activeHref);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeHref, lang, moveMarker]);

  return (
    /* -42px is everything above the main bar, negated: the 1px gradient
       hairline + the strip's `h-10` + the 1px `border-b` under it. Keep them
       in step — that equality is what lands the bar exactly at y=0 when
       pinned; a pixel short and a sliver of the strip stays on screen.
       Under `ScrollProgress`, which is fixed at z-60 — that hairline should
       cross the header, not slide beneath it. */
    <header
      /* Tabbing must not send focus into a header that is off-screen, so any
         focus landing inside brings it back first. */
      onFocusCapture={() => setHidden(false)}
      className={cn(
        "sticky -top-[42px] z-50 transition-transform duration-500 ease-out motion-reduce:transition-none",
        /* `-translate-y-full` overshoots — the bar only needs to clear its own
           height — but it is immune to the header's height changing, and the
           extra travel is off-screen where nobody sees it. */
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      {/* The demo's plum hairline across the very top — it fades out at both
          ends, so it reads as a highlight on the chrome rather than a rule
          boxing it in. `brand`, so it survives the dark theme. */}
      <div
        aria-hidden
        className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(var(--brand-ink),0.55),transparent)]"
      />

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

      {/* ── Tier 2 · main bar ──
          The scroll transition, lifted from the demo's header: at rest it is
          a light, lightly blurred bar with no border; once anything is
          scrolled under it, it settles into an opaque, bordered, heavily
          blurred one. Both states are translucent, so content passing beneath
          is felt rather than hidden. */}
      <div
        className={cn(
          "border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
          scrolled
            ? "border-border bg-bg/90 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-transparent bg-bg/60 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-[clamp(12px,2vw,30px)] whitespace-nowrap px-[clamp(14px,2.4vw,34px)] wide:h-[72px]">
          <Link href="/" className="flex flex-none items-center hover:text-inherit">
            <Logo />
          </Link>

          <nav
            ref={navRef}
            aria-label={t("nav.menu")}
            onMouseLeave={() => moveMarker(activeHref)}
            className={cn(
              "relative hidden min-w-0 items-center gap-[clamp(12px,1.5vw,24px)] font-nav",
              NAV_SHOW,
            )}
          >
            {/* The one rule for the whole nav. `left`/`width` are inline
                because they are measured, not authored; everything else that
                can live in a class does. */}
            <span
              aria-hidden
              className="absolute bottom-0 h-0.5 bg-brand transition-all duration-300 ease-out"
              style={{ left: marker.left, width: marker.width, opacity: marker.ready ? 1 : 0 }}
            />

            {SITE_LINKS.map(({ href, key, menu }) => {
              const active = activeHref === href;

              if (menu) {
                return (
                  <ServicesMenu
                    key={href}
                    href={href}
                    label={t(key)}
                    active={active}
                    className={LINK}
                    onHover={() => moveMarker(href)}
                  />
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  data-nav-item={href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => moveMarker(href)}
                  className={cn(LINK, "hover:text-brand", active ? "text-brand" : "text-heading")}
                >
                  {t(key)}
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
