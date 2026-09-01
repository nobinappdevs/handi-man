"use client";

import Image from "next/image";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { IMPACT_FEATURE_KEYS, IMPACT_STAT_KEYS } from "@/components/homepage/homeData";
import impactPhoto from "@public/assets/home/aboutus-photo.webp";

/**
 * "Empowering businesses…" — the design's second about-style section: a
 * plum-tinted gradient wash, a numbered feature list, and the company's
 * headline stats. Distinct from `About.tsx` ("Who we are" — the
 * checklist/CTA section further down), which the design also calls
 * "About us" but is a different block entirely.
 */
export function Impact() {
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(152deg,color-mix(in_oklab,rgb(var(--primary__color))_12%,rgb(var(--bg)))_0%,rgb(var(--bg))_46%,color-mix(in_oklab,rgb(var(--primary__color))_8%,rgb(var(--bg)))_72%,color-mix(in_oklab,rgb(var(--primary__color))_20%,rgb(var(--bg)))_100%)] px-[clamp(18px,3vw,44px)] py-[clamp(48px,6vw,96px)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[24%] -left-[10%] h-[80%] w-[46%] rounded-full bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklab,rgb(var(--primary__color))_26%,transparent),transparent_68%)]" />
        <div className="absolute -right-[14%] -bottom-[32%] h-[92%] w-[52%] rounded-full bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklab,rgb(var(--primary__color))_22%,transparent),transparent_66%)]" />
        <div className="absolute top-[12%] left-[6%] h-[clamp(90px,10vw,140px)] w-[clamp(90px,10vw,140px)] opacity-30 bg-[radial-gradient(rgb(var(--primary__color))_1.3px,transparent_1.3px)] bg-[length:16px_16px]" />
        <div className="absolute bottom-[6%] left-[44%] h-[clamp(120px,13vw,190px)] w-[clamp(120px,13vw,190px)] rotate-[18deg] rounded-[26px] border border-border" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-[12%] -right-[70px] h-[clamp(220px,24vw,360px)] w-[clamp(220px,24vw,360px)] rounded-full border border-border"
      />

      <div className="relative mx-auto flex max-w-[1240px] flex-col gap-[clamp(40px,4.6vw,68px)]">
        <div className="grid grid-cols-1 items-center gap-[clamp(32px,4.4vw,72px)] wide:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <div className="flex min-w-0 flex-col gap-[clamp(16px,1.8vw,22px)]">
            <Eyebrow icon={<span className="h-0.5 w-9 bg-primary" />}>
              {t("home.impact.eyebrow")}
            </Eyebrow>

            <h2 className="text-[clamp(32px,4vw,58px)] leading-[0.98] tracking-[-0.038em] text-balance">
              {t("home.impact.title")}
            </h2>

            <p className="max-w-[540px] text-[clamp(15px,1.3vw,17px)] leading-[1.7] text-body text-pretty">
              {t("home.impact.lead")}
            </p>

            <div className="mt-[clamp(8px,1.2vw,16px)] grid grid-cols-1 gap-x-[clamp(20px,2.4vw,40px)] mid:grid-cols-2">
              {IMPACT_FEATURE_KEYS.map((key, i) => (
                <div
                  key={key}
                  className="group flex items-baseline gap-3 border-t border-border py-3.5 pr-1.5 transition-[padding-left] duration-200 hover:pl-2"
                >
                  <span className="flex-none font-display text-xs font-bold tracking-[0.14em] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 text-[clamp(14.5px,1.25vw,16px)] leading-[1.3] font-bold tracking-[-0.015em] text-heading transition-colors group-hover:text-brand">
                    {t(`home.impact.features.${key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-w-0">
            <div aria-hidden className="absolute -top-4.5 -right-4.5 h-[52%] w-[58%] bg-primary opacity-[0.16]" />
            <div
              aria-hidden
              className="absolute -bottom-5.5 -left-5.5 h-[clamp(110px,12vw,160px)] w-[clamp(110px,12vw,160px)] opacity-45 bg-[radial-gradient(rgb(var(--primary__color))_1.4px,transparent_1.4px)] bg-[length:15px_15px]"
            />
            <div className="relative z-[2] aspect-[1.4] wide:aspect-[0.92]">
              <Image
                src={impactPhoto}
                alt={t("home.impact.photoAlt")}
                fill
                sizes="(max-width: 980px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-6.5 left-3.5 z-[3] flex items-center gap-3 bg-primary px-5 py-4 text-white shadow-[0_26px_50px_-26px_rgba(0,0,0,0.5)]">
              <span className="text-[clamp(26px,2.6vw,34px)] leading-none font-black tracking-[-0.03em]">
                {t("home.impact.ratingValue")}
              </span>
              <span className="max-w-[96px] font-display text-xs leading-[1.25] font-bold tracking-[0.13em] uppercase">
                {t("home.impact.ratingLabel")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[clamp(20px,2.4vw,36px)] mid:grid-cols-3">
          {IMPACT_STAT_KEYS.map((key) => (
            <div
              key={key}
              className="flex min-w-0 flex-col gap-2.5 border-t-[3px] border-primary pt-[clamp(18px,2vw,26px)]"
            >
              <span className="text-[clamp(40px,5vw,72px)] leading-[0.9] font-black tracking-[-0.05em] text-heading">
                {t(`home.impact.stats.${key}.num`)}
              </span>
              <span className="font-display text-[clamp(13px,1.2vw,15px)] font-bold tracking-[0.14em] text-body uppercase">
                {t(`home.impact.stats.${key}.label`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
