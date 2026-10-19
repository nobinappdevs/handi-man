import { privateApi } from "@/lib/axios";

/**
 * POST /user/delivery/save - a shop-and-deliver item list → an `identifier`
 * ("DO…") that the checkout (`orderCheckout.service`, kind "delivery") takes.
 *
 * The items go as parallel arrays (`name[]`, `quantity[]`, …), the Laravel
 * way, so this is form data with one entry per item per field.
 */

export interface DeliveryItemPayload {
  name: string;
  brand_name: string;
  size: string;
  price: string;
  quantity: string;
  shop: string;
  shop_address: string;
}

export const deliveryService = {
  async save(items: DeliveryItemPayload[], details: string): Promise<{ data: { identifier?: string } }> {
    const form = new FormData();
    for (const item of items) {
      (Object.keys(item) as (keyof DeliveryItemPayload)[]).forEach((key) => form.append(`${key}[]`, item[key]));
    }
    form.append("details", details);
    const res = await privateApi.post("/user/delivery/save", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default deliveryService;
