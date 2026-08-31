import { GuestGuard } from "@/components/guards/GuestGuard";
import { PagePlaceholder } from "@/components/share/PagePlaceholder";

export const metadata = { title: "Create Account — Handiman" };

export default function Page() {
  return (
    <GuestGuard>
      <PagePlaceholder title="Create account" />
    </GuestGuard>
  );
}
