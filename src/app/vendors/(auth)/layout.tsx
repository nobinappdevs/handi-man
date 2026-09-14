import type { ReactNode } from "react";

export const metadata = { title: "Vendor sign in — Handiman" };

/*
 * Vendor auth chrome — and deliberately no guard.
 *
 * A group-level `<GuestGuard>` looked like the tidier version of the customer
 * `(auth)` group, but it cannot work here: half of these screens are mid-flow.
 * `verify-otp`, `verify-2fa` and `reset-password` are reached while the vendor
 * already holds a real token — register and an unverified login both issue one
 * so the verify call can authenticate — so a guest guard reads them as "logged
 * in" and bounces them to a dashboard that has to send them straight back.
 *
 * So the guard sits per page, exactly as it does under `src/app/(auth)`:
 * `<GuestGuard role="vendor">` on login/register/forgot-password, and nothing
 * on the three mid-flow screens, which are gated by the vendor OTP-flow keys in
 * `lib/authState.ts` instead.
 */
export default function VendorAuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
