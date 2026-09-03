"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

/**
 * The dashboard's hairline square icon button — burger, notifications, theme,
 * language. Sibling of `CircleIconButton`, which is the public site's; the two
 * differ in more than the corner radius, so neither is a variant of the other:
 *
 *   circle  fills with plum on hover (a control on a light marketing page)
 *   square  keeps its ground and moves border + icon to brand (a control in a
 *           dense toolbar, where four buttons flooding plum in turn is noise)
 *
 * 40px to match the design's header row. `asChild`-style composition is not
 * needed — everything that uses it is a real button.
 */
export interface SquareIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
}

export const SquareIconButton = forwardRef<HTMLButtonElement, SquareIconButtonProps>(
  function SquareIconButton({ size = 40, className, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        style={{ width: size, height: size }}
        className={cn(
          "flex flex-none cursor-pointer items-center justify-center border border-border bg-transparent text-heading transition-colors",
          "hover:border-primary hover:text-brand",
          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);
