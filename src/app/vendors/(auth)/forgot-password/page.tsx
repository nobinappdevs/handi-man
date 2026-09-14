import { GuestGuard } from "@/components/guards/GuestGuard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Reset vendor password — Handiman" };

export default function Page() {
  return (
    <GuestGuard role="vendor">
      <ForgotPasswordForm role="vendor" />
    </GuestGuard>
  );
}
