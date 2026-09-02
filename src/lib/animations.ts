"use client";

import {
  DUR,
  EASE,
  START,
  STAGGER,
  type Dir,
  gsap,
  inlineSign,
  SplitText,
} from "@/lib/gsap";

/*
 * ─────────────────────────────────────────────────────────────────────────────
 *  The declarative scroll-animation layer
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Sections do not write GSAP code. They tag markup with `data-anim*`
 * attributes and hang `useGsapScope()` on their root element; this module
 * reads those attributes and builds the timelines.
 *
 * Why attributes rather than a `<Reveal>` wrapper component: every wrapper is
 * an extra DOM node, and the home page's sections are full of grids and
 * `clamp()` layouts where an extra div changes the geometry. An attribute
 * animates the element the design already put there.
 *
 * ── The API ──────────────────────────────────────────────────────────────────
 *
 *   data-anim="up"            reveal this element with a preset (see PRESETS)
 *   data-anim-stagger="rise"  reveal this element's DIRECT CHILDREN in sequence
 *   data-anim-split           heading: reveal line by line from behind a mask
 *   data-anim-parallax="-50"  drift by ±50px while its section crosses the
 *                             viewport (scrubbed, not triggered)
 *   data-anim-count           count the number in this element up from zero
 *
 *   Modifiers:
 *   data-anim-delay="0.15"    seconds before it starts
 *   data-anim-gap="0.12"      stagger gap; only with `data-anim-stagger`
 *   data-anim-start="top 70%" ScrollTrigger `start` override
 *   data-anim-end="bottom 40%" ScrollTrigger `end` override; parallax only
 *   data-anim-scale="1.1"     zoom alongside `data-anim-parallax`
 *   data-anim-skip            opt a child OUT of its parent group's stagger
 *
 * ── Never tag anything above the fold ────────────────────────────────────────
 *
 * These animations are built in a layout effect, so nothing tagged here shows
 * up until the client bundle has downloaded, parsed and hydrated. Measured on
 * the exported build, that was 557ms after navigation unthrottled and 6.7s at
 * CPU x8 — always after first contentful paint. Below the fold that costs
 * nothing, because the reader has to scroll to get there. Above it, it is a
 * blank screen.
 *
 * The hero animates in CSS instead (`.enter-*` / `.enter-group` at the foot of
 * globals.css), which starts at first paint. There is deliberately no
 * "play on mount" option in this layer — it existed, the hero used it, and that
 * is exactly how the blank hero happened.
 *
 * ── The hidden-until-revealed problem ────────────────────────────────────────
 *
 * `opacity: 0` for every tagged element lives in `globals.css`, behind the
 * `.anim-ready` class that the blocking script in `app/layout.tsx` sets before
 * first paint. Two consequences worth knowing:
 *
 *   1. No flash — the element is hidden by the time the first pixel is drawn,
 *      not by a `useEffect` a frame later.
 *   2. Every tween must be `fromTo` with an explicit `opacity: 1`. `gsap.from`
 *      reads its end value off the live element, which is `opacity: 0` here, so
 *      a `from` tween would animate 0 → 0 and the section would never appear.
 */

/** Every preset's start state. `sign` flips the horizontal ones for RTL. */
const PRESETS: Record<string, (sign: number) => gsap.TweenVars> = {
  /** Nothing but a cross-fade — for text that must not move. */
  fade: () => ({ opacity: 0 }),
  /** The workhorse: a short rise. Section headers, copy, eyebrows. */
  up: () => ({ opacity: 0, y: 44 }),
  /** For anything anchored to the top of its section (tab bars, badges). */
  down: () => ({ opacity: 0, y: -34 }),
  /** Enters from the inline start edge — left in LTR, right in RTL. */
  left: (sign) => ({ opacity: 0, x: -64 * sign }),
  /** Enters from the inline end edge. */
  right: (sign) => ({ opacity: 0, x: 64 * sign }),
  /** Settles in from slightly small — photos, panels, plum badges. */
  zoom: () => ({ opacity: 0, scale: 0.94 }),
  /** Cards: a longer rise with a touch of scale, so a grid reads as a wave. */
  rise: () => ({ opacity: 0, y: 66, scale: 0.975 }),
  /** Wipes upward from its own bottom edge — the "modern" reveal for imagery. */
  clip: () => ({ opacity: 0, y: 26, clipPath: "inset(0% 0% 100% 0%)" }),
  /** Grows out of its inline start edge — rules, plum spines, dividers. */
  wipe: () => ({ opacity: 0, clipPath: "inset(0% 100% 0% 0%)" }),
};

/** Where each animated property has to land. Keyed to the PRESETS above, so a
 *  preset that never sets `clipPath` never gets an inline `clip-path`. */
const SETTLED: gsap.TweenVars = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  clipPath: "inset(0% 0% 0% 0%)",
};

/*
 * Transforms are handed back to CSS once the reveal is done, or the inline
 * `transform: translate(0,0)` GSAP leaves behind outranks the cards'
 * `hover:-translate-y-1` and every lift-on-hover in the design stops working.
 * `opacity` is deliberately NOT cleared — clearing it would re-expose the
 * `.anim-ready` rule that hid the element in the first place.
 */
const CLEAR = "transform,clipPath";

const attr = (el: HTMLElement, name: string) => el.getAttribute(name);

const numAttr = (el: HTMLElement, name: string, fallback: number) => {
  const raw = attr(el, name);
  const parsed = raw === null ? NaN : Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Marks a `useGsapScope` root. Stamped on by the hook's ref callback, never
 * written in markup, and read below to keep nested scopes from colliding.
 */
export const SCOPE_ATTR = "data-anim-scope";

/**
 * Collects the tagged elements this scope owns.
 *
 * Two things `root.querySelectorAll(selector)` gets wrong on its own:
 *
 *   1. It never returns the element it was called on, so a component that puts
 *      the scope ref and the reveal attribute on the SAME node - the natural
 *      thing to write - would silently get nothing, and the `.anim-ready` rule
 *      would leave its content hidden for good. Hence the `matches` check.
 *
 *   2. It reaches straight through a nested scope. A section with a second
 *      `useGsapScope` inside it (see `Listings`, which re-runs its grid on a tab
 *      change) would have that subtree animated twice - once by each scope -
 *      and the two tweens would fight over the same properties. Anything under
 *      a closer scope root is therefore left to that scope.
 */
function pick(root: HTMLElement, selector: string): HTMLElement[] {
  const scoped = root.hasAttribute(SCOPE_ATTR);

  const found = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) =>
      !scoped ||
      // A nested scope root, and everything under it, belongs to that scope.
      (!el.hasAttribute(SCOPE_ATTR) &&
        el.parentElement?.closest(`[${SCOPE_ATTR}]`) === root),
  );

  return root.matches(selector) ? [root, ...found] : found;
}

/** The section a scrubbed animation should measure itself against. */
const sectionOf = (el: HTMLElement, root: HTMLElement) => el.closest("section") ?? root;

/**
 * Builds one reveal. `targets` is a single element for `data-anim`, or a
 * group's children for `data-anim-stagger` — the trigger stays the tagged
 * element either way, so a grid reveals as one wave rather than row by row.
 */
function reveal(
  targets: HTMLElement | HTMLElement[],
  trigger: HTMLElement,
  preset: string,
  dir: Dir,
  stagger = 0,
) {
  const build = PRESETS[preset] ?? PRESETS.up;
  const from = build(inlineSign(dir));

  // Only settle the properties this preset actually disturbed.
  const to: gsap.TweenVars = {};
  for (const key of Object.keys(from)) to[key] = SETTLED[key];

  gsap.fromTo(targets, from, {
    ...to,
    duration: DUR,
    ease: EASE,
    stagger,
    delay: numAttr(trigger, "data-anim-delay", 0),
    clearProps: CLEAR,
    overwrite: "auto",
    scrollTrigger: {
      trigger,
      start: attr(trigger, "data-anim-start") ?? START,
      once: true,
    },
  });
}

/**
 * Masked line-by-line heading reveal.
 *
 * `autoSplit` re-splits when the webfont lands or the column reflows, and
 * returning the tween from `onSplit` is what lets GSAP throw the old one away —
 * the documented way to keep a split animation correct across a resize.
 */
function splitHeading(el: HTMLElement) {
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    // Named so the mask wrapper GSAP clones is addressable as
    // `.anim-line-mask` in globals.css - see the descender note there.
    linesClass: "anim-line",
    onSplit(self) {
      // The `.anim-ready` rule hid the heading; the line masks hide it now.
      gsap.set(el, { opacity: 1 });

      return gsap.fromTo(
        self.lines,
        { yPercent: 118 },
        {
          yPercent: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.11,
          delay: numAttr(el, "data-anim-delay", 0),
          scrollTrigger: {
            trigger: el,
            start: attr(el, "data-anim-start") ?? START,
            once: true,
          },
        },
      );
    },
  });
}

/** Scrubbed drift. Symmetric around the natural position, so the element sits
 *  exactly where the design put it when it is centred in the viewport. */
function parallax(el: HTMLElement, root: HTMLElement) {
  const distance = numAttr(el, "data-anim-parallax", 0) / 2;
  const scale = numAttr(el, "data-anim-scale", 1);
  if (!distance && scale === 1) return;

  gsap.fromTo(
    el,
    { y: -distance, scale: 1 },
    {
      y: distance,
      scale,
      ease: "none",
      scrollTrigger: {
        trigger: sectionOf(el, root),
        start: attr(el, "data-anim-start") ?? "top bottom",
        end: attr(el, "data-anim-end") ?? "bottom top",
        scrub: true,
      },
    },
  );
}

/*
 * Count-up.
 *
 * The stats are authored as display strings in `en.json` ("20K", "4.9", "60+"),
 * not as numbers, so the number is picked out of the string and the prefix and
 * suffix are re-attached on every frame. Anything that is not
 * `[prefix]number[suffix]` — "24/7" — fails the match and is left alone, which
 * is the intended behaviour rather than a gap.
 */
const NUMERIC = /^(\D*)(\d[\d,]*(?:\.\d+)?)(\D*)$/;

function countUp(el: HTMLElement) {
  const original = (el.textContent ?? "").trim();
  const match = NUMERIC.exec(original);
  if (!match) return;

  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(target)) return;

  const decimals = (digits.split(".")[1] ?? "").length;
  const grouped = digits.includes(",");
  const state = { value: 0 };

  const render = () => {
    const shown = grouped
      ? state.value.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : state.value.toFixed(decimals);
    el.textContent = `${prefix}${shown}${suffix}`;
  };

  render();

  gsap.to(state, {
    value: target,
    duration: 1.7,
    ease: "power2.out",
    onUpdate: render,
    // Restore the authored string, so the rendered text matches the
    // translation exactly once the count lands.
    onComplete: () => {
      el.textContent = original;
    },
    scrollTrigger: {
      trigger: el,
      start: attr(el, "data-anim-start") ?? START,
      once: true,
    },
  });
}

/**
 * Wires every `data-anim*` element inside `root`.
 *
 * Call it inside a `gsap.matchMedia()` callback — the tweens and ScrollTriggers
 * it creates are collected by whichever context is active. `SplitText`
 * instances are not, so they are reverted by the returned cleanup.
 *
 * `dir` decides which way the horizontal presets enter - see `inlineSign`.
 */
export function applyScrollAnimations(root: HTMLElement, dir: Dir): () => void {
  const splits = pick(root, "[data-anim-split]").map(splitHeading);

  for (const el of pick(root, "[data-anim]")) {
    reveal(el, el, attr(el, "data-anim") || "up", dir);
  }

  for (const group of pick(root, "[data-anim-stagger]")) {
    /*
     * Two ways out of a group:
     *
     *   data-anim       the child animates on its own terms, above.
     *   data-anim-skip  the child is not part of the sequence at all. Needed
     *                   wherever a flex row holds an absolutely-positioned
     *                   decoration alongside its real content (About's floating
     *                   tool sits in the CTA row) - such a child usually
     *                   carries a design opacity of its own, and a reveal
     *                   settles opacity at 1, which would blow it out.
     */
    const children = Array.from(group.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        !child.hasAttribute("data-anim") &&
        !child.hasAttribute("data-anim-skip"),
    );
    if (!children.length) continue;

    reveal(
      children,
      group,
      attr(group, "data-anim-stagger") || "rise",
      dir,
      numAttr(group, "data-anim-gap", STAGGER),
    );
  }

  for (const el of pick(root, "[data-anim-parallax]")) {
    parallax(el, root);
  }

  for (const el of pick(root, "[data-anim-count]")) {
    countUp(el);
  }

  return () => {
    for (const split of splits) split.revert();
  };
}
