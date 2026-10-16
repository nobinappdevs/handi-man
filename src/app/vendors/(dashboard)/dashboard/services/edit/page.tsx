import { Suspense } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { ServiceEdit } from "@/components/dashboard/page/vendor/ServiceEdit";

export const metadata = { title: "Edit service — Handiman" };

export default function Page() {
  return (
    <PageShell page="vendorServiceEdit">
      {/* `useSearchParams` inside `ServiceEdit` needs a Suspense boundary for
          the static export to prerender this route. */}
      <Suspense>
        <ServiceEdit />
      </Suspense>
    </PageShell>
  );
}
