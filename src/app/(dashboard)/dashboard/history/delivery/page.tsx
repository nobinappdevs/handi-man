import { PageShell } from "@/components/dashboard/PageShell";
import { DeliveryLog } from "@/components/dashboard/page/history/DeliveryLog";

export const metadata = { title: "Delivery log — Handiman" };

export default function Page() {
  return (
    <PageShell page="deliveryHistory">
      <DeliveryLog />
    </PageShell>
  );
}
