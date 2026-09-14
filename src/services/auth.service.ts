import { apiFor } from "@/lib/axios";
import type { AuthRole } from "@/lib/authState";
import {
  loginRequestSchema,
  loginResponseSchema,
  type LoginRequest,
  type LoginResponse,
} from "@/schemas/auth.schema";

/* ── payload types (mirror the Laravel field names) ── */
/**
 * Exactly the five fields `{base}/register` declares — no more.
 *
 * `password_confirmation` is deliberately NOT here: the endpoint has no
 * `confirmed` rule on `password`, so the repeat is a client-side check only.
 * It stays in the form and in `registerRequestSchema`, and is dropped before
 * the request.
 *
 * `policy` is supplied by the service as the literal `"on"` that Laravel's
 * `in:on` rule wants — the checkbox is the consent record, not a payload field.
 */
export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface VerifyForgotOtpPayload {
  otp: string;
  token: string;
}

export interface ResetPasswordPayload {
  password: string;
  password_confirmation: string;
  token: string;
}

export interface ResendForgotOtpPayload {
  /** The address the reset was started with — the endpoint calls it `credentials`. */
  credentials: string;
  /** The token `send/otp` minted; the endpoint takes it in the QUERY, not the body. */
  token: string;
}

/**
 * The customer and vendor auth APIs are the same API twice: identical payloads,
 * identical envelopes, identical flags — only the root and the path segment
 * differ (`/user/*` on `…/api/v1`, `/vendors/*` on `…/api/vendor/v1`). So this
 * is written once and stamped out per role, rather than copied and left to
 * drift.
 *
 * Bodies go as JSON. The Postman collection sends form-data, but these
 * endpoints carry no files and Laravel reads either identically when
 * `Accept: application/json` is set — which `lib/axios.ts` does globally.
 */
function createAuthService(role: AuthRole) {
  const { publicApi, privateApi } = apiFor(role);
  /** `/user` for customers, `/vendors` for vendors. */
  const base = role === "vendor" ? "/vendors" : "/user";

  return {
    role,

    /** POST `{base}/login` — public. Request + response validated with Zod. */
    async login(payload: LoginRequest & { recaptchaToken?: string }): Promise<LoginResponse> {
      const body = loginRequestSchema.parse(payload);
      // Attach the Google reCAPTCHA token only when present (feature is optional).
      const res = await publicApi.post(`${base}/login`, {
        ...body,
        ...(payload.recaptchaToken ? { "g-recaptcha-response": payload.recaptchaToken } : {}),
      });
      return loginResponseSchema.parse(res.data);
    },

    /**
     * POST `{base}/register` — public.
     *
     * The body is built field by field rather than spread, so a caller passing
     * extra form state (a repeated password, a UI-only flag) cannot leak it
     * into the request. The endpoint takes these five and nothing else.
     */
    async register(payload: RegisterPayload & { recaptchaToken?: string }) {
      const res = await publicApi.post(`${base}/register`, {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        password: payload.password,
        policy: "on",
        ...(payload.recaptchaToken
          ? { "g-recaptcha-response": payload.recaptchaToken }
          : {}),
      });
      return res.data;
    },

    /* ── Forgot-password flow (public) ── */

    /** POST `{base}/forgot/password/send/otp` — mints the reset token. */
    async forgotSendOtp(credentials: string) {
      const res = await publicApi.post(`${base}/forgot/password/send/otp`, { credentials });
      return res.data;
    },

    /** POST `{base}/forgot/password/verify` */
    async forgotVerifyOtp(payload: VerifyForgotOtpPayload) {
      const res = await publicApi.post(`${base}/forgot/password/verify`, payload);
      return res.data;
    },

    /**
     * POST `{base}/forgot/password/resend/code?token=…`
     *
     * A different endpoint from `send/otp`, and the only one in the flow that
     * takes its token in the query string. It answers with a *fresh* token in
     * `data.token`, so the caller has to store what comes back or the next
     * verify is spent against a token the backend has already rotated.
     */
    async resendForgotOtp({ credentials, token }: ResendForgotOtpPayload) {
      const res = await publicApi.post(
        `${base}/forgot/password/resend/code`,
        { credentials },
        { params: { token } },
      );
      return res.data;
    },

    /** POST `{base}/forgot/password/reset` */
    async resetPassword(payload: ResetPasswordPayload) {
      const res = await publicApi.post(`${base}/forgot/password/reset`, payload);
      return res.data;
    },

    /* ── Email verification (authed — uses the signup token) ── */

    /**
     * POST `{base}/email/otp/verify` — body is the code alone. The session is
     * proved by the bearer token the interceptor attaches; register and login
     * both hand one out before this step precisely so this call can authenticate.
     */
    async verifyEmailOtp(otp: string) {
      const res = await privateApi.post(`${base}/email/otp/verify`, { otp });
      return res.data;
    },

    /** POST `{base}/email/resend/code` */
    async resendEmailCode() {
      const res = await privateApi.post(`${base}/email/resend/code`);
      return res.data;
    },

    /**
     * POST `{base}/google-2fa/otp/verify` — the 6-digit authenticator code.
     *
     * Succeeds only while the session still owes a code; the backend flips
     * `two_factor_verified` to 1 on the way out.
     */
    async verifyGoogle2fa(otp: string) {
      const res = await privateApi.post(`${base}/google-2fa/otp/verify`, { otp });
      return res.data;
    },

    /* ── Session ── */

    /** GET `{base}/profile` — requires auth. */
    async getProfile() {
      const res = await privateApi.get(`${base}/profile`);
      return res.data;
    },

    /**
     * GET `{base}/logout` — requires auth, and really is a GET in this API.
     *
     * The local state is dropped by the hook, not here: a network failure must
     * not leave the browser holding a session the server has already ended.
     */
    async logout(): Promise<void> {
      await privateApi.get(`${base}/logout`);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;

/** The customer auth API — `…/api/v1/user/*`. */
export const authService = createAuthService("user");

/** The vendor auth API — `…/api/vendor/v1/vendors/*`. */
export const vendorAuthService = createAuthService("vendor");

/** The service for a role, for the hooks that serve both. */
export function authServiceFor(role: AuthRole): AuthService {
  return role === "vendor" ? vendorAuthService : authService;
}

export default authService;
