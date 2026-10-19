"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { newsletterService } from "@/services/newsletter.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import type { NewsletterRequest } from "@/schemas/newsletter.schema";

/**
 * POST /web/subscribe
 *
 * `message` is the toast shown when the API sends no wording of its own. An
 * email that is already subscribed comes back as a 422 ("The email has already
 * been taken."), which lands in `onError` like any other refusal.
 */
export function useNewsletterSubscribe(message: string) {
  return useMutation<unknown, unknown, NewsletterRequest & { recaptchaToken?: string }>({
    mutationFn: (payload) => newsletterService.subscribe(payload),
    onSuccess: (res) => toast.success(getApiSuccessMessage(res, message)),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
