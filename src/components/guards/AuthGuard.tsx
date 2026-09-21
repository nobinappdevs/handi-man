"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  readToken,
  startEmailOtpFlow,
  emailVerifiedFromResponse,
  twoFaStateFromResponse,
  type AuthRole,
} from "@/lib/authState";
import { useIsClient } from "@/hooks/useIsClient";
import { useProfile, authRoutes } from "@/hooks/useAuth";
import { useEmailVerificationRequired } from "@/hooks/useBasicSettings";

function Spinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <Loader2 size={28} strokeWidth={2} className="animate-spin text-primary" aria-label="Loading" />
    </div>
  );
}

/**
 * Protects authenticated areas: no token → login, unverified email → the OTP
 * screen, unanswered Google-2FA code → the authenticator screen.
 *
 * ── The only local input is the token ──
 * Everything else is read from `{base}/profile` on every check. There is no
 * cached `email_verified` or 2FA flag to go stale: flip a switch in the admin
 * panel and the next profile read — a reload, a navigation into this area, or
 * the tab regaining focus — acts on the new value. `useProfile` is configured
 * for exactly that (`staleTime: 0`, `refetchOnMount: "always"`,
 * `refetchOnWindowFocus: true`).
 *
 * The cost is a spinner while the first profile call is in flight, and that is
 * the honest trade: the alternative was trusting a localStorage value the user
 * could edit and the server could contradict.
 *
 * A token isn't proof of access, which is why the profile is consulted at all —
 * signup and an unverified login both hand one out so the OTP call can
 * authenticate.
 *
 * `role` picks which session is being asked about, and with it every
 * destination — a vendor with no token belongs at `/vendors/login`, not at the
 * customer one.
 *
 * This is routing, not security: a static export cannot check a session before
 * it renders. The real boundary is the API, which validates the bearer token on
 * every private call, and `lib/axios.ts`, which wipes the session on a 401.
 */
export function AuthGuard({
  children,
  role = "user",
}: {
  children: ReactNode;
  role?: AuthRole;
}) {
  const router = useRouter();
  const isClient = useIsClient();
  const routes = authRoutes(role);
  const authed = isClient ? Boolean(readToken(role)) : false;

  /*
   * Only one panel may be live at a time. Someone signed in as the OTHER
   * role who lands here - by typing the URL, or an old bookmark - is not a
   * signed-out visitor: sending them to a login page they would then have to
   * abandon is worse than simply taking them to the dashboard they do have.
   */
  const otherRole: AuthRole = role === "vendor" ? "user" : "vendor";
  const otherSession = isClient && !authed && Boolean(readToken(otherRole));
  // Site-wide switch: with email verification off the profile still reports
  // `email_verified: 0`, and without this every account would be sent to the
  // OTP screen forever.
  const { required: emailVerificationRequired } = useEmailVerificationRequired();

  const {
    data: profileRes,
    isError: profileFailed,
    isLoading: profileLoading,
    isFetching: profileFetching,
  } = useProfile(authed, role);

  /*
   * `null` = the server has not answered yet. Only two things resolve it: the
   * profile payload, or the request failing — in which case we cannot verify
   * anything and deny. A missing flag in an otherwise fine response also stays
   * `null`, and holds the spinner rather than guessing.
   */
  const verified = !emailVerificationRequired
    ? true
    : profileRes
      ? emailVerifiedFromResponse(profileRes)
      : profileFailed
        ? false
        : null;

  /*
   * Same rule for the authenticator step. Only "pending" blocks — an account
   * with no authenticator attached ("off") walks straight through.
   */
  const twoFa = profileRes ? twoFaStateFromResponse(profileRes) : null;

  /*
   * Is this answer final?
   *
   * `isLoading` alone is not enough: React Query reports it `false` the moment
   * any cached data exists, including a stale copy it is in the middle of
   * re-reading. Acting on that produced a redirect loop — verify the email,
   * land on the dashboard, get bounced back to the OTP screen by a cached
   * `email_verified: 0`, and only reach the dashboard by retyping the URL once
   * the refetch had quietly landed.
   *
   * So a DENIAL is provisional until the request in flight settles. Being let
   * IN on a stale-but-previously-valid copy is harmless — the refetch will
   * redirect a moment later if the server disagrees — but being thrown OUT on
   * one is a loop, so only that direction waits.
   */
  const settled = !profileLoading && !profileFetching;

  useEffect(() => {
    if (!isClient) return;
    if (!authed) {
      router.replace(otherSession ? authRoutes(otherRole).dashboard : routes.login);
      return;
    }
    if (!settled) return;
    if (verified === false) {
      startEmailOtpFlow("login", undefined, role);
      router.replace(routes.verifyOtp);
      return;
    }
    if (verified === true && twoFa === "pending") router.replace(routes.verify2fa);
  }, [isClient, authed, otherSession, otherRole, settled, verified, twoFa, router, role, routes]);

  // Server + first client paint render the same spinner (no hydration
  // mismatch). Past that, the app shows only once the profile has come back and
  // says this session is verified and owes no authenticator code — `verified`
  // is `null` until it answers, so the loading case falls out of this test
  // without a separate check.
  if (!isClient || !authed || verified !== true || twoFa === "pending") {
    return <Spinner />;
  }
  return <>{children}</>;
}
