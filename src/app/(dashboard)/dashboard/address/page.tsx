import { PageShell } from "@/components/dashboard/PageShell";
import { Addresses } from "@/components/dashboard/page/address/Addresses";

export const metadata = { title: "My addresses — Handiman" };

export default function Page() {
  return (
    <PageShell page="address">
      <Addresses />
    </PageShell>
  );
}
