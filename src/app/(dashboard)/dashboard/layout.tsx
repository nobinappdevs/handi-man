import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AuthGuard } from "@/components/guards/AuthGuard";

export const metadata = {
  title: "Dashboard — Handiman",
  description: "Manage your bookings, jobs and account.",
};

/*
 * `<AuthGuard>` sits on the LAYOUT, not on each page — a new route added under
 * `/dashboard` is then protected by existing, rather than by remembering.
 *
 * It gates three things in order: no token → /login, unverified email →
 * /verify-otp, unanswered Google-2FA code → /verify-2fa. Until all three pass
 * it renders a spinner, so no dashboard markup reaches a signed-out visitor.
 *
 * This is routing, not security. A static export has no server to check a
 * session, so the real boundary is the API: every private endpoint validates
 * the bearer token, and `lib/axios.ts` wipes the session on a 401. The guard
 * keeps people out of screens that would only show them errors.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
