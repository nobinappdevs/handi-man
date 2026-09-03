import { PageShell } from "@/components/dashboard/PageShell";
import { Kyc } from "@/components/dashboard/page/kyc/Kyc";

export const metadata = { title: "Identity verification — Handiman" };

export default function Page() {
  return (
    <PageShell page="kyc">
      <Kyc />
    </PageShell>
  );
}
