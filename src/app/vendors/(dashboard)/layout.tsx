import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Vendor dashboard — Handiman",
  description: "Manage your services, jobs and payouts.",
};

/*
 * The vendor dashboard's chrome — the SAME shell as the customer's. The rail
 * and header read the area off the URL (`areaFromPath`), so this layout passes
 * nothing: `/vendors/dashboard/*` gets the vendor nav, everything else gets the
 * customer nav.
 *
 * Sits on the route GROUP, not on the `dashboard` segment, so a future
 * `/vendors/<something-else>` inside this group is wrapped too.
 */
export default function VendorDashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
