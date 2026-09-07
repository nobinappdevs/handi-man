"use client";

import { useEffect, useRef } from "react";

/**
 * Closes a popover on a click outside it or on Escape, and hands back the ref
 * to hang on its wrapper.
 *
 * `pointerdown` rather than `click` so it fires BEFORE a link inside the
 * popover navigates away — on `click` the menu would still be open when the
 * next page mounted. It also gives the header's two dropdowns mutual
 * exclusion for free: opening one is a pointerdown outside the other.
 *
 * `close` is a dependency, so pass a stable callback or an inline arrow — the
 * React Compiler memoises the latter, and either way the listeners are only
 * bound while the popover is actually open.
 */
export function useDismiss<T extends HTMLElement = HTMLDivElement>(open: boolean, close: () => void) {
  const wrap = useRef<T>(null);

  useEffect(() => {
    if (!open) return;

    function onDown(e: PointerEvent) {
      if (!wrap.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return wrap;
}
