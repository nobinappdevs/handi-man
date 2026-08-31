import { GuestGuard } from "@/components/guards/GuestGuard";
import { PagePlaceholder } from "@/components/share/PagePlaceholder";

export const metadata = { title: "Reset Password — Handiman" };

export default function Page() {
  return (
    <GuestGuard>
      <PagePlaceholder title="Reset password" />
    </GuestGuard>
  );
}
