import { z } from "zod";

/* ─────────────────────────── Service review ───────────────────────────
 * `POST /service/review` - one free-text impression of a service.
 */
export const reviewSchema = z.object({
  review: z
    .string()
    .trim()
    .min(3, "Write a few words about the service")
    .max(1000, "Keep it under 1000 characters"),
});

export type ReviewRequest = z.infer<typeof reviewSchema>;
