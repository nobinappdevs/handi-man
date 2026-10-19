import { publicApi } from "@/lib/axios";
import { contactRequestSchema, type ContactRequest } from "@/schemas/contact.schema";

/**
 * POST /web/contact/message/submit — public, no auth.
 *
 * Answers `{ message: { success: ["Message send successfully!"] } }`. A 422
 * nests its field errors one level deeper than usual
 * (`message.error: [["…", "…"]]`); `getApiErrorMessage` already digs through
 * that.
 *
 * The reCAPTCHA token rides along as `g-recaptcha-response` only when the
 * admin has the challenge switched on, the same as login and register.
 */
export const contactService = {
  async submit(payload: ContactRequest & { recaptchaToken?: string }) {
    const body = contactRequestSchema.parse(payload);
    const res = await publicApi.post("/web/contact/message/submit", {
      ...body,
      ...(payload.recaptchaToken ? { "g-recaptcha-response": payload.recaptchaToken } : {}),
    });
    return res.data;
  },
};

export default contactService;
