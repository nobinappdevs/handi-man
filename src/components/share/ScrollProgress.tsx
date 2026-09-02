"use client";

import { useGsapScope } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

/**
 * The plum hairline across the top of the page that fills as you scroll.
 *
 * Driven by a scrubbed ScrollTrigger on the document rather than a scroll
 * listener, so it shares ScrollTrigger's single rAF-throttled ticker with every
 * section reveal instead of adding a second one.
 *
 * `scrub: 0.25` — a quarter-second of catch-up. At `scrub: true` the bar tracks
 * a trackpad's raw deltas and reads as jittery; the lag smooths it without ever
 * feeling detached.
 *
 * `scaleX` on a full-width bar, not an animated `width`: a transform is
 * composited, a width change relayouts the bar on every frame.
 */
function fillOnScroll(root: HTMLElement) {
  gsap.fromTo(
    root.firstElementChild,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.25 },
    },
  );
}

export function ScrollProgress() {
  const scope = useGsapScope<HTMLDivElement>(fillOnScroll);

  return (
    <div
      ref={scope}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      {/* `origin-left` is a physical edge, so it needs the RTL flip the layout's
          logical `ps-*` / `end-*` utilities get for free. */}
      <div className="h-full w-full origin-left scale-x-0 bg-primary rtl:origin-right" />
    </div>
  );
}
