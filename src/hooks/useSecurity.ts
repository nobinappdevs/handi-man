"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { securityService } from "@/services/security.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";

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
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Two-factor settings updated"));
      /* Dropping the cached profile is the whole job now — `AuthGuard` reads
         `two_factor_status`/`two_factor_verified` straight from it, so the
         refetch reports the toggle we just made. Nothing is mirrored locally.

         Worth knowing: switching 2FA ON only succeeds once a live authenticator
         code has been accepted, so the profile comes back `verified: 1` and the
         guard lets the user stay put rather than bouncing them to /verify-2fa
         for a code they just entered. */
      qc.invalidateQueries({ queryKey: ["google-2fa"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
