"use client";

import Image, { type StaticImageData } from "next/image";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
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
  "wide:w-[54%] wide:[clip-path:polygon(19%_0,100%_0,100%_100%,0_100%)]";

/**
 * Hero motion, in two layers — and the split between them is the whole point.
 *
 * **The entrance is CSS** (`enter-*` / `enter-group`, defined at the foot of
 * `globals.css`). It is the one section above the fold, so it must not wait for
 * React. Tagging it with `data-anim` instead put the headline behind the client
 * bundle: measured on the exported build it appeared 557ms after navigation
 * unthrottled and 6.7s at CPU x8, always after first contentful paint. CSS
 * animations start at first paint, so the choreography now runs at the same
 * moment the page becomes visible, on any device.
 *
 * **The scroll is GSAP** — the reader has to scroll for it, so hydration has
 * long landed. It cannot be `data-anim-parallax` either: that preset is
 * symmetric around an element's resting position, which is right for a mid-page
 * section that should look untouched while you read it and wrong here, where
 * the page is already at scroll 0 and the hero must start exactly as designed.
 * `heroParallax` anchors both drifts at `top top` so progress is genuinely 0 on
 * the first frame.
 */
function heroParallax(root: HTMLElement) {
  const drift = (selector: string, y: number, opacity = 1) => {
    const el = root.querySelector<HTMLElement>(selector);
    if (!el) return;

    gsap.to(el, {
      y,
      opacity,
      ease: "none",
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  };

  // The worker hangs back as the page pulls away; the copy leaves faster and
  // dims, so the section below arrives on a clean field rather than through it.
  drift('[data-hero="worker"]', 96);
  drift('[data-hero="copy"]', -58, 0.35);
}

export function Hero() {
  const { t } = useLang();
  const scope = useGsapScope(heroParallax);

  return (
    <section ref={scope} className="relative overflow-x-clip bg-bg">
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

      {/*
        Line-work, clipped to the wedge. Faded rather than moved: the shapes are
        positioned in percentages of the wedge, and a transform on the wrapper
        would slide the `clip-path` with it and break the diagonal.
      */}
      <div className={`${WEDGE} enter-fade overflow-hidden`} aria-hidden>
        <div className="absolute -top-[14%] -right-[6%] h-[clamp(300px,34vw,520px)] w-[clamp(300px,34vw,520px)] rounded-full border border-white/[0.18]" />
        <div className="absolute -top-[4%] right-[2%] h-[clamp(210px,24vw,380px)] w-[clamp(210px,24vw,380px)] rounded-full border border-white/[0.12]" />
        <div className="absolute right-[6%] bottom-[12%] h-[clamp(120px,13vw,190px)] w-[clamp(120px,13vw,190px)] rotate-[22deg] rounded-3xl border border-white/[0.16]" />
        <div className="absolute bottom-[16%] left-[14%] h-[clamp(140px,16vw,230px)] w-[clamp(140px,16vw,230px)] opacity-50 bg-[radial-gradient(rgba(255,255,255,0.55)_1.4px,transparent_1.4px)] bg-[length:16px_16px]" />
        <div className="absolute inset-y-0 right-[22%] w-px skew-x-[-13deg] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.22)_45%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-y-0 right-[34%] w-px skew-x-[-13deg] bg-[linear-gradient(180deg,rgba(255,255,255,0)_10%,rgba(255,255,255,0.12)_60%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_8%,rgba(255,255,255,0.16),rgba(255,255,255,0)_62%)]" />
      </div>

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-[clamp(16px,2vw,24px)] px-[clamp(18px,3vw,44px)] mid:min-h-[520px] mid:pt-10 wide:min-h-[600px] wide:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div
          data-hero="copy"
          className="flex min-w-0 flex-col gap-[clamp(14px,1.6vw,20px)] pt-[clamp(38px,5vw,64px)] pb-[clamp(28px,6vw,70px)] wide:pb-[70px]"
        >
          {/*
            The LCP element on a desktop viewport. `enter-rise` moves it and
            nothing else — a fade or a clip here costs ~3s of LCP, because Chrome
            does not record a paint for something it cannot see. See the note at
            the foot of globals.css.
          */}
          <h1 className="enter-rise text-[clamp(34px,5.4vw,78px)] leading-[0.98] text-balance [--enter-delay:0.1s]">
            {t("home.hero.titleLine1")}
            <br />
            <span className="text-brand">{t("home.hero.titleLine2")}</span>
          </h1>

          <p className="enter-up max-w-[440px] text-[clamp(14.5px,1.2vw,15.5px)] leading-[1.6] text-body [--enter-delay:0.24s]">
            {t("home.hero.lead")}
          </p>

          <div className="enter-group mt-2.5 flex flex-wrap items-center gap-[clamp(14px,1.8vw,22px)] [--enter-delay:0.32s]">
            <CtaLink href="/services">{t("home.hero.discover")}</CtaLink>
          </div>

          <div className="enter-group mt-4 flex flex-wrap items-center gap-x-[clamp(14px,1.6vw,26px)] gap-y-3 [--enter-delay:0.42s]">
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

        {/*
          No horizontal offset here, at any breakpoint.

          This column used to carry `left-[165px]`, and a `position: relative`
          offset does not shrink to fit — it pushes visual overflow out of the
          document. Measured against the dev server it widened the page at every
          width the site actually ships to: 107-129px of horizontal scroll from
          700px through 1440px, and on a phone the worse failure mode, where
          Chrome widens the layout viewport to swallow the overflow instead
          (`innerWidth` came back 507 on a 360px device) so the whole hero
          rendered zoomed out with the lead paragraph sliced off. It only looked
          right above ~1900px, where the `max-w-[1440px]` container has enough
          side slack to absorb 165px.

          None of it was needed. The figure is `max-w-[640px]` inside the grid's
          `1fr` track, which lands its right edge on the container's right
          padding edge unaided — 1381px against a 1382px content edge at 1440,
          and flush at 980, 1024 and 1280 too. The wedge behind it is sized in
          percentages, so the two stay registered on their own.
        */}
        <div
          data-hero="worker"
          className="relative flex h-full min-w-0 items-end justify-center"
        >
          {/* `enter-rise`, not `enter-up`: on a narrow viewport the figure is
              the largest paint instead of the headline, so it carries the same
              no-fade rule. */}
          <div className="enter-rise relative mb-0 aspect-[330/366] w-full max-w-[330px] drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)] mid:mb-[-74px] mid:max-w-[420px] wide:mb-[-92px] wide:max-w-[640px] [--enter-delay:0.12s] [--enter-y:40px]">
            {/*
              The LCP element on every viewport.

              `priority` alone got the preload link into the HTML but no
              priority hint, which is what Lighthouse's "LCP request discovery"
              audit asks for - so `fetchPriority` is set explicitly.

              `sizes` matches the real slot, all three of them: 330px on a
              phone, 420px across the 700-979px band (`mid:max-w-[420px]`) and
              640px above it (`wide:max-w-[640px]`). `output: "export"`
              forces `images.unoptimized`, so there is no srcset for the browser
              to pick from and `sizes` is only a hint today - but it is the
              number an optimizer would read the day this moves off a static
              host, and a wrong one silently under-fetches.
            */}
            <Image
              src={heroWorker}
              alt={t("home.hero.workerAlt")}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 700px) 330px, (max-width: 980px) 420px, 640px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>

      <HeroBookingBand />
    </section>
  );
}
