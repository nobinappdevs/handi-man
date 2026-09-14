import { GuestGuard } from "@/components/guards/GuestGuard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Vendor sign in — Handiman" };

// `role="vendor"` is what points this at `…/api/vendor/v1/vendors/login` and at
// the vendor session; without it the screen signs people into the customer API.
export default function Page() {
  return (
    <GuestGuard role="vendor">
      <LoginForm role="vendor" />
    </GuestGuard>
  );
}
