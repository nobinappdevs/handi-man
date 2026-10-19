import { Suspense } from "react";
import { ServiceDetail } from "@/components/services/ServiceDetail";

export const metadata = {
  title: "Service — Handiman",
  description: "Service details, reviews and booking.",
};

export default function Page() {
  return (
    /* `useSearchParams` inside `ServiceDetail` needs a Suspense boundary for
       the static export to prerender this route. */
    <Suspense>
      <ServiceDetail />
    </Suspense>
  );
}
