import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "New password — Handiman" };

// Mid-flow screen: the user may already hold a token, so GuestGuard must NOT
// wrap this — the OTP flow keys in @/lib/authState gate it instead.
export default function Page() {
  return <ResetPasswordForm />;
}
