"use client";

import Image from "next/image";
import { Check, Phone } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { Eyebrow } from "@/components/share/Eyebrow";
import { CtaLink } from "@/components/share/CtaLink";
import { ABOUT_CHECK_KEYS } from "@/components/homepage/homeData";
import aboutOne from "@public/assets/home/about-1.webp";
import aboutTwo from "@public/assets/home/about-2.webp";
import aboutTool from "@public/assets/home/about-tool.webp";

export function About() {
  const { t } = useLang();
  const scope = useGsapScope();

  return (
    <section
      ref={scope}
      className="bg-page relative overflow-hidden px-[clamp(18px,3vw,44px)] pt-[clamp(20px,3vw,40px)] pb-[clamp(48px,6vw,96px)]"
    >
      <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-[clamp(32px,5vw,72px)] wide:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
        {/*
          ── Photo cluster ──
          The 64% cap is the design's tablet framing: it stops the cluster
          sprawling once the column goes full width. Below 700px that same cap
          starves the photos — about 90px each on a 390px screen — so mobile
          runs uncapped with a tighter inset instead.
        */}
        <div className="relative min-w-0 max-w-none ps-[clamp(20px,5vw,64px)] pt-[clamp(30px,4vw,54px)] pb-[clamp(56px,6vw,74px)] mid:max-w-[min(480px,64%)] wide:max-w-none">
          {/* Organic plum blobs behind the photos. */}
          <div
            aria-hidden
            className="absolute top-0 left-0 h-[clamp(190px,24vw,290px)] w-[clamp(190px,24vw,290px)] -rotate-12 bg-primary opacity-[0.92] [border-radius:62%_38%_46%_54%/55%_48%_52%_45%]"
            style={{ animation: "about-blob-float 4s ease-in-out infinite" }}
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-1.5 h-[clamp(90px,11vw,140px)] w-[clamp(90px,11vw,140px)] bg-primary opacity-[0.18] [border-radius:45%_55%_62%_38%/52%_42%_58%_48%]"
          />

          <div
            className="relative flex items-end gap-[clamp(12px,1.6vw,20px)]"
            data-anim-parallax="-44"
          >
            <div
              className="relative h-[260px] min-w-0 flex-1 shadow-[0_30px_60px_-34px_rgba(0,0,0,0.5)] wide:h-80"
              data-anim="clip"
            >
              <Image
                src={aboutOne}
                alt={t("home.about.photoOneAlt")}
                fill
                sizes="(max-width: 980px) 45vw, 280px"
                className="object-cover"
              />
            </div>
            <div
              className="relative h-[310px] min-w-0 flex-1 shadow-[0_30px_60px_-34px_rgba(0,0,0,0.5)] wide:h-[400px]"
              data-anim="clip"
              data-anim-delay="0.14"
            >
              <Image
                src={aboutTwo}
                alt={t("home.about.photoTwoAlt")}
                fill
                sizes="(max-width: 980px) 45vw, 280px"
                className="object-cover"
              />
            </div>
          </div>

          <div
            className="absolute bottom-[clamp(6px,2vw,18px)] left-0 flex items-center gap-3 bg-primary px-5 py-3.5 text-white shadow-[0_22px_44px_-22px_rgba(0,0,0,0.5)]"
            style={{ animation: "about-badge-float 3.5s ease-in-out infinite" }}
            /* Opacity only. `about-badge-float` is a CSS keyframe animation on
               transform, and a running animation outranks the inline transform
               GSAP would write - so a moving reveal here would simply not show. */
            data-anim="fade"
            data-anim-delay="0.3"
          >
            <span className="text-[clamp(30px,3.4vw,40px)] font-black leading-none tracking-[-0.03em]">
              {t("home.about.badgeValue")}
            </span>

            <span className="max-w-[92px] font-display text-[12.5px] font-bold uppercase leading-[1.25] tracking-[0.12em]">
              {t("home.about.badgeLabel")}
            </span>
          </div>
        </div>

        {/* ── Copy ── */}
        <div className="flex min-w-0 flex-col gap-[clamp(14px,1.6vw,20px)]">
          <Eyebrow data-anim="up">{t("home.about.eyebrow")}</Eyebrow>

          <h2 className="text-[clamp(30px,3.6vw,50px)] leading-[1.04] text-balance" data-anim-split>
            {t("home.about.title")}
          </h2>

          <p
            className="max-w-[520px] text-[clamp(14.5px,1.2vw,16px)] leading-[1.65] text-body"
            data-anim="up"
            data-anim-delay="0.12"
          >
            {t("home.about.lead")}
          </p>

          <div
            className="mt-1.5 grid grid-cols-1 gap-x-[clamp(16px,2vw,28px)] gap-y-3 mid:grid-cols-2"
            data-anim-stagger="left"
            data-anim-gap="0.07"
          >
            {ABOUT_CHECK_KEYS.map((key) => (
              <div key={key} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary text-white">
                  <Check size={11} strokeWidth={3.4} aria-hidden />
                </span>
                <span className="text-[14.5px] font-semibold leading-[1.35] text-heading">
                  {t(`home.about.checks.${key}`)}
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-[clamp(12px,2vw,20px)] flex flex-wrap items-center gap-[clamp(16px,2.4vw,30px)] border-t border-border pt-[clamp(18px,2.4vw,26px)]"
            data-anim-stagger="up"
            data-anim-gap="0.11"
          >
            <CtaLink href="/about">{t("home.about.discover")}</CtaLink>

            <div className="flex items-center gap-3">
              <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-primary text-white">
                <Phone size={19} strokeWidth={2.2} aria-hidden />
              </span>
              <div>
                <span className="font-display text-xs font-bold uppercase leading-none tracking-[0.14em] text-muted">
                  {t("home.about.callLabel")}
                </span>
                <span className="text-[clamp(17px,1.6vw,20px)] font-extrabold tracking-[-0.02em] text-heading">
                  {t("home.about.callNumber")}
                </span>
              </div>
            </div>

            <div
              data-anim-skip
              className="absolute -right-60 -bottom-6 hidden h-[clamp(120px,13vw,172px)] w-[clamp(170px,19vw,250px)] opacity-60 mid:block"
              style={{ animation: "about-tool-float 4s ease-in-out infinite" }}
            >
              <Image
                src={aboutTool}
                alt=""
                aria-hidden
                className="h-full w-full object-contain dark:brightness-0 dark:invert"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
