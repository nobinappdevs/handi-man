"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { securityService } from "@/services/security.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { setTwoFaState } from "@/lib/authState";

/** GET /user/profile/google-2fa — QR + secret + status. Keyed by language
 *  because the endpoint localises its `alert` copy. */
export function useGoogle2fa() {
  const { lang } = useLang();
  return useQuery({
    queryKey: ["google-2fa", lang],
    queryFn: () => securityService.getGoogle2fa(lang),
  });
}

/** POST /user/profile/google-2fa/status/update */
export function useUpdate2faStatus() {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, { status: number; code: string }>({
    mutationFn: ({ status, code }) => securityService.updateStatus(status, code),
    onSuccess: (res, { status }) => {
      toast.success(getApiSuccessMessage(res, "Two-factor settings updated"));
      /* Keep the locally stored flag honest — `AuthGuard` reads it to decide
         whether to divert to /verify-2fa.
         "ok", NOT "pending", when switching 2FA on: "pending" means the session
         still owes an authenticator code, and this toggle only succeeds once a
         live one has been accepted. Marking it pending here would bounce the
         user straight to /verify-2fa for a code they just entered. */
      setTwoFaState(status === 1 ? "ok" : "off");
      qc.invalidateQueries({ queryKey: ["google-2fa"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
