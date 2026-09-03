import { PageShell } from "@/components/dashboard/PageShell";
import { Security } from "@/components/dashboard/page/security/Security";

export const metadata = { title: "Two-factor security — Handiman" };

/* The same screen the customer gets — one 2FA endpoint, one component. */
export default function Page() {
  return (
    <PageShell page="vendorTwoFa">
      <Security />
    </PageShell>
  );
}
