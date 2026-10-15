import { PageShell } from "@/components/dashboard/PageShell";
import { PickupLog } from "@/components/dashboard/page/history/PickupLog";

export const metadata = { title: "Pickup log — Handiman" };

export default function Page() {
  return (
    <PageShell page="pickupHistory">
      <PickupLog />
    </PageShell>
  );
}
