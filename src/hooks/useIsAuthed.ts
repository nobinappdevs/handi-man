"use client";

import { TOKEN_KEY } from "@/lib/axios";
import { useIsClient } from "@/hooks/useIsClient";

/**
 * Whether a session token is stored — for chrome that changes shape when
 * someone is signed in.
 *
 * Returns `false` on the server AND on the first client render, because the
 * token lives in `localStorage` and a static export prerenders with no idea who
 * is looking. So the logged-OUT branch is what gets baked into the HTML, and a
 * signed-in visitor sees it swap one frame after hydration. That is the right
 * way round for a public page: most visitors are logged out, and the flash is
 * on the rarer case.
 *
 * This is presentation only. It says "show the dashboard link", never "let them
 * in" — `AuthGuard` is what actually protects a route, and it checks the token
 * against `/user/profile` rather than trusting its presence.
 */
export function useIsAuthed(): boolean {
  const isClient = useIsClient();
  if (!isClient) return false;
  try {
    return Boolean(window.localStorage.getItem(TOKEN_KEY));
  } catch {
    /* Private mode can throw on access. Treat it as signed out. */
    return false;
  }
}
