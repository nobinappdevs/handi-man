import { z } from "zod";

/* ─────────────────────────── Pickup request ───────────────────────────
 * The `/pickup` form: a rider collects parcels from your door and sends them
 * on, so each row is something you already have — a name, how many, and what
 * it weighs.
 *
 * Field names are a first guess at the Laravel payload — confirm them against
 * the Handiman API collection when the pickup endpoint is documented, then add
 * `services/pickup.service.ts` + `hooks/usePickup.ts` behind it.
 *
 * Numbers are held as strings for the same reason as in the delivery schema:
 * an empty numeric input coerces to `NaN` and reports "expected number,
 * received nan" at the user, which is not a sentence anyone should read.
 */

/** Up to two decimals — 0.5 kg is a real parcel, 0 is not. */
const WEIGHT = /^\d{1,4}(\.\d{1,2})?$/;

export const pickupItemSchema = z.object({
  name: z.string().trim().min(2, "Enter the product name"),
  quantity: z
    .string()
    .trim()
    .min(1, "Enter a quantity")
    .refine((v) => /^\d{1,4}$/.test(v) && Number(v) > 0, "Quantity must be 1 or more"),
  weight: z
    .string()
    .trim()
    .min(1, "Enter a weight")
    .refine((v) => WEIGHT.test(v) && Number(v) > 0, "Enter a weight like 2.5"),
});

export const pickupRequestSchema = z.object({
  items: z.array(pickupItemSchema).min(1, "Add at least one product"),
  note: z.string().trim().max(1000, "Keep the note under 1000 characters").optional(),
});

export type PickupItem = z.infer<typeof pickupItemSchema>;
export type PickupRequest = z.infer<typeof pickupRequestSchema>;

/** A fresh row for the "add product" button and the form's initial state. */
export const EMPTY_PICKUP_ITEM: PickupItem = {
  name: "",
  quantity: "1",
  weight: "",
};
