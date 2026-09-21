"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  authServiceFor,
  type RegisterPayload,
  type VerifyForgotOtpPayload,
  type ResetPasswordPayload,
} from "@/services/auth.service";
import {
  setToken,
  startEmailOtpFlow,
  startResetOtpFlow,
  setResetToken,
  readResetToken,
  clearResetFlow,
  clearOtpFlow,
  clearAuthState,
  emailVerifiedFromResponse,
  twoFaStateFromResponse,
  type AuthRole,
} from "@/lib/authState";
import { useEmailVerificationRequired } from "@/hooks/useBasicSettings";
import type { LoginRequest, LoginResponse } from "@/schemas/auth.schema";

/**
 * Every hook here serves both sides of the API. Pass `"vendor"` and it talks to
 * `…/api/vendor/v1/vendors/*`, stores the vendor session, and routes to the
 * vendor screens; omit it and it is the customer flow, exactly as before.
 */

/* ── Where each role's flow lands ──
 *
 * Kept as one table so a screen can never be renamed on one side of a
 * redirect and not the other.
 */
type AuthRoutes = {
  login: string;
  register: string;
  forgotPassword: string;
  dashboard: string;
  verifyOtp: string;
  verify2fa: string;
  resetPassword: string;
};

const ROUTES: Record<AuthRole, AuthRoutes> = {
  user: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    dashboard: "/dashboard",
    verifyOtp: "/verify-otp",
    verify2fa: "/verify-2fa",
    resetPassword: "/reset-password",
  },
  vendor: {
    login: "/vendors/login",
    register: "/vendors/register",
    forgotPassword: "/vendors/forgot-password",
    dashboard: "/vendors/dashboard",
    verifyOtp: "/vendors/verify-otp",
    verify2fa: "/vendors/verify-2fa",
    resetPassword: "/vendors/reset-password",
  },
};

/** The screens belonging to a role — also read by the guards. */
export function authRoutes(role: AuthRole): AuthRoutes {
  return ROUTES[role];
}

/**
 * The two roles' profiles are different people; sharing one cache key would
 * hand a vendor the customer's record. `useProfile` in `hooks/useProfile.ts`
 * invalidates the `["profile"]` prefix, which still clears both.
 */
export function profileQueryKey(role: AuthRole) {
  return ["profile", role] as const;
}

/* ── message helpers ──
 *
 * Laravel wraps messages three different ways in this API and all three turn up
 * in the auth flow alone:
 *
 *   { "message": { "success": ["…"] } }   login, register, verify, reset
 *   { "message": { "error":   ["…"] } }   most failures
 *   { "message": [ "…" ] }                forgot-password *resend*, both ways
 *   { "message": "Unauthenticated." }     a 401 with no envelope at all
 *
 * Missing the bare-array shape is not cosmetic: the resend endpoint reports its
 * rate limit ("You can resend verification code after 38.9 seconds") that way,
 * and swallowing it leaves the user staring at a generic failure with no idea
 * they simply have to wait.
 */

/** The first human-readable string in any of the shapes above. */
function firstMessage(message: unknown): string | undefined {
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.find((m): m is string => typeof m === "string");
  if (message && typeof message === "object") {
    for (const value of Object.values(message as Record<string, unknown>)) {
      const found = firstMessage(value);
      if (found) return found;
    }
  }
  return undefined;
}

/** Pull a human message out of any error shape. */
export function getApiErrorMessage(err: unknown): string {
  const data = (
    err as { response?: { data?: { message?: unknown; errors?: Record<string, string[]> } } }
  )?.response?.data;

  const message = firstMessage(data?.message);
  if (message) return message;

  // A 422's field errors, when the envelope carried no message of its own.
  if (data?.errors) {
    const first = Object.values(data.errors).find(Array.isArray);
    if (first?.[0]) return first[0];
  }

  return "Something went wrong. Please try again.";
}

/** `message.success[0]` (or a bare `message[0]`) with a fallback. */
export function getApiSuccessMessage(res: unknown, fallback: string): string {
  const message = (res as { message?: unknown })?.message;
  const bare = Array.isArray(message) || typeof message === "string";
  const found = bare
    ? firstMessage(message)
    : firstMessage((message as { success?: unknown } | undefined)?.success);
  return found ?? fallback;
}

/**
 * `message.warning[0]`, when present.
 *
 * Some endpoints refuse with HTTP **200** and a `warning` envelope rather than
 * an error status — KYC submit answers "You are already KYC Verified User" that
 * way. That lands in `onSuccess`, where treating it as success would toast a
 * cheerful "submitted for review" over a refusal. Callers check this first.
 */
export function getApiWarningMessage(res: unknown): string | undefined {
  return firstMessage((res as { message?: { warning?: unknown } })?.message?.warning);
}

/**
 * Tokens land in different places per endpoint: `data.user.token` (forgot →
 * send-otp), `data.token` (login, register, forgot → resend), or bare `token`.
 */
function extractToken(res: unknown): string | undefined {
  const r = res as { data?: { token?: string; user?: { token?: string } }; token?: string };
  return r?.data?.user?.token ?? r?.data?.token ?? r?.token;
}

/**
 * `data.user.email_verified` — 0 when the backend just mailed an OTP, 1 when
 * the account is already usable. Absent (older/other responses) is treated as
 * unverified so we keep the safe "go verify" path.
 */
function isEmailVerified(res: unknown): boolean {
  return emailVerifiedFromResponse(res) ?? false;
}

/**
 * Whether this response says a 2FA code is still owed. Read straight off the
 * payload and not stored anywhere — a response without the flags answers
 * "don't know", and `AuthGuard` settles it against `{base}/profile` on arrival.
 */
function owesTwoFa(res: unknown): boolean {
  return twoFaStateFromResponse(res) === "pending";
}

/**
 * End the OTHER panel's session.
 *
 * Only one may be live at a time, and the guards assume it: `AuthGuard`
 * sends someone holding the wrong role's token to that role's dashboard, so
 * a token left behind from an earlier sign-in would bounce the person who
 * just signed in straight back out of the panel they chose.
 *
 * Called on the way IN rather than on the way out, because the way out is not
 * guaranteed to happen - a session can end by expiry or by a cleared tab.
 */
function endOtherSession(role: AuthRole, queryClient: ReturnType<typeof useQueryClient>) {
  const other: AuthRole = role === "vendor" ? "user" : "vendor";
  clearAuthState(other);
  queryClient.removeQueries({ queryKey: profileQueryKey(other) });
}

/* ─────────────────────────── Login ─────────────────────────── */
export function useLogin(role: AuthRole = "user") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const routes = authRoutes(role);
  // Site-wide policy from /basic/settings. It can only REMOVE the OTP step,
  // never add one — see `useRegister` below for why.
  const { required: emailVerificationRequired } = useEmailVerificationRequired();
  return useMutation<LoginResponse, unknown, LoginRequest & { recaptchaToken?: string }>({
    mutationFn: (payload) => authServiceFor(role).login(payload),
    onSuccess: (res, variables) => {
      setToken(res.data.token, role);
      // Whoever was signed in before, their profile is not this session's.
      queryClient.removeQueries({ queryKey: profileQueryKey(role) });
      endOtherSession(role, queryClient);
      const verified = isEmailVerified(res) || !emailVerificationRequired;
      const owesTwoFaCode = owesTwoFa(res);
      toast.success(getApiSuccessMessage(res, "Login successful"));

      // Signing in with an unverified email ("Please check email and verify
      // your account") — the token works, but the OTP step comes first.
      if (!verified) {
        startEmailOtpFlow("login", variables.email, role);
        router.replace(routes.verifyOtp);
        return;
      }
      clearOtpFlow(role);
      // 2FA is on for this account and this session hasn't answered its code
      // yet — the authenticator step stands between login and the dashboard.
      if (owesTwoFaCode) {
        router.replace(routes.verify2fa);
        return;
      }
      router.replace(routes.dashboard);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/* ─────────────────────────── Register ─────────────────────────── */
export function useRegister(role: AuthRole = "user") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const routes = authRoutes(role);
  /*
   * `email_verification` from /basic/settings.
   *
   * It is consulted in ONE direction only: when the admin has verification
   * switched off, skip the OTP screen even though the fresh account comes back
   * with `email_verified: 0`. It is never used to ADD a step — the response is
   * what knows whether this particular account owes a code, and a stale or
   * failed settings fetch must not strand a verified user on an OTP screen.
   */
  const { required: emailVerificationRequired } = useEmailVerificationRequired();
  return useMutation<unknown, unknown, RegisterPayload & { recaptchaToken?: string }>({
    mutationFn: (payload) => authServiceFor(role).register(payload),
    onSuccess: (res, variables) => {
      // A signup token (if returned) lets the email-verify call authenticate.
      const token = extractToken(res);
      if (token) setToken(token, role);
      queryClient.removeQueries({ queryKey: profileQueryKey(role) });
      endOtherSession(role, queryClient);
      const verified = isEmailVerified(res) || !emailVerificationRequired;

      // Nothing to verify — either the account came back already verified, or
      // the site has verification switched off. The signup token is a real
      // session either way, so go straight in.
      if (verified) {
        clearOtpFlow(role);
        toast.success(getApiSuccessMessage(res, "Account created"));
        router.replace(routes.dashboard);
        return;
      }

      startEmailOtpFlow("register", variables.email, role);
      toast.success(getApiSuccessMessage(res, "Account created — verify your email"));
      router.replace(routes.verifyOtp);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/* ─────────────────────────── Forgot: send OTP ─────────────────────────── */
export function useForgotSendOtp(role: AuthRole = "user") {
  const router = useRouter();
  const routes = authRoutes(role);
  return useMutation<unknown, unknown, string>({
    mutationFn: (email) => authServiceFor(role).forgotSendOtp(email),
    onSuccess: (res, email) => {
      startResetOtpFlow(email, extractToken(res), role);
      toast.success(getApiSuccessMessage(res, "OTP sent to your email"));
      router.push(routes.verifyOtp);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/* ─────────────────────────── Forgot: resend OTP ───────────────────────────
 *
 * Its own endpoint, not a second `send/otp`: re-running send would start the
 * flow over (and re-navigate a user who is already on the code screen). It
 * answers with a rotated token, which MUST replace the stored one — verifying
 * against the old one fails with "The selected otp is invalid."
 */
export function useForgotResendOtp(role: AuthRole = "user") {
  return useMutation<unknown, unknown, string>({
    mutationFn: (credentials) =>
      authServiceFor(role).resendForgotOtp({ credentials, token: readResetToken(role) }),
    onSuccess: (res) => {
      const rotated = extractToken(res);
      if (rotated) setResetToken(rotated, role);
      toast.success(getApiSuccessMessage(res, "Code resent"));
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/* ─────────────────────────── Forgot: verify OTP ─────────────────────────── */
export function useForgotVerifyOtp(role: AuthRole = "user") {
  const router = useRouter();
  const routes = authRoutes(role);
  return useMutation<unknown, unknown, VerifyForgotOtpPayload>({
    mutationFn: (payload) => authServiceFor(role).forgotVerifyOtp(payload),
    onSuccess: (res) => {
      // The verify step echoes the reset token back; keep the freshest copy for
      // the reset call that spends it.
      const newToken = extractToken(res);
      if (newToken) setResetToken(newToken, role);
      toast.success(getApiSuccessMessage(res, "Code verified"));
      router.push(routes.resetPassword);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/* ─────────────────────────── Reset password ─────────────────────────── */
export function useResetPassword(role: AuthRole = "user") {
  const router = useRouter();
  const routes = authRoutes(role);
  return useMutation<unknown, unknown, ResetPasswordPayload>({
    mutationFn: (payload) => authServiceFor(role).resetPassword(payload),
    onSuccess: (res) => {
      clearResetFlow(role);
      toast.success(getApiSuccessMessage(res, "Password reset — please sign in"));
      router.push(routes.login);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/* ─────────────────────────── Email verify / resend ─────────────────────────── */
export function useEmailVerify(role: AuthRole = "user") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const routes = authRoutes(role);
  return useMutation<unknown, unknown, string>({
    mutationFn: (otp) => authServiceFor(role).verifyEmailOtp(otp),
    onSuccess: (res) => {
      clearOtpFlow(role);
      /*
       * REMOVE, not invalidate.
       *
       * The cached profile says `email_verified: 0` — `AuthGuard` fetched it on
       * the way in and then sent us here. `invalidateQueries` only marks it
       * stale, and with no component observing it nothing refetches; the guard
       * on the next screen then reads that stale 0 and bounces straight back to
       * this page. (React Query reports `isLoading: false` whenever cached data
       * exists, so the guard's loading gate does not cover it either.)
       *
       * Dropping the entry leaves nothing to act on, so the guard shows its
       * spinner and decides on the answer that comes back.
       */
      queryClient.removeQueries({ queryKey: profileQueryKey(role) });
      toast.success(getApiSuccessMessage(res, "Email verified"));
      // An account with 2FA switched on still owes its authenticator code.
      if (owesTwoFa(res)) {
        router.replace(routes.verify2fa);
        return;
      }
      router.replace(routes.dashboard);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useResendEmail(role: AuthRole = "user") {
  return useMutation<unknown, unknown, void>({
    mutationFn: () => authServiceFor(role).resendEmailCode(),
    onSuccess: (res) => toast.success(getApiSuccessMessage(res, "Code resent")),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/* ─────────────────────────── Google 2FA verify ─────────────────────────── */
export function useVerifyGoogle2fa(role: AuthRole = "user") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const routes = authRoutes(role);
  return useMutation<unknown, unknown, string>({
    mutationFn: (otp) => authServiceFor(role).verifyGoogle2fa(otp),
    onSuccess: (res) => {
      // Same trap as the email step: the cached profile still says
      // `two_factor_verified: 0`, and a stale hit would bounce the dashboard
      // straight back here. Remove it so the guard waits for a fresh read.
      queryClient.removeQueries({ queryKey: profileQueryKey(role) });
      toast.success(getApiSuccessMessage(res, "Two-factor verified"));
      router.replace(routes.dashboard);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/* ─────────────────────────── Session ─────────────────────────── */

/**
 * GET `{base}/profile`. `enabled` lets the guard skip it while signed out.
 *
 * This query opts OUT of the global cache policy, and deliberately.
 *
 * Everywhere else a 60s `staleTime` and no refetch-on-focus is the right
 * trade: re-reading a list a moment early costs a request and changes nothing.
 * This one is different — it is the only copy of `email_verified` and the 2FA
 * flags that the user cannot edit, and `AuthGuard` decides what they may see
 * from it. The localStorage mirrors beside it are a first-paint guess that goes
 * stale the instant an admin flips a switch server-side, and nothing else ever
 * corrects them.
 *
 * So: always refetch on mount, and refetch when the tab regains focus. Coming
 * back to a long-open tab re-reads the real state and the guard acts on it.
 *
 * What this does NOT cover: a change made while the tab sits focused and idle.
 * For that the backstop is the 401 interceptor in `lib/axios.ts` (a killed
 * session dies on the next call, immediately) — a poll here would cost every
 * user a steady request stream to catch a rare event.
 */
export function useProfile(enabled = true, role: AuthRole = "user") {
  return useQuery({
    queryKey: profileQueryKey(role),
    queryFn: () => authServiceFor(role).getProfile(),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useLogout(role: AuthRole = "user") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const routes = authRoutes(role);
  return useMutation<void, unknown, void>({
    mutationFn: () => authServiceFor(role).logout(),
    onError: (err) => toast.error(getApiErrorMessage(err)),
    // Local state goes either way. The user asked to be signed out, and a
    // failed call is the case where leaving a live token behind is worst —
    // an expired session answers 401 here and must still end up logged out.
    onSettled: (_data, error) => {
      clearAuthState(role);
      queryClient.clear();
      if (!error) toast.success("Logged out");
      router.replace(routes.login);
    },
  });
}
