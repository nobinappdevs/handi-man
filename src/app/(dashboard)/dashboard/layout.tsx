import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AuthGuard } from "@/components/guards/AuthGuard";

export const metadata = {
  title: "Dashboard — Handiman",
  description: "Manage your bookings, jobs and account.",
};

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
