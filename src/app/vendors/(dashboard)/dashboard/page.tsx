import { PageShell } from "@/components/dashboard/PageShell";
import { VendorOverview } from "@/components/dashboard/page/vendor/VendorOverview";

export const metadata = { title: "Vendor dashboard — Handiman" };

export default function Page() {
  return (
    <PageShell page="vendorOverview">
      <VendorOverview />
    </PageShell>
  );
}
