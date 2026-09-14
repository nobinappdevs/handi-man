import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "New vendor password — Handiman" };

// Mid-flow screen: gated by the vendor OTP-flow keys, not by GuestGuard.
export default function Page() {
  return <ResetPasswordForm role="vendor" />;
}
