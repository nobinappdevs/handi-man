"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { CircleIconButton } from "@/components/share/CircleIconButton";

/**
 * Single circle button that swaps the icon: a sun while dark (click for light),
 * a moon while light (click for dark) — as in the design.
 */
export function ThemeToggle({ size = 36 }: { size?: number }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLang();
  const isDark = theme === "dark";

  return (
    <CircleIconButton
      size={size}
      onClick={toggleTheme}
      title={t("theme.toggle")}
      aria-label={t(isDark ? "theme.light" : "theme.dark")}
    >
      {isDark ? (
        <Sun size={17} strokeWidth={2} aria-hidden />
      ) : (
        <Moon size={17} strokeWidth={2} aria-hidden />
      )}
    </CircleIconButton>
  );
}
