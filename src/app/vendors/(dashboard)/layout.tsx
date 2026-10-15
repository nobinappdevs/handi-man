import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AuthGuard } from "@/components/guards/AuthGuard";

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
 *
 * `role="vendor"` is load-bearing: it checks the VENDOR session
 * (`handiman_vendor_token` against `…/api/vendor/v1/vendors/profile`) and sends
 * a failure to `/vendors/login`. Without it a signed-in customer would walk
 * straight into the vendor dashboard, and a vendor with no customer account
 * would be bounced to the wrong sign-in page.
 */
export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="vendor">
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
