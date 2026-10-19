import { z } from "zod";

/* ─────────────────────────── Card payment ───────────────────────────
 * The Authorize.net card form. Typed with spaces and a slash for reading;
 * the hook strips them before sending.
 */

const digits = (v: string) => v.replace(/\D/g, "");

/** The Luhn checksum every card number carries - catches a mistyped digit
 *  before it costs a declined charge. */
function luhn(number: string) {
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let d = Number(number[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** "YY/MM", and not already in the past. */
function validExpiry(value: string) {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!m) return false;
  const year = 2000 + Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export const cardPaymentSchema = z.object({
  card_number: z
    .string()
    .refine((v) => /^\d{13,19}$/.test(digits(v)), "Enter the full card number")
    .refine((v) => luhn(digits(v)), "That card number is not valid"),
  date: z.string().refine(validExpiry, "Enter a valid expiry as YY / MM"),
  code: z.string().regex(/^\d{3,4}$/, "Enter the 3 or 4 digit code"),
});

export type CardPaymentRequest = z.infer<typeof cardPaymentSchema>;
