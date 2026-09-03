"use client";

import Image from "next/image";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import logoLight from "@public/assets/navbar/logo-light.webp";
import logoDark from "@public/assets/navbar/logo-dark.webp";
import markLight from "@public/assets/navbar/logo-mark-light.webp";
import markDark from "@public/assets/navbar/logo-mark-dark.webp";

/*
 * The two files are named for the theme they belong to, not for their own ink:
 * `logo-light` is the plum lockup (rgb(78,1,58) ≈ `--primary__color`) that goes
 * on a light ground, `logo-dark` is the near-white one for a dark ground.
 *
 * Both are cropped from the same 2172x724 source PNGs on the union of their two
 * opaque bounding boxes (2071x537), so they share one aspect ratio to four
 * decimal places — the lockup does not change size or shift when the theme
 * toggles — and both are re-encoded to 386x100 webp. Those PNGs are 356KB and
 * 360KB; `images.unoptimized` ships an import byte-for-byte with no srcset, so
 * either one would have reached every phone in full to fill a 154px box. The
 * webp pair is 13.2KB and 9.5KB, still 2.5x the widest box. Blueprint §14.1.
 *
 * Both axes are stated, and stated as arbitrary values rather than `h-full` /
 * `w-auto` on the image: `h-full` does not resolve in this build (an <img
 * class="h-full"> in a 40px flex box measured 100px — its intrinsic height —
 * so the rule never landed), and the width/height attributes `next/image`
 * derives from a static import then win by default. `fill` sidesteps the
 * question entirely, because Next writes `position:absolute` and 100%/100%
 * inline where no class can lose to anything.
 *
 * The widths are the heights x 3.86, the artwork's ratio, so `object-contain`
 * has nothing left to letterbox.
 */
const BOX = {
  /* Tracks the wordmark the navbar used to set in `clamp(19px,2vw,22px)`. */
  md: { box: "h-[clamp(34px,3.2vw,40px)] w-[clamp(131px,12.4vw,154px)]", sizes: "154px" },
  sm: { box: "h-7 w-[108px]", sizes: "108px" },
  /*
   * The dashboard rail. Fixed, not clamped: `md` sizes off `vw`, which is
   * meaningless inside a rail that is 260px at every viewport it appears in.
   *
   * 147 = 36 x 4.095, the ratio of the artwork ACTUALLY on disk (815x199).
   * Note that is not the 3.86 the block above quotes — the lockup files were
   * replaced after that note was written, so `sm`/`md` now letterbox by a
   * pixel or two. Harmless, but this one is derived from the real files.
   */
  lg: { box: "h-9 w-[147px]", sizes: "147px" },
} as const;

/**
 * The brand lockup, as artwork.
 *
 * Presentational on purpose — callers decide whether it links anywhere, which
 * is why the header wraps it in a `Link` and the drawer heading does not.
 *
 * Both themes' artwork is in the DOM and CSS picks one (`dark:hidden` /
 * `hidden dark:block`). It cannot be a single `src` chosen in JS: `data-theme`
 * is set by the blocking script in `app/layout.tsx` before first paint, so a
 * React-chosen `src` would paint the wrong lockup and swap it after hydration.
 * Both are `loading="eager"` rather than lazy, which would skip the hidden one
 * — 23KB total, cached across every page, buys a logo that is simply there on
 * first paint instead of popping in.
 *
 * `tone="on-dark"` pins the white artwork for the footer, whose panel is plum
 * in both themes and so must not follow the theme at all.
 */
export function Logo({
  tone = "brand",
  size = "md",
  className,
}: {
  tone?: "brand" | "on-dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { t } = useLang();
  const name = t("brand.name");
  const { box, sizes } = BOX[size];
  /* `alt` is passed per element, not folded in here — jsx-a11y cannot see it
     through a spread and reports every one of them as missing. */
  const img = { fill: true, sizes, loading: "eager" } as const;

  return (
    <span className={cn("relative block flex-none", box, className)}>
      {tone === "on-dark" ? (
        <Image {...img} alt={name} src={logoDark} className="object-contain object-left" />
      ) : (
        <>
          <Image {...img} alt={name} src={logoLight} className="object-contain object-left dark:hidden" />
          <Image {...img} alt={name} src={logoDark} className="hidden object-contain object-left dark:block" />
        </>
      )}
    </span>
  );
}

/**
 * The lockup's circular house-and-hammer mark on its own, square.
 *
 * Cropped from the same two lockups at their measured ink bounds (x 12-203,
 * y 3-195 of the 815x199 artwork) and re-encoded to 96x96 — so it is the same
 * artwork, not a redrawn approximation, and it stays in step if the lockup is
 * replaced by re-running that crop.
 *
 * For anywhere the wordmark will not fit: the dashboard rail's 76px state, and
 * any future favicon-sized slot. Same `tone` contract as `Logo` — `on-dark`
 * pins the white mark for a ground that is dark in both themes.
 */
export function LogoMark({
  tone = "brand",
  size = 36,
  className,
}: {
  tone?: "brand" | "on-dark";
  size?: number;
  className?: string;
}) {
  const { t } = useLang();
  const name = t("brand.name");
  const img = { width: size, height: size, loading: "eager" } as const;

  return (
    <span
      className={cn("relative block flex-none", className)}
      style={{ width: size, height: size }}
    >
      {tone === "on-dark" ? (
        <Image {...img} alt={name} src={markDark} className="h-full w-full object-contain" />
      ) : (
        <>
          <Image {...img} alt={name} src={markLight} className="h-full w-full object-contain dark:hidden" />
          <Image {...img} alt={name} src={markDark} className="hidden h-full w-full object-contain dark:block" />
        </>
      )}
    </span>
  );
}
