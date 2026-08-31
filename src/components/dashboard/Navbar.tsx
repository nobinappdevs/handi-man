"use client";

// Dashboard top bar. Structure is final; the visual design lands with the
// dashboard design.

import { Menu } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { ThemeToggle } from "@/components/share/ThemeToggle";
import { LanguageSwitcher } from "@/components/share/LanguageSwitcher";

export function Navbar({ onMenu }) {
  const { t } = useLang();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label={t("nav.menu")}
        className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:text-heading md:hidden"
      >
        <Menu size={20} aria-hidden />
      </button>

      <div className="ms-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
