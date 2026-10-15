"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

/**
 * Google reCAPTCHA v2 checkbox.
 *
 * Usage: gate visibility on `useRecaptcha().enabled`, pass the `siteKey`, read
 * the token from `onVerify`, and bump `resetSignal` after a failed submit —
 * a token is single-use, so a retry against a stale one always fails.
 *
 * Rendered explicitly rather than by Google's auto-scan: the widget has to
 * appear and disappear with a flag that arrives after the page has already
 * hydrated, and auto-render only looks at the DOM once on script load.
 */

declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      reset: (id?: number) => void;
      ready?: (cb: () => void) => void;
    };
  }
}

/*
 * One script for the whole app, however many widgets mount. The promise is
 * module-level so a second form does not append a second <script> — Google's
 * API throws if it is loaded twice.
 */
let scriptPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha?.render) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function Recaptcha({
  siteKey,
  onVerify,
  resetSignal = 0,
  className = "",
}: {
  siteKey: string;
  onVerify: (token: string) => void;
  /** Increment to clear the widget (e.g. after a failed submit). */
  resetSignal?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const { theme } = useTheme();

  // Keep the newest callback without making it a render dependency — the widget
  // must not be torn down and rebuilt every time the parent re-renders.
  const onVerifyRef = useRef(onVerify);
  useEffect(() => {
    onVerifyRef.current = onVerify;
  });

  useEffect(() => {
    let cancelled = false;
    loadRecaptchaScript()
      .then(() => {
        const grecaptcha = window.grecaptcha;
        const render = () => {
          // `widgetId !== null` guards against a double render in StrictMode.
          if (cancelled || !grecaptcha?.render || !containerRef.current) return;
          if (widgetId.current !== null) return;
          widgetId.current = grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            theme: theme === "dark" ? "dark" : "light",
            callback: (token: string) => onVerifyRef.current(token),
            // Both of these hand back an empty token on purpose: the parent
            // treats "" as unsolved, so an expired challenge re-blocks submit.
            "expired-callback": () => onVerifyRef.current(""),
            "error-callback": () => onVerifyRef.current(""),
          });
        };
        if (grecaptcha?.ready) grecaptcha.ready(render);
        else render();
      })
      .catch(() => {
        /* Offline or blocked — the form still reports "please complete". */
      });
    return () => {
      cancelled = true;
    };
    // Theme is read once at render time; re-theming mid-session is not worth
    // destroying a solved challenge for.
  }, [siteKey, theme]);

  useEffect(() => {
    // Skip the mount run — there is nothing to reset yet.
    if (resetSignal === 0) return;
    if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
  }, [resetSignal]);

  return <div ref={containerRef} className={className} />;
}
