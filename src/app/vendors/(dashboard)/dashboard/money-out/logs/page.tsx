import { PageShell } from "@/components/dashboard/PageShell";
import { MoneyOutLogs } from "@/components/dashboard/page/vendor/MoneyOutLogs";

export const metadata = { title: "Money out logs — Handiman" };

export default function Page() {
  return (
    <PageShell page="moneyOutLogs">
      <MoneyOutLogs />
    </PageShell>
  );
}
