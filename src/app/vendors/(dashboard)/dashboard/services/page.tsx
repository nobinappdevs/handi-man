import { PageShell } from "@/components/dashboard/PageShell";
import { VendorServices } from "@/components/dashboard/page/vendor/VendorServices";

export const metadata = { title: "Services — Handiman" };

export default function Page() {
  return (
    <PageShell page="vendorServices">
      <VendorServices />
    </PageShell>
  );
}
