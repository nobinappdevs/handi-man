"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { securityServiceFor } from "@/services/security.service";
import { getApiErrorMessage, getApiSuccessMessage, profileQueryKey } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import type { AuthRole } from "@/lib/authState";

/**
 * The dashboard's authenticator settings, for either side of the API.
 *
 * `role` is not cosmetic: a vendor's authenticator lives behind
 * `/vendors/profile/google-2fa` on the vendor API root, and asking the customer
 * endpoint with a vendor token is a 401. The cache key carries it too, or the
 * two screens would hand each other the wrong QR code.
 */

/** GET `{base}/google-2fa` — QR + secret + status. */
export function useGoogle2fa(role: AuthRole = "user") {
  const { lang } = useLang();
  return useQuery({
    // Language is part of the key because the endpoint localises its `alert`
    // copy; role, because these are two different accounts' secrets.
    queryKey: ["google-2fa", role, lang],
    queryFn: () => securityServiceFor(role).getGoogle2fa(lang),
  });
}

/** POST `{base}/google-2fa/status/update` */
export function useUpdate2faStatus(role: AuthRole = "user") {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, { status: number; code: string }>({
    mutationFn: ({ status, code }) => securityServiceFor(role).updateStatus(status, code),
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Two-factor settings updated"));
      /* Re-read both copies of the truth. `AuthGuard` reads
         `two_factor_status`/`two_factor_verified` from the profile, and the
         panel reads `qr_status` from the 2FA endpoint; nothing is mirrored
         locally, so an invalidation is the whole job.

         `invalidate` rather than `remove` here, unlike the verify hooks: the
         user stays on this screen, so both queries are mounted and actually
         refetch — and the panel keeps showing its current state instead of
         flashing a spinner.

         Worth knowing: switching 2FA ON only succeeds once a live authenticator
         code has been accepted, so the profile comes back `verified: 1` and the
         guard lets the user stay put rather than bouncing them to the
         authenticator screen for a code they just entered. */
      qc.invalidateQueries({ queryKey: ["google-2fa", role] });
      qc.invalidateQueries({ queryKey: profileQueryKey(role) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
