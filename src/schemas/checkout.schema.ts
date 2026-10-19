import { z } from "zod";

/* ─────────────────────────── Order checkout ───────────────────────────
 * The `/delivery/checkout` and `/pickup/checkout` pages, sent to
 * `POST /user/{kind}/checkout`.
 * `schedule_date` and `schedule_time` are picked in a dialog, `address` is a
 * saved address's id, and the three "delivery address" fields are typed in.
 * An online payment also needs a gateway currency (or the wallet).
 */
export const orderCheckoutSchema = z
  .object({
    schedule_date: z.string().min(1, "Choose a date"),
    schedule_time: z.string().min(1, "Choose a time"),
    address: z.string().min(1, "Choose an address"),
    shortaddress: z.string().trim().min(2, "Enter the address").max(255),
    fulladdress: z.string().trim().max(500).optional(),
    phone: z
      .string()
      .trim()
      .min(6, "Enter a valid phone number")
      .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
    payment_type: z.string().min(1, "Choose how to pay"),
    currency: z.string().optional(),
  })
  .refine((v) => v.payment_type !== "online_payment" || Boolean(v.currency), {
    message: "Choose a payment option",
    path: ["currency"],
  });

export type OrderCheckoutRequest = z.infer<typeof orderCheckoutSchema>;

/* ─────────────────────────── Service checkout ───────────────────────────
 * The `/services/checkout` page, sent to `POST /user/service/checkout` with
 * the cart as `card_info`. No contact block - the service is done at the
 * chosen saved address.
 */
export const serviceCheckoutSchema = z
  .object({
    schedule_date: z.string().min(1, "Choose a date"),
    schedule_time: z.string().min(1, "Choose a time"),
    address: z.string().min(1, "Choose an address"),
    payment_type: z.string().min(1, "Choose how to pay"),
    currency: z.string().optional(),
  })
  .refine((v) => v.payment_type !== "online_payment" || Boolean(v.currency), {
    message: "Choose a payment option",
    path: ["currency"],
  });

export type ServiceCheckoutRequest = z.infer<typeof serviceCheckoutSchema>;
