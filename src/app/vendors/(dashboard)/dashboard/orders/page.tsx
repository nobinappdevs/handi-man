import { PageShell } from "@/components/dashboard/PageShell";
import { VendorOrders } from "@/components/dashboard/page/vendor/VendorOrders";

export const metadata = { title: "Service orders — Handiman" };

export default function Page() {
  return (
    <PageShell page="vendorOrders">
      <VendorOrders />
    </PageShell>
  );
}
