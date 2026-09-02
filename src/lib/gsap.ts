"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/*
 * The single place GSAP is configured.
 *
 * Import `gsap` from HERE, never from the package — this module is what
 * guarantees the plugins are registered before the first tween is built, and
 * registering twice from two entry points silently costs a second copy of
 * ScrollTrigger's ticker.
 *
 * `registerPlugin` is a no-op on the server (there is no DOM to measure), and
 * with `output: "export"` every page is prerendered, so the guard is required
 * rather than defensive.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /*
   * On iOS/Android, collapsing the address bar fires a `resize`. Without this,
   * ScrollTrigger re-measures every trigger mid-scroll and the reveals visibly
   * stutter on the first flick down the page.
   */
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText };

/*
 * One curve, one duration, one trigger point for the whole site. Sections tune
 * these per animation where the design calls for it, but the defaults are what
 * make eleven independently-written sections read as one scroll.
 */

/** Decelerating curve — long tail, so a reveal settles rather than stopping. */
export const EASE = "power3.out";
/** Reveal duration in seconds. */
export const DUR = 0.85;
/** Gap between two items of a staggered group. */
export const STAGGER = 0.085;
/** ScrollTrigger `start`: fire once the element's top clears 85% of the viewport. */
export const START = "top 85%";

/** Document writing direction, as `useLang()` reports it. */
export type Dir = "ltr" | "rtl";

/**
 * `+1` in LTR, `-1` in RTL - multiply any horizontal offset by this so a
 * "slide in from the start edge" animation flips with the document, the same
 * way the layout's `ps-*` / `end-*` logical utilities do.
 *
 * The direction is passed in rather than read off the DOM on purpose.
 * `LangProvider` keeps the first render at the default language to avoid a
 * hydration mismatch and only stamps `dir` on <html> in a post-mount effect -
 * which lands AFTER the layout effect that builds these tweens. Reading
 * `getComputedStyle(el).direction` here would therefore report `ltr` for an
 * Arabic visitor and every horizontal reveal would enter from the wrong side.
 * `useGsapScope` subscribes to the context value instead and rebuilds when it
 * changes.
 */
export const inlineSign = (dir: Dir): 1 | -1 => (dir === "rtl" ? -1 : 1);
