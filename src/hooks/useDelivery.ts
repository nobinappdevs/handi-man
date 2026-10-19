"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deliveryService } from "@/services/delivery.service";
import { readToken } from "@/lib/authState";
import { getApiErrorMessage } from "@/hooks/useAuth";
import { checkoutHref } from "@/hooks/useOrderCheckout";
import type { DeliveryRequest } from "@/schemas/delivery.schema";

/**
 * Step 1 → step 2 of a delivery. Saves the item list and moves on to the
 * shared checkout (`useOrderCheckout`, kind "delivery") with the `identifier`
 * the API hands back.
 *
 * The session is checked BEFORE the request: a signed-out visitor would
 * otherwise be thrown to the login page by the 401 handler after typing the
 * whole list, without a word as to why.
 */
export function useSubmitDelivery() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: DeliveryRequest) => {
      if (!readToken("user")) throw new Error("signed-out");
      return deliveryService.save(
        values.items.map((item) => ({
          name: item.name.trim(),
          brand_name: item.brand?.trim() ?? "",
          size: item.size?.trim() ?? "",
          price: item.price?.trim() ?? "",
          quantity: item.quantity.trim(),
          shop: item.shop?.trim() ?? "",
          shop_address: item.shop_address?.trim() ?? "",
        })),
        values.note?.trim() ?? "",
      );
    },
    onSuccess: (res) => {
      const identifier = res.data?.identifier;
      if (!identifier) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      router.push(checkoutHref("delivery", identifier));
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "signed-out") {
        toast.error("Please sign in to place a delivery order.");
        router.push("/login");
        return;
      }
      toast.error(getApiErrorMessage(err));
    },
  });
}
