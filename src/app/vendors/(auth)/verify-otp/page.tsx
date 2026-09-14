import { OtpForm } from "@/components/auth/OtpForm";

export const metadata = { title: "Verify code — Handiman" };

// Mid-flow screen: the vendor may already hold a token, so GuestGuard must NOT
// wrap this — the vendor OTP-flow keys in @/lib/authState gate it instead.
export default function Page() {
  return <OtpForm role="vendor" />;
}
