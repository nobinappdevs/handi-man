"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { profileServiceFor } from "@/services/profile.service";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
  profileQueryKey,
  authRoutes,
} from "@/hooks/useAuth";
import { clearAuthState, type AuthRole } from "@/lib/authState";
import type { UpdateProfileRequest, UpdatePasswordRequest } from "@/schemas/profile.schema";

/**
 * All of these invalidate the role's profile rather than writing into the
 * cache: the API returns a success envelope, not the updated user, so the only
 * honest way to show what was saved is to re-read it. `AuthGuard` and the
 * header's identity share that key, so both stay in step for free.
 *
 * `role` decides which API answers — `/user/profile/*` or
 * `/vendors/profile/*`. They are separate accounts on separate guards.
 */

/** POST `{base}/profile/update` */
export function useUpdateProfile(role: AuthRole = "user") {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, UpdateProfileRequest>({
    mutationFn: (payload) => profileServiceFor(role).update(payload),
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Profile updated"));
      qc.invalidateQueries({ queryKey: profileQueryKey(role) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/** POST `{base}/profile/password/update` */
export function useUpdatePassword(role: AuthRole = "user") {
  return useMutation<unknown, unknown, UpdatePasswordRequest>({
    mutationFn: (payload) => profileServiceFor(role).updatePassword(payload),
    onSuccess: (res) => toast.success(getApiSuccessMessage(res, "Password updated")),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/** POST `{base}/profile/delete/account` — then drops the session and signs out. */
export function useDeleteAccount(role: AuthRole = "user") {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation<unknown, unknown, void>({
    mutationFn: () => profileServiceFor(role).deleteAccount(),
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Account deleted"));
      // The whole session for this role, not just the token — a leftover cache
      // entry would outlive the account it describes. The other role's session
      // is left alone; one person can be both.
      clearAuthState(role);
      qc.removeQueries({ queryKey: profileQueryKey(role) });
      router.replace(authRoutes(role).login);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
