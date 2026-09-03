import { PageShell } from "@/components/dashboard/PageShell";
import { MoneyOut } from "@/components/dashboard/page/vendor/MoneyOut";

export const metadata = { title: "Money out — Handiman" };

export default function Page() {
  return (
    <PageShell page="moneyOut">
      <MoneyOut />
    </PageShell>
  );
}
