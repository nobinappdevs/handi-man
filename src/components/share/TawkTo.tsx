"use client";

import { useEffect } from "react";
import { useTawkTo } from "@/hooks/useBasicSettings";

/**
 * tawk.to live-chat widget, switched on and keyed from the backend
 * (`/basic/settings` → `tawk_to`). Renders nothing itself — the script draws
 * its own floating bubble.
 *
 * Mounted once in the root layout, inside `QueryProvider` (it reads the
 * settings query), so the bubble follows the visitor across every page.
 *
 * ── Loading ──
 * The script is ~100KB and pulls in more, none of it needed for the first
 * screen. It is injected only after the page has finished loading and the
 * browser is idle, so it never competes with the hero for bandwidth or the
 * main thread (LCP — blueprint §6.5).
 *
 * ── Switching off ──
 * tawk.to cannot be unloaded once injected. If the admin turns it off while a
 * tab is open, the widget is hidden through its own API rather than torn out.
 */

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

/* Module-level so remounts (StrictMode, route changes) never inject twice —
   tawk.to renders a second bubble if its script runs again. */
let injected = false;

function injectScript(propertyId: string, widgetId: string) {
  if (injected) return;
  injected = true;
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`;
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");
  document.body.appendChild(script);
}

/** Runs `cb` once the page has loaded and the main thread is idle. */
function whenIdleAfterLoad(cb: () => void): () => void {
  let idleId: number | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(cb, { timeout: 4000 });
    } else {
      timerId = setTimeout(cb, 1500);
    }
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    window.removeEventListener("load", schedule);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timerId !== undefined) clearTimeout(timerId);
  };
}

export function TawkTo() {
  const { enabled, propertyId, widgetId } = useTawkTo();

  useEffect(() => {
    if (!enabled) {
      if (injected) window.Tawk_API?.hideWidget?.();
      return;
    }
    if (injected) {
      window.Tawk_API?.showWidget?.();
      return;
    }
    return whenIdleAfterLoad(() => injectScript(propertyId, widgetId));
  }, [enabled, propertyId, widgetId]);

  return null;
}
