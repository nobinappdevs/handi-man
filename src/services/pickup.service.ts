import { privateApi } from "@/lib/axios";

/**
 * POST /user/pickup/save - the parcels to collect → an `identifier` ("PO…")
 * that the checkout (`orderCheckout.service`, kind "pickup") takes.
 *
 * Parallel arrays again (`name[]`, `quantity[]`, `kg[]`). `kg` is the weight
 * of ONE unit, as the form asks for it.
 */

export interface PickupItemPayload {
  name: string;
  quantity: string;
  kg: string;
}

export const pickupService = {
  async save(items: PickupItemPayload[], details: string): Promise<{ data: { identifier?: string } }> {
    const form = new FormData();
    for (const item of items) {
      (Object.keys(item) as (keyof PickupItemPayload)[]).forEach((key) => form.append(`${key}[]`, item[key]));
    }
    form.append("details", details);
    const res = await privateApi.post("/user/pickup/save", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default pickupService;
