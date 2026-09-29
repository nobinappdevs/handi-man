import Link from "next/link";
import { cn } from "@/components/ui/cn";

/**
 * The design's call to action: a square block with an uppercase condensed
 * label. Two variants —
 *
 *   "solid" (default) — the plum block. The primary action on a screen.
 *   "outline"         — the hairline twin that sits BESIDE a solid one, for
 *                       the second of two choices.
 *
 * and two hover behaviours for the solid one —
 *
 *   "invert" (default) — flips to the inverted surface. Used on the page body
 *                        (hero, about).
 *   "darken"           — deepens to the darker plum. Used where the CTA sits
 *                        on chrome (header, drawer) and must not flip.
 *
 * Both variants live here rather than being hand-rolled at the call site,
 * because `cn` joins rather than merges: a `className` override loses to the
 * base classes on CSS order, so the only safe way to vary the block is a prop.
 *
 * The outline is drawn at 30% of the heading ink, NOT `border-border`. That
 * token is a 12% hairline tuned for dividing flat panels, and at button scale —
 * beside a saturated plum block, on a page carrying the diagonal watermark —
 * it reads as no edge at all.
 */
const VARIANTS = {
  solid: "bg-primary text-white",
  outline: "border border-heading/30 text-heading hover:border-primary hover:text-brand",
} as const;

export function CtaLink({
  href,
  variant = "solid",
  hover = "invert",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  /** Solid only — an outline CTA keeps its own hover. */
  hover?: "invert" | "darken";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-[9px] px-[30px] py-4 font-display text-[15px] font-bold uppercase leading-none tracking-[0.13em] transition-colors",
        VARIANTS[variant],
        variant === "solid" &&
          (hover === "invert"
            ? "hover:bg-invert hover:text-invert-ink"
            : "hover:bg-primary-dark hover:text-white"),
        className,
      )}
    >
      {children}
    </Link>
  );
}
