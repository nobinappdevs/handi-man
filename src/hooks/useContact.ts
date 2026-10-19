"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { contactService } from "@/services/contact.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import type { ContactRequest } from "@/schemas/contact.schema";

/**
 * POST /web/contact/message/submit
 *
 * `message` is the toast shown when the API sends no wording of its own. The
 * form reset and the "sent" label stay in the component — they are form state,
 * passed in through `mutate`'s own `onSuccess`.
 */
export function useContactSubmit(message: string) {
  return useMutation<unknown, unknown, ContactRequest & { recaptchaToken?: string }>({
    mutationFn: (payload) => contactService.submit(payload),
    onSuccess: (res) => toast.success(getApiSuccessMessage(res, message)),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
