"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { SERVICE_MENU } from "@/components/share/navLinks";
import { cn } from "@/components/ui/cn";

/**
 * The header's "Services" dropdown: the nine catalogue categories, each
 * jumping to its own section of `/services`.
 *
 * ── Interaction ──
 *
 * It opens on hover AND on click, because those serve different people. Hover
 * is what a pointer expects of a nav menu; click is what makes it usable from
 * a keyboard and from a touch device that reports as a fine pointer. Escape
 * closes and returns focus to the trigger, an outside click closes, and moving
 * the pointer away closes.
 *
 * The panel stays inside the wrapper's `onMouseLeave`, and the wrapper has no
 * gap between trigger and panel, so travelling down into the list never crosses
 * dead space that would snap it shut.
 *
 * `aria-expanded` + `aria-controls` on the trigger and a real `role="menu"` on
 * the list are what make this a menu to a screen reader rather than a div that
 * happens to contain links.
 */
export function ServicesMenu({
  href,
  label,
  active,
  className,
  onHover,
}: {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  /** Lets the header's sliding marker track this item like any plain link. */
  onHover?: () => void;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onPointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      /* The header measures this attribute to place its sliding marker, so the
         dropdown trigger is tracked exactly like a plain nav link. */
      data-nav-item={href}
      className="relative"
      onMouseEnter={() => {
        setOpen(true);
        onHover?.();
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="services-menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex cursor-pointer items-center gap-1.5",
          className,
          active || open ? "text-brand" : "text-heading hover:text-brand",
        )}
      >
        {label}
        <ChevronDown
          size={14}
          strokeWidth={2.4}
          aria-hidden
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* `top-full` with no offset: any gap here is dead space the pointer
          would cross on the way down, closing the menu under it. */}
      <div
        id="services-menu"
        role="menu"
        aria-label={label}
        hidden={!open}
        className="absolute start-0 top-full z-50 w-[268px] pt-3"
      >
        <div className="flex flex-col border border-border bg-card py-2 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)]">
          <span className="px-4 pt-2 pb-2.5 font-display text-[15px] font-bold tracking-[-0.01em] text-brand">
            {label}
          </span>

          {SERVICE_MENU.map(({ href: itemHref, key, icon: Icon }) => (
            <Link
              key={itemHref}
              href={itemHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3 px-4 py-2.5 text-[14px] leading-none font-semibold text-heading transition-colors hover:bg-brand/[0.07] hover:text-brand"
            >
              <Icon size={17} strokeWidth={2.1} aria-hidden className="flex-none text-brand" />
              <span className="min-w-0 flex-1 truncate">{t(key)}</span>
              <ChevronRight
                size={14}
                strokeWidth={2.4}
                aria-hidden
                className="flex-none text-muted transition-colors group-hover:text-brand rtl:rotate-180"
              />
            </Link>
          ))}

          {/* The categories are shortcuts; this is the whole catalogue. */}
          <Link
            href={href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-2 border-t border-border px-4 pt-3 pb-1.5 text-[13px] leading-none font-bold text-brand transition-opacity hover:opacity-70"
          >
            {t("nav.viewAllServices")}
          </Link>
        </div>
      </div>
    </div>
  );
}
