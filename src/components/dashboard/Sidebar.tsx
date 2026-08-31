"use client";

// Dashboard sidebar: off-canvas drawer on mobile, 56px icon rail on tablet,
// 260px full rail on desktop (collapsible). Nav items are placeholders until
// the dashboard design + API are provided — the shell behaviour is final.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, User, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-50 flex w-[260px] flex-col border-e border-border bg-card transition-transform",
        "md:sticky md:top-0 md:h-screen md:translate-x-0",
        collapsed ? "lg:w-[56px]" : "lg:w-[260px]",
        "md:w-[56px]",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <Link href="/" className="truncate text-base font-bold text-heading">
          {collapsed ? t("brand.name").charAt(0) : t("brand.name")}
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted md:hidden"
        >
          <X size={18} aria-hidden />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={t("nav.menu")}
          className="hidden h-8 w-8 place-items-center rounded-lg text-muted lg:grid"
        >
          {collapsed ? <PanelLeftOpen size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "mb-1 flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                active ? "bg-primary/10 text-primary" : "text-muted hover:text-heading",
              )}
            >
              <Icon size={18} strokeWidth={2} aria-hidden className="shrink-0" />
              <span className={cn("truncate", collapsed && "lg:hidden", "md:hidden lg:inline")}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
