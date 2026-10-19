"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { pickupService } from "@/services/pickup.service";
import { readToken } from "@/lib/authState";
import { getApiErrorMessage } from "@/hooks/useAuth";
import { checkoutHref } from "@/hooks/useOrderCheckout";
import type { PickupRequest } from "@/schemas/pickup.schema";

/**
 * Step 1 → step 2 of a pickup. Saves the parcels and moves on to the shared
 * checkout (`useOrderCheckout`, kind "pickup") with the `identifier` the API
 * hands back. The form's `weight` is the API's `kg` (per unit).
 *
 * The session is checked BEFORE the request, as on the delivery form.
 */
export function useSubmitPickup() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: PickupRequest) => {
      if (!readToken("user")) throw new Error("signed-out");
      return pickupService.save(
        values.items.map((item) => ({
          name: item.name.trim(),
          quantity: item.quantity.trim(),
          kg: item.weight.trim(),
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
      router.push(checkoutHref("pickup", identifier));
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "signed-out") {
        toast.error("Please sign in to book a pickup.");
        router.push("/login");
        return;
      }
      toast.error(getApiErrorMessage(err));
    },
  });
}
