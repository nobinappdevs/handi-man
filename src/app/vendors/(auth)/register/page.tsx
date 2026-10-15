import { GuestGuard } from "@/components/guards/GuestGuard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Become a vendor — Handiman" };

export default function Page() {
  return (
    <GuestGuard role="vendor">
      <RegisterForm role="vendor" />
    </GuestGuard>
  );
}
