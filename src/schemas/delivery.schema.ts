import { z } from "zod";

/* ─────────────────────────── Delivery request ───────────────────────────
 * The `/delivery` shop-and-deliver form: a rider buys the listed items and
 * brings them over, so the order is a LIST of items rather than one parcel.
 *
 * Field names are a first guess at the Laravel payload — confirm them against
 * the Handiman API collection when the delivery endpoint is documented, then
 * add `services/delivery.service.ts` + `hooks/useDelivery.ts` behind it.
 *
 * `price` is a string, not a coerced number. A number field turns an empty
 * optional input into `NaN` and reports "expected number, received nan" at the
 * user, which is not a sentence anyone should read. It is validated as a money
 * string here and parsed only where a total is shown.
 */

/** Up to two decimals, no thousands separators. Empty is allowed — it is the optional estimate. */
const MONEY = /^\d{1,9}(\.\d{1,2})?$/;

export const orderItemSchema = z.object({
  name: z.string().trim().min(2, "Enter the item name"),
  brand: z.string().trim().optional(),
  size: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .refine((v) => v === "" || MONEY.test(v), "Enter an amount like 24.99")
    .optional(),
  /* A string, because the input is text: `<input type="number">` on a phone
     still yields "" for an empty field and "1e5" for a paste. */
  quantity: z
    .string()
    .trim()
    .min(1, "Enter a quantity")
    .refine((v) => /^\d{1,4}$/.test(v) && Number(v) > 0, "Quantity must be 1 or more"),
  shop: z.string().trim().optional(),
  shop_address: z.string().trim().optional(),
});

export const deliveryRequestSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Add at least one item"),
  note: z.string().trim().max(1000, "Keep the note under 1000 characters").optional(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type DeliveryRequest = z.infer<typeof deliveryRequestSchema>;

/** A fresh row for the "add item" button and the form's initial state. */
export const EMPTY_ORDER_ITEM: OrderItem = {
  name: "",
  brand: "",
  size: "",
  price: "",
  quantity: "1",
  shop: "",
  shop_address: "",
};
