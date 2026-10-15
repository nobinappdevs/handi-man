"use client";

import { useProfile } from "@/hooks/useAuth";
import type { AuthRole } from "@/lib/authState";
import type { ProfileData } from "@/services/profile.service";

export type AccountIdentity = {
  /** "Rakib Hasan", or the username if the account has no name yet. */
  name: string;
  /** Single letter for the fallback avatar. Never empty. */
  initial: string;
  /** Absolute URL, or "" when the response carried no usable pieces. */
  avatarUrl: string;
  isLoading: boolean;
};

/**
 * Who is signed in, for chrome that shows it (the header's profile button).
 *
 * Reads the same `["profile", role]` query `AuthGuard` already fetched, so
 * inside a guarded area this costs no extra request — it is a selector over a
 * cache entry, not a second fetch.
 *
 * ── Building the avatar URL ──
 * The API returns pieces, never a URL (blueprint §14.3): a storage root, the
 * directory uploads live in, and a bare filename. An account with no upload
 * gets `default_image`, which already carries its own directory and so is
 * joined to the root alone.
 *
 * The root is spelled `base_ur` in this API — a typo on their side. `base_url`
 * is read as well, so a future correction does not silently blank every avatar.
 */
export function useAccountIdentity(role: AuthRole = "user"): AccountIdentity {
  const { data, isLoading } = useProfile(true, role);
  const profile = (data as { data?: ProfileData } | undefined)?.data;
  const user = profile?.user;

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  const name = fullName || user?.username || "";

  const base = profile?.base_ur ?? profile?.base_url ?? "";
  const avatarUrl =
    base && user?.image && profile?.image_path
      ? `${base}${profile.image_path}/${user.image}`
      : base && profile?.default_image
        ? `${base}${profile.default_image}`
        : "";

  return {
    name,
    // The letter is the fallback when there is no image, so it must survive an
    // account with neither a name nor a username.
    initial: (name.trim().charAt(0) || "U").toUpperCase(),
    avatarUrl,
    isLoading,
  };
}
