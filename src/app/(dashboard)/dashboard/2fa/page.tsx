import { PageShell } from "@/components/dashboard/PageShell";
import { Security } from "@/components/dashboard/page/security/Security";

export const metadata = { title: "Two-factor security — Handiman" };

export default function Page() {
  return (
    <PageShell page="twoFa">
      <Security />
    </PageShell>
  );
}
