import { GuestGuard } from "@/components/guards/GuestGuard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Create Account — Handiman" };

export default function Page() {
  return (
    <GuestGuard>
      <RegisterForm />
    </GuestGuard>
  );
}
