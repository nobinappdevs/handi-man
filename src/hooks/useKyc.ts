"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { kycService } from "@/services/kyc.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";

/** 0 Unverified, 1 Verified, 2 Pending, 3 Rejected. */
export const KYC_UNVERIFIED = 0;
export const KYC_VERIFIED = 1;
export const KYC_PENDING = 2;
export const KYC_REJECTED = 3;

/** Shared so anything gating on verification reads the cache this page fills. */
export const kycQueryOptions = {
  queryKey: ["kyc"] as const,
  queryFn: () => kycService.getFields(),
};

/** GET /user/kyc/input-fields */
export function useKycFields() {
  return useQuery(kycQueryOptions);
}

/** POST /user/kyc/submit */
export function useSubmitKyc() {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, Record<string, unknown>>({
    mutationFn: (fields) => kycService.submit(fields),
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "KYC submitted for review"));
      qc.invalidateQueries({ queryKey: kycQueryOptions.queryKey });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
