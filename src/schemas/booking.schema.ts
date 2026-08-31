import { z } from "zod";

/* ─────────────────────────── Quick booking ───────────────────────────
 * The hero band's four-field request form. Field names are a first guess at
 * the Laravel payload — confirm them against the Handiman API collection when
 * the booking endpoint is documented, then add
 * `services/booking.service.ts` + `hooks/useBooking.ts` behind it.
 */
export const quickBookingSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  city: z.string().min(1, "Choose a city"),
  service: z.string().min(1, "Choose a service"),
});

export type QuickBookingRequest = z.infer<typeof quickBookingSchema>;
