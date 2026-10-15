"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { readToken, type AuthRole } from "@/lib/authState";
import { useIsClient } from "@/hooks/useIsClient";
import { authRoutes } from "@/hooks/useAuth";

function Spinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <Loader2 size={28} strokeWidth={2} className="animate-spin text-primary" aria-label="Loading" />
    </div>
  );
}

/**
 * Guest-only pages (login/register/forgot): a signed-in session is sent to its
 * own dashboard.
 *
 * It asks one question — is there a token — and nothing else. It used to read
 * cached `email_verified` / 2FA flags to decide whether to route to the OTP or
 * authenticator screen instead; those are gone, and it does NOT fetch the
 * profile to replace them.
 *
 * That is deliberate. Everyone arriving here is about to be redirected to the
 * dashboard anyway, and `AuthGuard` asks the server the moment they land —
 * sending them on to `/verify-otp` if the account still owes a code. Fetching
 * the profile here as well would put a request in front of every visit to a
 * sign-in page to save one instant redirect that the user cannot perceive.
 *
 * So a half-verified session takes one extra hop (login → dashboard →
 * verify-otp), and every step of that decision is made from live API data.
 *
 * `role` matters as much as in `AuthGuard`: the vendor sign-in page must look
 * at the *vendor* session. Reading the customer one would lock every signed-in
 * customer out of registering as a vendor.
 */
export function GuestGuard({
  children,
  role = "user",
}: {
  children: ReactNode;
  role?: AuthRole;
}) {
  const router = useRouter();
  const isClient = useIsClient();
  const routes = authRoutes(role);
  /*
   * Gates on EITHER session, not just this role's.
   *
   * One panel at a time: a signed-in vendor opening /login is not a guest,
   * and letting them sign in as a customer would leave two live sessions.
   * They are sent to the dashboard they have; signing out is how you switch.
   */
  const otherRole: AuthRole = role === "vendor" ? "user" : "vendor";
  const authed = isClient ? Boolean(readToken(role)) : false;
  const otherSession = isClient ? Boolean(readToken(otherRole)) : false;
  const signedIn = authed || otherSession;

  useEffect(() => {
    if (!isClient || !signedIn) return;
    router.replace(authed ? routes.dashboard : authRoutes(otherRole).dashboard);
  }, [isClient, signedIn, authed, otherRole, router, routes]);

  // Server + first client paint render the same spinner (no hydration mismatch);
  // once mounted, show the page only for guests.
  if (!isClient || signedIn) return <Spinner />;
  return <>{children}</>;
}
