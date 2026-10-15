"use client";

import { readToken, type AuthRole } from "@/lib/authState";
import { useIsClient } from "@/hooks/useIsClient";

/**
 * Which panel this browser is signed into — `"user"`, `"vendor"` or neither.
 *
 * ── One panel at a time ──
 * The two sessions have separate tokens (separate Laravel guards, separate API
 * roots), but the product rule is that only one may be live: signing in as a
 * vendor ends any customer session and vice versa, which `useLogin` and
 * `useRegister` enforce by clearing the other role on success.
 *
 * This is the single place that question is answered, so the header, the mobile
 * menu and both guards cannot disagree about it. `vendor` is checked first, so
 * a browser that somehow holds both (an older build, a hand-edited key) resolves
 * to one answer rather than flickering between two.
 *
 * `ready` is false on the server and on the first client render — tokens live in
 * localStorage, and a static export prerenders with no idea who is looking. Gate
 * any signed-in UI on it or the markup will not match on hydration.
 */
export function useActiveSession(): { role: AuthRole | null; ready: boolean } {
  const ready = useIsClient();
  if (!ready) return { role: null, ready: false };
  if (readToken("vendor")) return { role: "vendor", ready: true };
  if (readToken("user")) return { role: "user", ready: true };
  return { role: null, ready: true };
}
