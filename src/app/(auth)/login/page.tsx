import { GuestGuard } from "@/components/guards/GuestGuard";
import { PagePlaceholder } from "@/components/share/PagePlaceholder";

export const metadata = { title: "Sign In — Handiman" };

export default function Page() {
  return (
    <GuestGuard>
      <PagePlaceholder title="Sign in" />
    </GuestGuard>
  );
}
