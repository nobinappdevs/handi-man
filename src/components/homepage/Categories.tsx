"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { CircleIconButton } from "@/components/share/CircleIconButton";
import { CATEGORIES } from "@/components/homepage/homeData";
import { cn } from "@/components/ui/cn";

/** Pixels per frame for the idle drift. */
const DRIFT = 0.45;
/** Arrow-button tween. */
const TWEEN_MS = 380;

/**
 * Endlessly marqueeing category rail.
 *
 * The list is rendered three times and the scroll position is snapped back by
 * one copy whenever it drifts into the outer thirds, which is what makes the
 * loop seamless in both directions. It drifts on its own, pauses on hover,
 * wheel and drag, and can be nudged a screen at a time with the arrows.
 */
export function Categories() {
  const { t } = useLang();
  const [active, setActive] = useState(0);

  const trackRef = useRef<HTMLDivElement | null>(null);
  /** Mutable slider bookkeeping — never read during render. */
  const s = useRef({
    paused: false,
    down: false,
    dragged: false,
    startX: 0,
    startScroll: 0,
    raf: 0,
    tween: 0,
    resume: 0 as ReturnType<typeof setTimeout> | 0,
  });

  /** Width of one copy of the list, or 0 while the track cannot scroll yet. */
  const copyWidth = useCallback((el: HTMLDivElement) => {
    return el.scrollWidth - el.clientWidth > 0 ? el.scrollWidth / 3 : 0;
  }, []);

  const wrap = useCallback(
    (el: HTMLDivElement) => {
      const one = copyWidth(el);
      if (!one) return;
      if (el.scrollLeft >= one * 2) el.scrollLeft -= one;
      else if (el.scrollLeft < one * 0.5) el.scrollLeft += one;
    },
    [copyWidth],
  );

  const pause = useCallback((ms: number) => {
    s.current.paused = true;
    if (s.current.resume) clearTimeout(s.current.resume);
    s.current.resume = setTimeout(() => {
      s.current.paused = false;
    }, ms);
  }, []);

  const nudge = useCallback(
    (dir: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      const distance = dir * Math.max(240, el.clientWidth * 0.7);
      pause(TWEEN_MS + 700);
      cancelAnimationFrame(s.current.tween);

      const start = performance.now();
      let applied = 0;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / TWEEN_MS);
        const eased = 1 - Math.pow(1 - p, 3);
        const target = distance * eased;
        el.scrollLeft += target - applied;
        applied = target;
        wrap(el);
        if (p < 1) s.current.tween = requestAnimationFrame(step);
      };
      s.current.tween = requestAnimationFrame(step);
    },
    [pause, wrap],
  );

  /* Start in the middle copy, then drift until something interrupts. */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    el.scrollLeft = copyWidth(el);

    const tick = () => {
      if (!s.current.paused && !s.current.down) el.scrollLeft += DRIFT;
      wrap(el);
      s.current.raf = requestAnimationFrame(tick);
    };
    s.current.raf = requestAnimationFrame(tick);

    const state = s.current;
    return () => {
      cancelAnimationFrame(state.raf);
      cancelAnimationFrame(state.tween);
      if (state.resume) clearTimeout(state.resume);
    };
  }, [copyWidth, wrap]);

  /* ── pointer drag ── */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    s.current.down = true;
    s.current.dragged = false;
    s.current.startX = e.clientX;
    s.current.startScroll = el.scrollLeft;
    s.current.paused = true;
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !s.current.down) return;
    const dx = e.clientX - s.current.startX;
    if (Math.abs(dx) > 4) s.current.dragged = true;
    el.scrollLeft = s.current.startScroll - dx;
    wrap(el);
  };

  const endDrag = () => {
    if (!s.current.down) return;
    s.current.down = false;
    pause(1200);
    // Let the click that follows the release see `dragged` before it resets.
    setTimeout(() => {
      s.current.dragged = false;
    }, 60);
  };

  /* Three copies of the list — the middle one is what you actually look at. */
  const loop = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

  return (
    <section className="relative bg-bg pt-[clamp(48px,6vw,96px)] pb-[clamp(34px,4vw,58px)] mid:pt-[150px] wide:pt-[180px]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-5 px-[clamp(18px,3vw,44px)]">
        <div className="flex min-w-0 flex-col gap-2">
          <Eyebrow>{t("home.categories.eyebrow")}</Eyebrow>
          <h2 className="text-[clamp(24px,2.6vw,36px)] leading-[1.06]">
            {t("home.categories.title")}
          </h2>
        </div>

        <div className="flex flex-none items-center gap-2.5">
          <CircleIconButton onClick={() => nudge(-1)} aria-label={t("common.previous")}>
            <ArrowLeft size={17} strokeWidth={2.4} aria-hidden />
          </CircleIconButton>
          <CircleIconButton onClick={() => nudge(1)} aria-label={t("common.next")}>
            <ArrowRight size={17} strokeWidth={2.4} aria-hidden />
          </CircleIconButton>
        </div>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => {
          s.current.paused = true;
        }}
        onMouseLeave={() => {
          endDrag();
          if (!s.current.down) s.current.paused = false;
        }}
        onWheel={() => pause(1200)}
        className="no-scrollbar mt-[clamp(20px,2.4vw,30px)] flex cursor-grab gap-[clamp(12px,1.4vw,18px)] overflow-x-auto px-[clamp(18px,3vw,44px)] pt-1.5 pb-[18px] select-none active:cursor-grabbing"
      >
        {loop.map((category, i) => {
          const index = i % CATEGORIES.length;
          const on = index === active;
          return (
            <button
              key={`${category.key}-${i}`}
              type="button"
              onClick={() => {
                // A drag that ends over a card must not also select it.
                if (s.current.dragged) return;
                setActive(index);
              }}
              aria-pressed={on}
              className={cn(
                "flex w-[clamp(150px,15vw,186px)] flex-none cursor-[inherit] flex-col items-start gap-3.5 border p-[18px] py-[22px] text-left",
                "transition-[transform,background-color,border-color] duration-[180ms] ease-out hover:-translate-y-1",
                on ? "border-primary bg-primary text-white" : "border-border bg-surface text-heading",
              )}
            >
              <span
                className={cn(
                  "flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full",
                  on ? "bg-white/20 text-white" : "bg-primary/20 text-brand",
                )}
              >
                {category.icon}
              </span>
              <span className="flex flex-col gap-[3px]">
                <span className="text-base font-extrabold leading-[1.2] tracking-[-0.02em]">
                  {t(`home.categories.items.${category.key}`)}
                </span>
                <span
                  className={cn(
                    "font-display text-xs font-bold uppercase leading-none tracking-[0.12em]",
                    on ? "text-white/75" : "text-muted",
                  )}
                >
                  {category.pros === null
                    ? t("home.categories.allDay")
                    : `${category.pros} ${t("home.categories.pros")}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
