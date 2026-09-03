import { PageShell } from "@/components/dashboard/PageShell";
import { Profile } from "@/components/dashboard/page/profile/Profile";

export const metadata = { title: "Profile — Handiman" };

export default function Page() {
  return (
    <PageShell page="profile">
      <Profile />
    </PageShell>
  );
}
