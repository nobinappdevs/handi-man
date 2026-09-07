"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query from JS.
 *
 * Only for the cases CSS genuinely cannot reach — the charts thin their x-axis
 * labels by DROPPING elements on a narrow screen, and a label that is merely
 * `display:none` still counts against the ones left. Anything you can express
 * as a class (`min-[760px]:grid`) belongs in a class, not here.
 *
 * Returns `false` on the server and on the first client render, like
 * `useIsClient`, so a static export hydrates without a mismatch and settles on
 * the real answer straight after.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
