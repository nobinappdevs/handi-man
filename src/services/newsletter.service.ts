import { publicApi } from "@/lib/axios";
import { newsletterSchema, type NewsletterRequest } from "@/schemas/newsletter.schema";

/**
 * POST /web/subscribe — public, no auth.
 *
 * The collection's example responses for this endpoint are copies of the
 * contact form's, so the success wording is not documented; the hook shows
 * the API's `message.success` when there is one and its own copy otherwise.
 */
export const newsletterService = {
  async subscribe(payload: NewsletterRequest & { recaptchaToken?: string }) {
    const body = newsletterSchema.parse(payload);
    const res = await publicApi.post("/web/subscribe", {
      ...body,
      ...(payload.recaptchaToken ? { "g-recaptcha-response": payload.recaptchaToken } : {}),
    });
    return res.data;
  },
};

export default newsletterService;
