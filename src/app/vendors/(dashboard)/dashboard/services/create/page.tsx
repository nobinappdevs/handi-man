import { PageShell } from "@/components/dashboard/PageShell";
import { ServiceForm } from "@/components/dashboard/page/vendor/ServiceForm";

export const metadata = { title: "Add a service — Handiman" };

export default function Page() {
  return (
    <PageShell page="vendorServiceCreate">
      <ServiceForm serviceId={null} />
    </PageShell>
  );
}
