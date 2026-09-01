import { z } from "zod";

/* ─────────────────────────── Newsletter ───────────────────────────
 * The footer's subscribe box. Field names are a first guess at the Laravel
 * payload — confirm them against the Handiman API collection when the
 * newsletter endpoint is documented, then add
 * `services/newsletter.service.ts` + `hooks/useNewsletter.ts` behind it.
 *
 * The design's own mock has no validation at all (a click always "succeeds"),
 * but an unchecked email would silently fail once a real endpoint is behind
 * it, so a valid email is required here.
 */
export const newsletterSchema = z.object({
  name: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type NewsletterRequest = z.infer<typeof newsletterSchema>;
