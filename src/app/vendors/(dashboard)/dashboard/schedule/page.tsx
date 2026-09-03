import { PageShell } from "@/components/dashboard/PageShell";
import { VendorSchedule } from "@/components/dashboard/page/vendor/VendorSchedule";

export const metadata = { title: "Service schedule — Handiman" };

export default function Page() {
  return (
    <PageShell page="vendorSchedule">
      <VendorSchedule />
    </PageShell>
  );
}
