import { z } from "zod";

/* ─────────────────────────── Contact request ───────────────────────────
 * The contact section's form. Field names are a first guess at the Laravel
 * payload — confirm them against the Handiman API collection when the contact
 * endpoint is documented, then add `services/contact.service.ts` +
 * `hooks/useContact.ts` behind it.
 *
 * Only the name is marked required in the design (`Full Name*`), but an email
 * is needed to reply at all, so it is required here too.
 */
export const contactRequestSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
  service: z.string().min(1, "Choose a service"),
  message: z.string().min(10, "Please describe the job in a little more detail"),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
