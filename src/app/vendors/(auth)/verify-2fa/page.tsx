import { TwoFactorForm } from "@/components/auth/TwoFactorForm";

export const metadata = { title: "Two-factor verification — Handiman" };

// Mid-flow screen: the vendor session holds a real token and owes an
// authenticator code, so GuestGuard must NOT wrap this — it would read
// "logged in" and bounce them to a dashboard AuthGuard sends straight back.
export default function Page() {
  return <TwoFactorForm role="vendor" />;
}
