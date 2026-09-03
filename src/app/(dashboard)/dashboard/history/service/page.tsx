import { Suspense } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { OrderHistory } from "@/components/dashboard/page/history/OrderHistory";

export const metadata = { title: "Service orders — Handiman" };

export default function Page() {
  return (
    <PageShell page="serviceHistory">
      {/* `useSearchParams` inside `OrderHistory` needs a Suspense boundary for
          the static export to prerender this route. */}
      <Suspense>
        <OrderHistory kind="service" />
      </Suspense>
    </PageShell>
  );
}
