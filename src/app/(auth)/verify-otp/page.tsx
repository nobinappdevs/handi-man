import { OtpForm } from "@/components/auth/OtpForm";

export const metadata = { title: "Verify code — Handiman" };

// Mid-flow screen: the user may already hold a token, so GuestGuard must NOT
// wrap this — the OTP flow keys in @/lib/authState gate it instead.
export default function Page() {
  return <OtpForm />;
}
