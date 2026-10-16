"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { Eyebrow } from "@/components/share/Eyebrow";
import { CircleIconButton } from "@/components/share/CircleIconButton";
import { useHomeContent, type HomeCategory } from "@/hooks/useHomeContent";
import { cn } from "@/components/ui/cn";

import "swiper/css";

/** Rest between two automatic steps. */
const AUTOPLAY_MS = 2400;
/** Duration of one step — autoplay, drag-release snap and arrows all use it. */
const SPEED_MS = 700;

/* Enough copies that the rail always out-measures the widest viewport and keeps
   a buffer of off-screen slides on both sides — Swiper cannot loop without one.
   A short category list needs more copies than a long one. */
const MIN_SLIDES = 24;
const repeatToFill = <T,>(items: T[]) =>
  items.length === 0 ? [] : Array.from({ length: Math.max(3, Math.ceil(MIN_SLIDES / items.length)) }, () => items).flat();

/** The admin's category image, or a neutral glyph when there is none or it fails. */
function CategoryIcon({ category }: { category: HomeCategory }) {
  const [broken, setBroken] = useState(false);
  if (!category.image || broken) return <LayoutGrid size={20} strokeWidth={1.8} aria-hidden />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
    <img
      src={category.image}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="h-6 w-6 object-contain"
    />
  );
}

/**
 * Endlessly looping category rail.
 *
 * Deliberately a stepped loop rather than a delay-0 marquee: Swiper's
 * continuous mode needs `freeMode`, and `freeMode` never calls `loopFix`
 * without `centeredSlides`, so a backwards drag runs off the start of the rail
 * and snaps back instead of wrapping. Stepping keeps `loop` in charge, which is
 * what makes both directions endless — arrows, drag and autoplay alike.
 *
 * The categories are the admin's (`GET /global/index`); the heading above them
 * is the site's own copy. Until they arrive the rail shows its own outline.
 */
export function Categories() {
  const { t } = useLang();
  const scope = useGsapScope();
  const swiperRef = useRef<SwiperClass | null>(null);
  const { data, isLoading } = useHomeContent();
  const categories = data?.categories ?? [];
  const slides = repeatToFill(categories);

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
            <ArrowLeft size={17} strokeWidth={2.4} aria-hidden className="rtl:rotate-180" />
          </CircleIconButton>
          <CircleIconButton onClick={() => nudge(1)} aria-label={t("common.next")}>
            <ArrowRight size={17} strokeWidth={2.4} aria-hidden className="rtl:rotate-180" />
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
        {isLoading ? (
          /* The rail's own outline - same slide width, height and gap. */
          <div aria-hidden className="mt-[clamp(20px,2.4vw,30px)] flex gap-3 overflow-hidden pt-1.5 pb-[18px] md:gap-[15px] xl:gap-[18px]">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="flex w-[clamp(150px,15vw,186px)] flex-none flex-col gap-3.5 border border-border bg-surface p-[18px] py-[22px]"
              >
                <span className="h-[46px] w-[46px] animate-pulse rounded-full bg-border" />
                <span className="h-4 w-3/4 animate-pulse bg-border" />
                <span className="h-3 w-1/2 animate-pulse bg-border" />
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            /* Remounted when the list arrives: Swiper builds its loop clones once. */
            key={categories.length}
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
            {slides.map((category, i) => (
              <SwiperSlide key={`${category.id}-${i}`} className="h-auto! w-[clamp(150px,15vw,186px)]!">
                <Link
                  href="/services"
                  className={cn(
                    "group flex h-full w-full cursor-[inherit] flex-col items-start gap-3.5 border border-border bg-surface p-[18px] py-[22px] text-left text-heading",
                    "transition-[transform,background-color,border-color] duration-[180ms] ease-out hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white",
                  )}
                >
                  <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-primary/20 text-brand transition-colors duration-[180ms] ease-out group-hover:bg-white/20 group-hover:text-white">
                    <CategoryIcon category={category} />
                  </span>
                  <span className="flex flex-col gap-[3px]">
                    <span className="line-clamp-2 text-base font-extrabold leading-[1.2] tracking-[-0.02em]">
                      {category.name}
                    </span>
                    <span className="font-display text-xs font-bold uppercase leading-none tracking-[0.12em] text-muted transition-colors duration-[180ms] ease-out group-hover:text-white/75">
                      {t("home.categories.explore")}
                    </span>
                  </span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
