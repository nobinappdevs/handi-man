"use client";

import { Wrench } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";

/**
 * The brand lockup: plum disc + wrench, then the wordmark.
 *
 * Presentational on purpose — callers decide whether it links anywhere, which
 * is why the header wraps it in a `Link` and the auth screen does not.
 *
 * `tone="on-dark"` is the inverse treatment the footer uses: white disc, plum
 * glyph, white wordmark. The default reads off the theme tokens, so it flips
 * with light/dark on its own.
 */
export function Logo({
  tone = "brand",
  size = "md",
  className,
}: {
  tone?: "brand" | "on-dark";
  size?: "sm" | "md";
  className?: string;
}) {
  const { t } = useLang();
  const onDark = tone === "on-dark";

  return (
    <span className={cn("flex items-center gap-[11px]", className)}>
      <span
        className={cn(
          "flex flex-none items-center justify-center rounded-full",
          size === "md" ? "h-[38px] w-[38px]" : "h-8 w-8",
          onDark
            ? "bg-white text-primary"
            : "bg-primary text-white shadow-[0_0_0_4px_rgba(var(--primary__color),0.18)]",
        )}
      >
        <Wrench size={size === "md" ? 19 : 16} strokeWidth={2.4} aria-hidden />
      </span>
      <span
        className={cn(
          "font-extrabold tracking-[-0.025em]",
          size === "md" ? "text-[23px]" : "text-[19px]",
          onDark ? "text-white" : "text-heading",
        )}
      >
        {t("brand.name")}
      </span>
    </span>
  );
}
