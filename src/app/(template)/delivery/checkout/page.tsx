import { Suspense } from "react";
import { OrderCheckout } from "@/components/checkout/OrderCheckout";

export const metadata = {
  title: "Delivery checkout — Handiman",
  description: "Choose a time, an address and how to pay for your delivery order.",
};

export default function Page() {
  return (
    /* `useSearchParams` inside `OrderCheckout` needs a Suspense boundary for
       the static export to prerender this route. */
    <Suspense>
      <OrderCheckout kind="delivery" />
    </Suspense>
  );
}
