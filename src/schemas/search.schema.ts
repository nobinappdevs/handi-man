import { z } from "zod";

/* ─────────────────────────── Service search ───────────────────────────
 * The hero band's state → city → keyword search. Every field is optional, as
 * on `GET /service/search`: no state means every state, no keyword means every
 * service, so an empty submit is a valid "show me everything".
 *
 * `state` and `city` hold ids (as strings, the `Select` value type).
 */
export const serviceSearchSchema = z.object({
  state: z.string(),
  city: z.string(),
  search: z.string().max(100),
});

export type ServiceSearchRequest = z.infer<typeof serviceSearchSchema>;
