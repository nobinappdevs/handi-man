import { PageShell } from "@/components/dashboard/PageShell";
import { Profile } from "@/components/dashboard/page/profile/Profile";

export const metadata = { title: "Vendor profile — Handiman" };

/*
 * The vendor's account screen — the same component the customer gets, pointed
 * at `/vendors/profile/*` on the vendor API root.
 *
 * `role="vendor"` decides which account is read AND written: the details form,
 * the password change and the delete-account action all follow it. Without it
 * a vendor would be editing whichever customer is signed in to this browser.
 */
export default function Page() {
  return (
    <PageShell page="vendorProfile">
      <Profile role="vendor" />
    </PageShell>
  );
}
