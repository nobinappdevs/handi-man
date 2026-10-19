import { z } from "zod";

/* ─────────────────────────── Newsletter ───────────────────────────
 * POST /web/subscribe — the footer's subscribe box. Both fields are required
 * by the API (max 255). The email is also `unique` server-side: subscribing
 * twice answers 422, which the hook surfaces as a toast.
 */
export const newsletterSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
});

export type NewsletterRequest = z.infer<typeof newsletterSchema>;
