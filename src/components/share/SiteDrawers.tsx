"use client";

import { useShell } from "@/components/context/ShellContext";
import { CartDrawer } from "@/components/share/CartDrawer";
import { MobileMenu } from "@/components/share/MobileMenu";

/**
 * The shared backdrop plus both slide-overs. Mounted once in the public
 * layout — the drawers stay in the tree and animate on `transform`, so the
 * scrim is what has to toggle `pointer-events`.
 */
export function SiteDrawers() {
  const { drawer, closeDrawer } = useShell();
  const open = drawer !== null;

  return (
    <>
      <div
        aria-hidden
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-[rgba(10,9,8,0.55)] transition-opacity duration-[280ms] ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <CartDrawer />
      <MobileMenu />
    </>
  );
}
