import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/components/ui/cn";

/**
 * The small icon + uppercase condensed label that opens every section
 * ("Welcome to Handiman", "Browse categories", "Who we are", "Contact us").
 *
 * The arrow is the default marker; pass `icon` for a section that uses its own.
 * Colour comes from `text-brand`, which `className` can override — the contact
 * panel sits on plum and needs white.
 *
 * Extra props land on the outer `<span>`, which is what lets a section tag it
 * with the `data-anim*` reveal attributes (see `@/lib/animations`) without a
 * wrapper element.
 */
export function Eyebrow({
  children,
  icon,
  className,
  ...rest
}: ComponentProps<"span"> & {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span
      {...rest}
      className={cn(
        "flex items-center gap-[9px] font-display text-[clamp(13px,1.2vw,15px)] font-bold uppercase leading-none tracking-[0.18em] text-brand",
        className,
      )}
    >
      <span className="flex shrink-0 items-center [&>svg]:block">
        {icon ?? <ArrowRight size={16} strokeWidth={2.6} aria-hidden />}
      </span>
      {children}
    </span>
  );
}
