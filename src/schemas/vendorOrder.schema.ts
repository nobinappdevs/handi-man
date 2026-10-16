import { z } from "zod";

/* ─────────────────────────── Reject a service order ───────────────────────────
 * `POST /vendors/order/rejected` requires `reject_reason`, and the customer
 * reads it on their side of the order - so it is asked for, not defaulted.
 */
export const rejectOrderSchema = z.object({
  reject_reason: z
    .string()
    .trim()
    .min(3, "Tell the customer why")
    .max(255, "Keep it under 255 characters"),
});

export type RejectOrderRequest = z.infer<typeof rejectOrderSchema>;
