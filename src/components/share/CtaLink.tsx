import Link from "next/link";
import { cn } from "@/components/ui/cn";

/**
 * The design's primary call to action: a square plum block with an uppercase
 * condensed label. Two hover behaviours appear in the design —
 *
 *   "invert" (default) — flips to the inverted surface. Used on the page body
 *                        (hero, about).
 *   "darken"           — deepens to the darker plum. Used where the CTA sits
 *                        on chrome (header, drawer) and must not flip.
 */
export function CtaLink({
  href,
  hover = "invert",
  className,
  children,
}: {
  href: string;
  hover?: "invert" | "darken";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-[9px] bg-primary px-[30px] py-4 font-display text-[15px] font-bold uppercase leading-none tracking-[0.13em] text-white transition-colors",
        hover === "invert"
          ? "hover:bg-invert hover:text-invert-ink"
          : "hover:bg-primary-dark hover:text-white",
        className,
      )}
    >
      {children}
    </Link>
  );
}
