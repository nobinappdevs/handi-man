import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard — Handiman",
  description: "Manage your bookings, jobs and account.",
};

/*
 * No `<AuthGuard>`. The dashboard is deliberately open to anyone — it is a
 * template preview with placeholder data and no real account behind it, so
 * gating it only hid the design behind a login nobody can complete.
 *
 * `AuthGuard` itself is untouched and still exported; put it back around
 * `<DashboardShell>` the moment these pages read a real session.
 */
export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
