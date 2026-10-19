import { Suspense } from "react";
import { CardPayment } from "@/components/payment/CardPayment";

export const metadata = {
  title: "Pay with card — Handiman",
  description: "Complete your order's payment by card.",
};

export default function Page() {
  return (
    /* `useSearchParams` inside `CardPayment` needs a Suspense boundary for the
       static export to prerender this route. */
    <Suspense>
      <CardPayment />
    </Suspense>
  );
}
