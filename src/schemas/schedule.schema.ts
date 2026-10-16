import { z } from "zod";

/* ─────────────────────────── Vendor schedule ───────────────────────────
 * The two forms on the vendor's Service Schedule page.
 */

/** "HH:mm" - what an `<input type="time">` holds and what the API takes. */
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/* A slot. The API refuses an end before the start; checked here too, so the
   vendor hears it next to the field instead of in a toast. */
export const scheduleSlotSchema = z
  .object({
    start_time: z.string().regex(TIME, "Pick a start time"),
    end_time: z.string().regex(TIME, "Pick an end time"),
  })
  .refine((v) => !TIME.test(v.start_time) || !TIME.test(v.end_time) || minutes(v.end_time) > minutes(v.start_time), {
    message: "End time should be after start time",
    path: ["end_time"],
  });

export type ScheduleSlotRequest = z.infer<typeof scheduleSlotSchema>;

/** The longest booking window offered - a year ahead. */
export const BOOKING_DAYS_MAX = 365;

/* How many days ahead customers can book. A string - the stepper's box - so an
   empty field says "enter a number", not "expected number, received nan". */
export const bookingDaysSchema = z.object({
  days: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter a whole number of days")
    .refine((v) => Number(v) >= 1 && Number(v) <= BOOKING_DAYS_MAX, `Between 1 and ${BOOKING_DAYS_MAX} days`),
});

export type BookingDaysRequest = z.infer<typeof bookingDaysSchema>;
