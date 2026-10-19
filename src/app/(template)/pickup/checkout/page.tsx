import { Suspense } from "react";
import { OrderCheckout } from "@/components/checkout/OrderCheckout";

export const metadata = {
  title: "Pickup checkout — Handiman",
  description: "Choose a pickup time, an address and how to pay for your pickup.",
};

export default function Page() {
  return (
    /* `useSearchParams` inside `OrderCheckout` needs a Suspense boundary for
       the static export to prerender this route. */
    <Suspense>
      <OrderCheckout kind="pickup" />
    </Suspense>
  );
}
