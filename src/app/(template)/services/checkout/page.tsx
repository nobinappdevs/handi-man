import { ServiceCheckout } from "@/components/services/ServiceCheckout";

export const metadata = {
  title: "Book services — Handiman",
  description: "Pick a time, an address and how to pay for the services in your cart.",
};

export default function Page() {
  return <ServiceCheckout />;
}
