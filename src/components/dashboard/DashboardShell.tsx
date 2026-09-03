"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";

/**
 * App chrome: rail beside a header + main column.
 *
 * The ONLY viewport state in JS is `drawer`, and it only means anything below
 * 1024 — every other responsive step in here is CSS. That is deliberate: the
 * design's own prototype re-rendered the whole tree on `window.resize`, which
 * is fine for a canvas and wrong for a static export (it would ship a layout
 * that flashes its mobile form on first paint, before the resize handler has
 * ever run).
 *
 * `min-w-0` on the main column is load-bearing — without it the table's widest
 * row sets the column width and the whole page scrolls sideways.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="flex min-h-screen items-stretch bg-page text-body">
      {drawer && (
        <div
          aria-hidden
          onClick={() => setDrawer(false)}
          className="fixed inset-0 z-40 bg-[rgba(6,4,4,0.55)] lg:hidden"
        />
      )}

      <Sidebar drawer={drawer} onNavigate={() => setDrawer(false)} />

      <div className="flex min-w-0 flex-auto flex-col">
        <Navbar onMenu={() => setDrawer(true)} />
        {children}
      </div>
    </div>
  );
}
