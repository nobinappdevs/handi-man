"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useLang } from "@/hooks/useLang";
import { ScrollTrigger, gsap } from "@/lib/gsap";
import { SCOPE_ATTR, applyScrollAnimations } from "@/lib/animations";

/*
 * GSAP has to measure the DOM before the browser paints, or the first frame
 * shows the element at its natural position. `useLayoutEffect` is therefore
 * required rather than preferred — and it must not run during the static
 * export's prerender, which is what the swap avoids.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * How close a section comes before its animations are built.
 *
 * Has to be comfortably more than zero: the reveal trigger is `top 85%` and the
 * parallax trigger is `top bottom`, and the ScrollTrigger must already exist
 * when the section reaches either. 300px is roughly one flick of scrolling.
 */
const BUILD_MARGIN = "300px 0px";

/**
 * Late-landing webfonts and images change every element's height, which
 * invalidates every trigger position measured before they arrived. ScrollTrigger
 * already refreshes on `window.load`; fonts resolve independently of it.
 *
 * Hooked once per page load, not once per section.
 */
let fontRefreshHooked = false;
function refreshOnFontLoad() {
  if (fontRefreshHooked || typeof document === "undefined" || !document.fonts) return;
  fontRefreshHooked = true;
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/** Custom per-section GSAP, run with the section root already in hand. */
export type GsapSetup = (root: HTMLElement) => void;

/**
 * Returns a ref for a section's root element and animates everything inside it.
 *
 * Wires every `data-anim*` attribute in the subtree (see `@/lib/animations`),
 * then hands the root to `setup` for anything the attributes cannot express —
 * `Hero` and `ScrollProgress` are the only two that need it.
 *
 * Everything is built inside a `gsap.matchMedia()` keyed on
 * `prefers-reduced-motion`, so a visitor who asks for less motion gets no
 * tweens at all rather than shorter ones, and the reduced-motion block in
 * `globals.css` leaves their content plainly visible.
 *
 * `resetKey` re-runs the whole scope when it changes. Pass it when the section
 * swaps its own DOM (a tab change), so freshly mounted children are animated
 * instead of being left invisible by the `.anim-ready` rule.
 */
export function useGsapScope<T extends HTMLElement = HTMLElement>(
  setup?: GsapSetup,
  resetKey?: string | number,
) {
  const { dir } = useLang();
  const node = useRef<T>(null);
  const setupRef = useRef(setup);

  /*
   * A callback ref rather than a plain one, so the scope marker is in place
   * before ANY layout effect runs. React attaches every ref in a commit before
   * it runs the first effect, which is what lets a parent scope see that a
   * sibling-declared child scope already owns its subtree — declaration order
   * of the two hooks would otherwise decide it, and the parent is declared
   * first.
   */
  const ref = useCallback((el: T | null) => {
    node.current = el;
    el?.setAttribute(SCOPE_ATTR, "");
  }, []);

  // Kept in a ref so the scope is not rebuilt on every render just because the
  // React Compiler handed us a new closure.
  useIsomorphicLayoutEffect(() => {
    setupRef.current = setup;
  }, [setup]);

  useIsomorphicLayoutEffect(() => {
    const root = node.current;
    if (!root) return;

    refreshOnFontLoad();

    /*
     * Tells the failsafe timer in the boot script (app/layout.tsx) that the
     * reveal layer is alive, so it does not un-hide the page from under us. Set
     * here rather than inside `build` below: a reduced-motion visitor never
     * builds a tween but their CSS already shows the content, and a section far
     * down the page has not been built yet either.
     */
    document.documentElement.setAttribute("data-anim-live", "");

    let revertSplits: (() => void) | undefined;
    let mm: ReturnType<typeof gsap.matchMedia> | undefined;

    const build = () => {
      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        revertSplits = applyScrollAnimations(root, dir);
        setupRef.current?.(root);
      });
    };

    /*
     * Built when the section comes within reach, not on mount.
     *
     * Eleven scopes building at once during hydration was the largest block of
     * main-thread time on this page. SplitText has to measure every word's box
     * to group the words into lines, and ScrollTrigger measures every trigger,
     * so it was some forty forced synchronous layouts back to back — which is
     * exactly what Lighthouse reports as "Forced reflow", and most of Total
     * Blocking Time. Deferring costs nothing visible (BUILD_MARGIN guarantees
     * the scope exists before the section can reach its own trigger point) and
     * moves the work off the one moment the page can least afford it.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        // One-shot — the tweens outlive the observer.
        observer.disconnect();
        build();
      },
      { rootMargin: BUILD_MARGIN },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      revertSplits?.();
      // Reverts every tween and ScrollTrigger created inside `mm.add`, and
      // restores the inline styles they wrote.
      mm?.revert();
    };
    /*
     * `dir` is a dependency, not just an input. LangProvider keeps the first
     * render at the default language and only detects the real one after mount,
     * so an Arabic visitor renders `ltr` once and then flips. Rebuilding on that
     * flip is what gets the horizontal reveals entering from the right edge; it
     * costs one replay, on the same frame the page swaps every string anyway.
     */
  }, [resetKey, dir]);

  return ref;
}
