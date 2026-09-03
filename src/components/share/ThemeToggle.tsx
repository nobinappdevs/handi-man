"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { CircleIconButton } from "@/components/share/CircleIconButton";
import { SquareIconButton } from "@/components/ui/SquareIconButton";

/**
 * One button that swaps the icon: a sun while dark (click for light), a moon
 * while light (click for dark) — as in the design.
 *
 * `variant` picks the chrome, not the behaviour: the public site's circle, or
 * the dashboard toolbar's hairline square. Both drive the same `toggleTheme`.
 */
export function ThemeToggle({
  size,
  variant = "circle",
}: {
  size?: number;
  variant?: "circle" | "square";
}) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLang();
  const isDark = theme === "dark";

  const icon = isDark ? (
    <Sun size={17} strokeWidth={2} aria-hidden />
  ) : (
    <Moon size={17} strokeWidth={2} aria-hidden />
  );

  if (variant === "square") {
    return (
      <SquareIconButton
        size={size ?? 40}
        onClick={toggleTheme}
        title={t("theme.toggle")}
        aria-label={t(isDark ? "theme.light" : "theme.dark")}
      >
        {icon}
      </SquareIconButton>
    );
  }

  return (
    <CircleIconButton
      size={size ?? 36}
      tone="ghost"
      onClick={toggleTheme}
      title={t("theme.toggle")}
      aria-label={t(isDark ? "theme.light" : "theme.dark")}
    >
      {icon}
    </CircleIconButton>
  );
}
