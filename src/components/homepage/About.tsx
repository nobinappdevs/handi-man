"use client";

import type { ComponentProps } from "react";
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

/**
 * The painted block behind the photo cluster — the reference's brushed shape,
 * in place of the two smooth blobs this section used to carry (they read as
 * stray circles once the photos moved off them).
 *
 * Straight segments with a small alternating offset, NOT bezier curves. The
 * first pass at this drew the outline with `C` commands and the result was an
 * amoeba: every notch rounded itself away and the shape lost the torn edge
 * that makes it read as paint. A polyline keeps the edge, and it survives
 * `preserveAspectRatio="none"` — which is here on purpose, because the shape
 * is sized off its container and has to stretch to whatever box it is given.
 *
 * `currentColor`, so the fill is the plum token and nothing hard-codes a hex.
 *
 * `d` stays on ONE line, however long. Wrapped across three lines it put the
 * file's own newlines inside the attribute, and this file is CRLF: the server
 * rendered `\r\n` where the client read back `\n`, which React reported as a
 * hydration mismatch on every page carrying this section. Path data has no
 * business holding line breaks either way.
 */
function AboutBrush(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 300 380" preserveAspectRatio="none" fill="currentColor" aria-hidden {...props}>
      {/* prettier-ignore */}
      <path d="M10 20 42 8 74 18 110 6 148 16 186 4 222 14 258 6 288 18 276 60 292 104 278 150 294 196 280 242 294 290 282 334 290 364 252 374 214 362 176 376 138 364 100 378 62 366 24 376 8 362 20 318 6 272 18 226 4 180 16 134 2 88 14 52Z" />
    </svg>
  );
}

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
          Rebuilt to the reference composition: one painted stroke behind two
          rounded, CENTRE-aligned photos of unequal height, with the experience
          badge hung off the shorter photo's bottom-left corner.

          Three things changed from the version this replaces, and each of them
          was a reason it read badly:

            • the photos were bottom-aligned, which lined their bottom edges up
              and made the height difference look like a mistake instead of a
              stagger. Centring them is what the reference does.
            • the badge was positioned against the COLUMN, so its overlap
              drifted with every height change and the section needed 74px of
              bottom padding to hold it. It now lives inside the left photo's
              own wrapper, so the overlap is fixed by construction.
            • the two smooth blobs were sized independently of the cluster, so
              the big one showed as a bare circle and the small one as a stray
              dot under the badge.

          The 64% cap is the design's tablet framing: it stops the cluster
          sprawling once the column goes full width. Below 700px that same cap
          starves the photos — about 90px each on a 390px screen — so mobile
          runs uncapped with a tighter inset instead.
        */}
        <div className="relative min-w-0 max-w-none ps-[clamp(20px,5vw,64px)] pt-[clamp(24px,3.4vw,46px)] pb-[clamp(34px,4vw,54px)] mid:max-w-[min(480px,64%)] wide:max-w-none">
          {/* Positioned against the COLUMN, not against the photo, so it stays
              still while the cluster parallaxes over it — that drift is the
              only depth cue this block has.

              The numbers are what keep the two registered: the column's own
              `ps` is clamp(20px,5vw,64px), so a start of clamp(12px,2.4vw,34px)
              lands the paint ~25-30px to the left of the shorter photo at every
              width, and 46%/68% carry it about the same distance past the other
              three sides. Sized to THAT photo, the way the reference is: a brush
              stretched behind both photos stops reading as a backing shape and
              starts reading as a plum panel. Change the column's padding and
              these four numbers have to be re-checked. */}
          <AboutBrush
            className="pointer-events-none absolute start-[clamp(12px,2.4vw,34px)] top-[12%] h-[68%] w-[46%] text-primary"
            style={{ animation: "about-blob-float 4s ease-in-out infinite" }}
          />

          <div
            className="relative flex items-center gap-[clamp(12px,1.6vw,20px)]"
            data-anim-parallax="-44"
          >
            {/* This wrapper is deliberately NOT clipped: the rounding lives on
                the inner frame so the badge can hang outside the photo. */}
            <div className="relative min-w-0 flex-1">
              <div
                className="relative h-[230px] overflow-hidden rounded-2xl shadow-[0_30px_60px_-34px_rgba(0,0,0,0.5)] wide:h-[290px]"
                data-anim="clip"
              >
                <Image
                  src={aboutOne}
                  alt={t("home.about.photoOneAlt")}
                  fill
                  sizes="(max-width: 699px) 45vw, (max-width: 979px) 210px, 240px"
                  className="object-cover"
                />
              </div>

              <div
                className="absolute -bottom-[clamp(14px,2vw,26px)] -start-[clamp(8px,1.2vw,16px)] flex flex-col gap-1.5 rounded-xl bg-primary px-[clamp(15px,1.8vw,21px)] py-[clamp(11px,1.5vw,16px)] text-white shadow-[0_22px_44px_-22px_rgba(0,0,0,0.5)]"
                style={{ animation: "about-badge-float 3.5s ease-in-out infinite" }}
                /* Opacity only. `about-badge-float` is a CSS keyframe animation
                   on transform, and a running animation outranks the inline
                   transform GSAP would write - so a moving reveal here would
                   simply not show. */
                data-anim="fade"
                data-anim-delay="0.3"
              >
                <span className="text-[clamp(26px,2.9vw,34px)] font-black leading-none tracking-[-0.03em]">
                  {t("home.about.badgeValue")}
                </span>

                {/* 176px, because the label has to fall on TWO lines. At 124 and 152 it
                    took three and the badge grew tall enough to cover a third
                    of the photo — the reference's badge is a corner chip, not a
                    panel. Widen this if a translation runs longer than the
                    English label. */}
                <span className="max-w-[176px] font-display text-[12px] font-bold uppercase leading-[1.3] tracking-[0.12em]">
                  {t("home.about.badgeLabel")}
                </span>
              </div>
            </div>

            <div
              className="relative h-[300px] min-w-0 flex-1 overflow-hidden rounded-2xl shadow-[0_30px_60px_-34px_rgba(0,0,0,0.5)] wide:h-[380px]"
              data-anim="clip"
              data-anim-delay="0.14"
            >
              <Image
                src={aboutTwo}
                alt={t("home.about.photoTwoAlt")}
                fill
                sizes="(max-width: 699px) 45vw, (max-width: 979px) 210px, 240px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* ── Copy ── */}
        <div className="flex min-w-0 flex-col gap-[clamp(14px,1.6vw,20px)]">
          <Eyebrow data-anim="up">{t("home.about.eyebrow")}</Eyebrow>

          {/*
            `leading-[1.04]` plus the base `h2` tracking of -0.03em are the
            design's numbers for a ONE-line heading. This one wraps to three
            lines at every desktop width, and there the two settings collide: at
            50px the line box is 52px against roughly 60px of Barlow Condensed
            ascender + descender, so "goal" sat on "platform", and -0.03em
            pulled the word space shut until "Our goal" read as one word. Local
            override, not a change to the base `h2` — the short headings
            elsewhere still want the tight setting.
          */}
          <h2
            className="text-[clamp(30px,3.6vw,50px)] leading-[1.14] tracking-[-0.018em] text-balance"
            data-anim-split
          >
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
              className="absolute -end-60 -bottom-6 hidden h-[clamp(120px,13vw,172px)] w-[clamp(170px,19vw,250px)] opacity-60 mid:block"
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
