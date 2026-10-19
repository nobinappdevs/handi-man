import { z } from "zod";

/* ─────────────────────────── Contact request ───────────────────────────
 * POST /web/contact/message/submit — the contact section's form. Field names
 * and limits are the collection's: `first_name` / `last_name` (max 255),
 * `email` (max 255), `message` (max 5000), all required.
 */
export const contactRequestSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(255),
  last_name: z.string().trim().min(1, "Last name is required").max(255),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Please write a message").max(5000),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
