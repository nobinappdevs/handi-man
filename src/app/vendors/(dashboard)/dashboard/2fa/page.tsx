import { PageShell } from "@/components/dashboard/PageShell";
import { Security } from "@/components/dashboard/page/security/Security";

export const metadata = { title: "Two-factor security — Handiman" };

/* The same screen the customer gets, pointed at the vendor's own authenticator:
   `/vendors/profile/google-2fa` on the vendor API root. Without `role` this
   would read and toggle the CUSTOMER account's 2FA — or 401, if the visitor has
   no customer session at all. */
export default function Page() {
  return (
    <PageShell page="vendorTwoFa">
      <Security role="vendor" />
    </PageShell>
  );
}
