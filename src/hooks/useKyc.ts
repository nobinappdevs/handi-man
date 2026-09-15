"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { kycServiceFor } from "@/services/kyc.service";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
  getApiWarningMessage,
  profileQueryKey,
} from "@/hooks/useAuth";
import type { AuthRole } from "@/lib/authState";

/** 0 Unverified, 1 Verified, 2 Pending, 3 Rejected — the API's own legend. */
export const KYC_UNVERIFIED = 0;
export const KYC_VERIFIED = 1;
export const KYC_PENDING = 2;
export const KYC_REJECTED = 3;

/**
 * Shared so anything gating on verification reads the cache this page fills.
 * Keyed by role: a vendor's documents and a customer's are different records
 * behind different endpoints, and one must never answer for the other.
 */
export const kycQueryOptions = (role: AuthRole = "user") => ({
  queryKey: ["kyc", role] as const,
  queryFn: () => kycServiceFor(role).getFields(),
});

/** GET the status + dynamic field definition. */
export function useKycFields(role: AuthRole = "user") {
  return useQuery(kycQueryOptions(role));
}

/** POST the documents, then re-read the status. */
export function useSubmitKyc(role: AuthRole = "user") {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, Record<string, unknown>>({
    mutationFn: (fields) => kycServiceFor(role).submit(fields),
    onSuccess: (res) => {
      /* A 200 is not always a yes. "You are already KYC Verified User" comes
         back with a `warning` envelope and a 200 status, so it lands here —
         reporting it as a success would tell the user their documents were
         accepted when nothing was stored. */
      const warning = getApiWarningMessage(res);
      if (warning) toast(warning, { icon: "⚠️" });
      else toast.success(getApiSuccessMessage(res, "KYC submitted for review"));

      qc.invalidateQueries({ queryKey: kycQueryOptions(role).queryKey });
      // `kyc_verified` also rides on the profile, which the guards and the
      // account screens read.
      qc.invalidateQueries({ queryKey: profileQueryKey(role) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
