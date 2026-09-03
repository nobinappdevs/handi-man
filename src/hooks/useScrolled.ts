"use client";

import { useEffect, useState } from "react";

/**
 * `true` once the page is scrolled past `threshold`.
 *
 * A plain passive listener rather than a ScrollTrigger: this is a boolean state
 * flip, not motion, so it has nothing to scrub and no timeline to share. The
 * handler only touches React state when the boolean actually changes, so a long
 * scroll costs one render, not one per frame.
 *
 * Starts `false` so the server and the first client paint agree — a sticky
 * header must not render its scrolled chrome on a page that has not moved.
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const read = () => setScrolled(window.scrollY > threshold);
    read(); // a reload part-way down the page starts scrolled
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, [threshold]);

  return scrolled;
}
