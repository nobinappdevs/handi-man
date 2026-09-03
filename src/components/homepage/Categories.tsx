"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { Eyebrow } from "@/components/share/Eyebrow";
import { CircleIconButton } from "@/components/share/CircleIconButton";
import { CATEGORIES } from "@/components/homepage/homeData";
import { cn } from "@/components/ui/cn";

import "swiper/css";

/** Rest between two automatic steps. */
const AUTOPLAY_MS = 2400;
/** Duration of one step — autoplay, drag-release snap and arrows all use it. */
const SPEED_MS = 700;

/* Three copies, so the rail always out-measures the widest viewport and keeps a
   buffer of off-screen slides on both sides — Swiper cannot loop without one. */
const SLIDES = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

/**
 * Endlessly looping category rail.
 *
 * Deliberately a stepped loop rather than a delay-0 marquee: Swiper's
 * continuous mode needs `freeMode`, and `freeMode` never calls `loopFix`
 * without `centeredSlides`, so a backwards drag runs off the start of the rail
 * and snaps back instead of wrapping. Stepping keeps `loop` in charge, which is
 * what makes both directions endless — arrows, drag and autoplay alike.
 */
export function Categories() {
  const { t } = useLang();
  const scope = useGsapScope();
  const swiperRef = useRef<SwiperClass | null>(null);

  /** One slide per click, at the same pace as the autoplay — arrows should read
   *  as a nudge, not a jump. Autoplay picks up again on its own afterwards. */
  const nudge = (dir: 1 | -1) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (dir === 1) swiper.slideNext();
    else swiper.slidePrev();
  };

  return (
    <section
      ref={scope}
      className="bg-page relative pt-[clamp(48px,6vw,96px)] pb-[clamp(34px,4vw,58px)] mid:pt-[150px] wide:pt-[180px]"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-5 px-[clamp(18px,3vw,44px)]">
        <div className="flex min-w-0 flex-col gap-2">
          <Eyebrow data-anim="up">{t("home.categories.eyebrow")}</Eyebrow>
          <h2 className="text-[clamp(24px,2.6vw,36px)] leading-[1.06]" data-anim-split>
            {t("home.categories.title")}
          </h2>
        </div>

        <div className="flex flex-none items-center gap-2.5" data-anim-stagger="zoom" data-anim-gap="0.1">
          <CircleIconButton onClick={() => nudge(-1)} aria-label={t("common.previous")}>
            <ArrowLeft size={17} strokeWidth={2.4} aria-hidden />
          </CircleIconButton>
          <CircleIconButton onClick={() => nudge(1)} aria-label={t("common.next")}>
            <ArrowRight size={17} strokeWidth={2.4} aria-hidden />
          </CircleIconButton>
        </div>
      </div>

      {/*
        The reveal wraps the rail rather than tagging the slides. Swiper owns
        the transform on its own wrapper and clones slides in order to loop, so
        a per-slide tween would either be overwritten mid-step or leave a clone
        stuck at `opacity: 0` the first time the rail wraps around.
      */}
      {/* Same `max-w-[1240px]` + page padding as the heading above, so the rail
          starts and ends on the section's own edges instead of running to the
          viewport. Swiper clips at its padding box, so the padding has to live
          out here on the wrapper — left on the Swiper itself the slides render
          straight through it and the rail reads as full-bleed. */}
      <div
        data-anim="up"
        data-anim-start="top 90%"
        className="mx-auto max-w-[1440px] px-[clamp(18px,3vw,44px)]"
      >
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Autoplay]}
          slidesPerView="auto"
          spaceBetween={12}
          breakpoints={{
            768: { spaceBetween: 15 },
            1280: { spaceBetween: 18 },
          }}
          loop
          loopAdditionalSlides={4}
          speed={SPEED_MS}
          grabCursor
          autoplay={{ delay: AUTOPLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true }}
          className="mt-[clamp(20px,2.4vw,30px)] pt-1.5 pb-[18px]"
        >
          {SLIDES.map((category, i) => (
            <SwiperSlide key={`${category.key}-${i}`} className="h-auto! w-[clamp(150px,15vw,186px)]!">
              <button
                type="button"
                className={cn(
                  "group flex h-full w-full cursor-[inherit] flex-col items-start gap-3.5 border border-border bg-surface p-[18px] py-[22px] text-left text-heading",
                  "transition-[transform,background-color,border-color] duration-[180ms] ease-out hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white",
                )}
              >
                <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-primary/20 text-brand transition-colors duration-[180ms] ease-out group-hover:bg-white/20 group-hover:text-white">
                  {category.icon}
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-base font-extrabold leading-[1.2] tracking-[-0.02em]">
                    {t(`home.categories.items.${category.key}`)}
                  </span>
                  <span className="font-display text-xs font-bold uppercase leading-none tracking-[0.12em] text-muted transition-colors duration-[180ms] ease-out group-hover:text-white/75">
                    {category.pros === null
                      ? t("home.categories.allDay")
                      : `${category.pros} ${t("home.categories.pros")}`}
                  </span>
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
