import { GuestGuard } from "@/components/guards/GuestGuard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign In — Handiman" };

export default function Page() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}
