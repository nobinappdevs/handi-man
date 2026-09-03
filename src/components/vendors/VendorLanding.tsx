"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LogIn, ShieldCheck, Wallet, CalendarClock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useIsAuthed } from "@/hooks/useIsAuthed";
import { Eyebrow } from "@/components/share/Eyebrow";
import { CtaLink } from "@/components/share/CtaLink";
import heroWorker from "@public/assets/home/hero-worker.webp";

const PERKS = [
  { key: "payouts", icon: Wallet },
  { key: "schedule", icon: CalendarClock },
  { key: "verified", icon: ShieldCheck },
];

/**
 * The public `/vendors` page — the pitch, and the way in.
 *
 * The CTA is the whole point of the screen and it has two states: a signed-in
 * vendor goes straight to their dashboard, everyone else goes to sign in. See
 * `useIsAuthed` for why the logged-out branch is the one that gets prerendered.
 *
 * Nothing here is a GSAP reveal. This is the top of the page — above the fold
 * on every viewport — so it uses the CSS `enter-*` classes, which start at
 * first paint instead of waiting for hydration (blueprint §6.5). The figure and
 * the headline are the LCP candidates and both move on transform only.
 */
export function VendorLanding() {
  const { t } = useLang();
  const authed = useIsAuthed();

  return (
    <>
      <section className="bg-page relative overflow-hidden px-[clamp(18px,3vw,44px)] py-[clamp(40px,6vw,96px)]">
        {/* The design's diagonal watermark. A repeating gradient rather than an
            image: it is two flat tones at a few percent, so a file would be
            bytes spent on something CSS states exactly. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(var(--heading),0.035)_0px,rgba(var(--heading),0.035)_2px,transparent_2px,transparent_26px)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/4 -right-[12%] h-[70%] w-[46%] rotate-12 bg-[linear-gradient(200deg,color-mix(in_oklab,rgb(var(--wash-ink))_12%,transparent),transparent_70%)]"
        />

        <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-[clamp(28px,5vw,72px)] wide:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* ── figure ── */}
          <div className="enter-rise relative mx-auto w-full max-w-[460px] [--enter-y:28px]">
            <span
              aria-hidden
              className="absolute inset-x-[6%] bottom-[4%] top-[10%] rounded-full bg-brand/10"
            />
            <Image
              src={heroWorker}
              alt=""
              aria-hidden
              priority
              sizes="(max-width: 980px) 84vw, 420px"
              className="relative h-auto w-full object-contain"
            />
          </div>

          {/* ── copy ── */}
          <div className="flex min-w-0 flex-col gap-[clamp(14px,1.8vw,22px)]">
            <Eyebrow className="enter-fade [--enter-delay:0.06s]">
              {t("vendorsPage.eyebrow")}
            </Eyebrow>

            <h1 className="enter-rise text-balance [--enter-delay:0.1s]">
              {t("vendorsPage.title")}
            </h1>

            <p className="enter-up max-w-[62ch] [--enter-delay:0.18s]">{t("vendorsPage.lead")}</p>

            <div className="enter-up mt-1 flex flex-wrap gap-3 [--enter-delay:0.26s]">
              {authed ? (
                <CtaLink href="/vendors/dashboard">
                  <LayoutDashboard size={17} strokeWidth={2.2} aria-hidden />
                  {t("vendorsPage.dashboard")}
                </CtaLink>
              ) : (
                <>
                  <CtaLink href="/vendors/login">
                    <LogIn size={17} strokeWidth={2.2} aria-hidden />
                    {t("vendorsPage.login")}
                  </CtaLink>
                  {/* Not a `CtaLink`. That component IS the primary CTA and
                      hardcodes `bg-primary text-white`; `cn` does not merge, so
                      an override here loses to it on CSS order and the label
                      goes white-on-white. Secondary CTAs use the outline
                      treatment from the dashboard instead. */}
                  <Link
                    href="/vendors/register"
                    className="inline-flex items-center gap-[9px] border border-border px-[30px] py-4 font-display text-[15px] leading-none font-bold tracking-[0.13em] text-heading uppercase transition-colors hover:border-primary hover:text-brand"
                  >
                    {t("vendorsPage.register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── why sell here ── not in the reference, which is hero-only; a page
          that stops at one screen above a footer reads as unfinished. Three
          lines, no new vocabulary. Easy to drop if it is not wanted. */}
      <section className="bg-page border-t border-border px-[clamp(18px,3vw,44px)] py-[clamp(32px,4vw,60px)]">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-[clamp(20px,2.4vw,34px)] mid:grid-cols-3">
          {PERKS.map(({ key, icon: Icon }) => (
            <div key={key} className="flex min-w-0 items-start gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center bg-brand/14 text-brand">
                <Icon size={21} strokeWidth={1.9} aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[16px] font-extrabold tracking-[-0.02em] text-heading">
                  {t(`vendorsPage.perks.${key}.title`)}
                </span>
                <span className="text-[13.5px] leading-[1.55] font-normal text-body">
                  {t(`vendorsPage.perks.${key}.body`)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
