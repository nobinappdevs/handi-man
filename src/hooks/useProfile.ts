"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { profileService } from "@/services/profile.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import { TOKEN_KEY } from "@/lib/axios";
import type { UpdateProfileRequest, UpdatePasswordRequest } from "@/schemas/profile.schema";

/**
 * All of these invalidate `["profile"]` rather than writing into the cache: the
 * API returns a success envelope, not the updated user, so the only honest way
 * to show what was saved is to re-read it. `AuthGuard` shares that key, so the
 * guard's copy stays in step for free.
 */

/** POST /user/profile/update */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, UpdateProfileRequest>({
    mutationFn: (payload) => profileService.update(payload),
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Profile updated"));
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/** POST /user/profile/password/update */
export function useUpdatePassword() {
  return useMutation<unknown, unknown, UpdatePasswordRequest>({
    mutationFn: (payload) => profileService.updatePassword(payload),
    onSuccess: (res) => toast.success(getApiSuccessMessage(res, "Password updated")),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/** POST /user/profile/delete/account — then drops the session and signs out. */
export function useDeleteAccount() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation<unknown, unknown, void>({
    mutationFn: () => profileService.deleteAccount(),
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Account deleted"));
      try {
        window.localStorage.removeItem(TOKEN_KEY);
      } catch {
        // Storage can throw in private mode; the redirect below still stands.
      }
      qc.clear();
      router.replace("/login");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
