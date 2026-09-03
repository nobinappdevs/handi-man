import { GuestGuard } from "@/components/guards/GuestGuard";

export const metadata = { title: "Vendor sign in — Handiman" };

/*
 * Vendor auth chrome.
 *
 * A layout rather than a guard per page, which is how the customer `(auth)`
 * group does it — there every page repeats `<GuestGuard>` itself. One boundary
 * for the whole group means a new vendor auth screen cannot be added without
 * the guard.
 */
export default function VendorAuthLayout({ children }) {
  return <GuestGuard>{children}</GuestGuard>;
}
