"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

/**
 * The design's hairline circle button — theme toggle, slider arrows, drawer
 * close. Fills with plum on hover.
 *
 * `tone="soft"` is the drawer variant: filled with the drawer's soft surface
 * and no border. `tone="ghost"` is borderless like `soft`, but transparent —
 * for a circle button sitting directly on the page rather than a drawer.
 */
export interface CircleIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  tone?: "outline" | "soft" | "ghost";
}

export const CircleIconButton = forwardRef<HTMLButtonElement, CircleIconButtonProps>(
  function CircleIconButton({ size = 44, tone = "outline", className, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          tone === "outline" && "border border-border bg-transparent text-heading hover:border-primary hover:bg-primary hover:text-white",
          tone === "soft" && "border-0 bg-drawer-soft text-drawer-ink hover:bg-primary hover:text-white",
          tone === "ghost" && "border-0 bg-transparent text-heading hover:bg-primary hover:text-white",
          className,
        )}
        {...props}
      />
    );
  },
);
