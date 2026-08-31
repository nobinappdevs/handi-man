"use client";

import Image, { type StaticImageData } from "next/image";
import { Play } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { CtaLink } from "@/components/share/CtaLink";
import { HeroBookingBand } from "@/components/homepage/HeroBookingBand";
import { HERO_STATS } from "@/components/homepage/homeData";
import heroWorker from "@public/assets/home/hero-worker.webp";

/** Set to a `next/image` import once a real hero photo exists — see below. */
const HERO_BG: StaticImageData | null = null;

/* The plum wedge. Below the design's 980px breakpoint it lies flat across the
   bottom; above it, it cuts diagonally down the right-hand side. */
const WEDGE =
  "pointer-events-none absolute inset-y-0 end-0 w-full [clip-path:polygon(0_62%,100%_47%,100%_100%,0_100%)] " +
  "wide:w-[52%] wide:[clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]";

export function Hero() {
  const { t } = useLang();

  return (
    <section className="relative bg-bg">
      {/*
        Backdrop + its scrim. The design asks for "a dark workshop photo" here
        but shipped with the canvas's blurred stock placeholder still in the
        slot, so `--hero-backdrop` stands in for it: a dark neutral tuned so the
        scrim lands on the same tonal ramp the photo would have produced. Drop a
        real .webp into public/assets/home/ and point HERO_BG at it to swap in.

        The backdrop must stay dark either way — the scrim fading 95% → 38% over
        it is what creates the wash behind the headline and what the white 14%
        seam below reads against.
      */}
      <div className="absolute inset-0 overflow-hidden bg-hero-backdrop">
        {HERO_BG && (
          <Image src={HERO_BG} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
      </div>
      {/* NOTE: rgba(var(--x), a) — the tokens are comma-separated triplets, so
          the `rgb(var(--x) / a)` form is invalid here and drops the gradient. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--scrim),0.95)_0%,rgba(var(--scrim),0.88)_38%,rgba(var(--scrim),0.6)_60%,rgba(var(--scrim),0.38)_100%)]" />

      <div className={`${WEDGE} bg-primary`} />
      <div className={`${WEDGE} bg-[linear-gradient(200deg,rgba(255,255,255,0.16),rgba(0,0,0,0.18))]`} />

      {/* Angled seam where the wedge meets the photo. */}
      <div className="pointer-events-none absolute inset-y-0 left-[calc(48%-30px)] hidden w-2 skew-x-[-13deg] bg-white/[0.14] wide:block" />
      <div className="pointer-events-none absolute inset-y-0 left-[calc(48%-54px)] hidden w-[3px] skew-x-[-13deg] bg-primary/75 wide:block" />

      {/* Line-work, clipped to the wedge. */}
      <div className={`${WEDGE} overflow-hidden`} aria-hidden>
        <div className="absolute -top-[14%] -right-[6%] h-[clamp(300px,34vw,520px)] w-[clamp(300px,34vw,520px)] rounded-full border border-white/[0.18]" />
        <div className="absolute -top-[4%] right-[2%] h-[clamp(210px,24vw,380px)] w-[clamp(210px,24vw,380px)] rounded-full border border-white/[0.12]" />
        <div className="absolute right-[6%] bottom-[12%] h-[clamp(120px,13vw,190px)] w-[clamp(120px,13vw,190px)] rotate-[22deg] rounded-3xl border border-white/[0.16]" />
        <div className="absolute bottom-[16%] left-[14%] h-[clamp(140px,16vw,230px)] w-[clamp(140px,16vw,230px)] opacity-50 bg-[radial-gradient(rgba(255,255,255,0.55)_1.4px,transparent_1.4px)] bg-[length:16px_16px]" />
        <div className="absolute inset-y-0 right-[22%] w-px skew-x-[-13deg] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.22)_45%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-y-0 right-[34%] w-px skew-x-[-13deg] bg-[linear-gradient(180deg,rgba(255,255,255,0)_10%,rgba(255,255,255,0.12)_60%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_8%,rgba(255,255,255,0.16),rgba(255,255,255,0)_62%)]" />
      </div>

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-[clamp(16px,2vw,24px)] px-[clamp(18px,3vw,44px)] mid:min-h-[520px] wide:min-h-[600px] wide:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-[clamp(14px,1.6vw,20px)] pt-[clamp(38px,5vw,64px)] pb-[clamp(40px,9vw,132px)]">
          <Eyebrow>{t("home.hero.eyebrow")}</Eyebrow>

          <h1 className="text-[clamp(34px,5.4vw,78px)] leading-[0.98] text-balance">
            {t("home.hero.titleLine1")}
            <br />
            <span className="text-brand">{t("home.hero.titleLine2")}</span>
          </h1>

          <p className="max-w-[440px] text-[clamp(14.5px,1.2vw,15.5px)] leading-[1.6] text-body">
            {t("home.hero.lead")}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-[clamp(14px,1.8vw,22px)]">
            <CtaLink href="/services">{t("home.hero.discover")}</CtaLink>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-[11px] p-0 text-heading"
            >
              <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full border-[1.5px] border-hero-line">
                <Play size={14} aria-hidden fill="currentColor" strokeWidth={0} />
              </span>
              <span className="font-display text-sm font-bold uppercase leading-none tracking-[0.12em] text-heading">
                {t("home.hero.howItWorks")}
              </span>
            </button>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-[clamp(14px,1.6vw,26px)] gap-y-3 border-t border-hero-line pt-5">
            {HERO_STATS.map((stat) => (
              <div key={stat.labelKey} className="flex items-baseline gap-2">
                <span className="text-[clamp(22px,2.2vw,26px)] font-black tracking-[-0.03em] text-brand">
                  {stat.value}
                </span>
                <span className="font-display text-[13px] font-bold uppercase leading-none tracking-[0.12em] text-body">
                  {t(stat.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex h-full min-w-0 items-end justify-center">
          <div className="relative mb-0 aspect-[330/366] w-full max-w-[330px] drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)] mid:mb-[-74px] wide:mb-[-92px] wide:max-w-[430px]">
            <Image
              src={heroWorker}
              alt={t("home.hero.workerAlt")}
              fill
              priority
              sizes="(max-width: 980px) 330px, 430px"
              className="object-contain object-bottom"
            />
          </div>

          <div className="absolute top-[clamp(12px,2vw,28px)] right-1 flex h-[clamp(92px,9vw,124px)] w-[clamp(92px,9vw,124px)] flex-col items-center justify-center rounded-full bg-invert shadow-[0_20px_46px_-18px_rgba(0,0,0,0.55),0_0_0_9px_rgba(255,255,255,0.18)] wide:-right-1.5">
            <span className="font-display text-[10.5px] font-bold uppercase leading-none tracking-[0.14em] text-invert-muted">
              {t("home.hero.verifiedLabel")}
            </span>
            <span className="text-[clamp(26px,2.8vw,34px)] font-black leading-none tracking-[-0.03em] text-invert-ink">
              {t("home.hero.verifiedCount")}
            </span>
          </div>
        </div>
      </div>

      <HeroBookingBand />
    </section>
  );
}
