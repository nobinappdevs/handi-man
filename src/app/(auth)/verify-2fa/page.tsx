import { TwoFactorForm } from "@/components/auth/TwoFactorForm";

export const metadata = { title: "Two-factor verification — Handiman" };

// Mid-flow screen: the session holds a real token and owes an authenticator
// code, so GuestGuard must NOT wrap this — it would read "logged in" and bounce
// the user to a dashboard that AuthGuard sends straight back here.
export default function Page() {
  return <TwoFactorForm />;
}
