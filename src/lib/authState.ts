/**
 * Client-side auth state kept alongside the bearer token.
 *
 * The token alone can't gate the dashboard: register/login hand out a working
 * token *before* the email OTP step (the verify call itself needs auth), so
 * "has a token" and "is allowed in" are two different questions.
 *
 * ── Only the token is stored ──
 * `email_verified` and the 2FA state are deliberately NOT kept here. They were
 * mirrored in localStorage once, as a way to skip a request on first paint, and
 * that was a mistake: an admin flipping a switch server-side left the browser
 * holding a stale answer that nothing ever corrected, and the keys were
 * editable from devtools besides. Both now come from `{base}/profile` on every
 * read, so a reload — or any refetch — picks up the change.
 *
 * What is left in storage is the token (there is nowhere else to put it) and
 * the OTP wizard's step markers in sessionStorage, which are flow position,
 * not permission.
 *
 * ── Two roles, two of everything ──
 * Customers and vendors are separate Laravel guards on separate API roots
 * (`…/api/v1/user/*` vs `…/api/vendor/v1/vendors/*`). A vendor token is simply
 * not a credential on the customer API, so the two sessions get their own keys
 * rather than fighting over one: signing in as a vendor must not silently end
 * someone's customer session, and `AuthGuard` must never admit the wrong one.
 * Every reader and writer below takes the role it is asking about.
 */

/** Which side of the API a session belongs to. */
export type AuthRole = "user" | "vendor";

/* ── Storage keys ──
 *
 * The customer keys are the unprefixed ones, because they were here first and
 * are what §17 of the blueprint documents; the vendor keys mirror them under
 * `handiman_vendor_`. Never build one of these by hand — ask `keysFor(role)`.
 */

/** localStorage key for the customer bearer token (re-exported by `lib/axios`). */
export const TOKEN_KEY = "handiman_token";

/** localStorage key for the vendor bearer token. */
export const VENDOR_TOKEN_KEY = "handiman_vendor_token";

/* sessionStorage — the multi-step flows. Also per role: a half-finished vendor
 * signup and a customer password reset can be open in the same browser. */
export const OTP_FLOW_KEY = "handiman_otp_flow";
export const OTP_ORIGIN_KEY = "handiman_otp_origin";
export const OTP_EMAIL_KEY = "handiman_otp_email";
export const VENDOR_OTP_FLOW_KEY = "handiman_vendor_otp_flow";
export const VENDOR_OTP_ORIGIN_KEY = "handiman_vendor_otp_origin";
export const VENDOR_OTP_EMAIL_KEY = "handiman_vendor_otp_email";

/* ── forgot → OTP → reset hand-off ──
 *
 * The reset token is minted by `…/forgot/password/send/otp` and spent two
 * screens later by `…/forgot/password/reset`, so it has to outlive both
 * navigations without ever reaching localStorage — it is a password-change
 * capability, not a session.
 */
export const RESET_TOKEN_KEY = "handiman_reset_token";
export const RESET_EMAIL_KEY = "handiman_reset_email";
export const VENDOR_RESET_TOKEN_KEY = "handiman_vendor_reset_token";
export const VENDOR_RESET_EMAIL_KEY = "handiman_vendor_reset_email";

type RoleKeys = {
  token: string;
  otpFlow: string;
  otpOrigin: string;
  otpEmail: string;
  resetToken: string;
  resetEmail: string;
};

const KEYS: Record<AuthRole, RoleKeys> = {
  user: {
    token: TOKEN_KEY,
    otpFlow: OTP_FLOW_KEY,
    otpOrigin: OTP_ORIGIN_KEY,
    otpEmail: OTP_EMAIL_KEY,
    resetToken: RESET_TOKEN_KEY,
    resetEmail: RESET_EMAIL_KEY,
  },
  vendor: {
    token: VENDOR_TOKEN_KEY,
    otpFlow: VENDOR_OTP_FLOW_KEY,
    otpOrigin: VENDOR_OTP_ORIGIN_KEY,
    otpEmail: VENDOR_OTP_EMAIL_KEY,
    resetToken: VENDOR_RESET_TOKEN_KEY,
    resetEmail: VENDOR_RESET_EMAIL_KEY,
  },
};

/** The storage keys belonging to one role. The only way to name a key. */
export function keysFor(role: AuthRole): RoleKeys {
  return KEYS[role];
}

/*
 * Storage throws in private mode and on a blocked origin, and does not exist on
 * the server. Every access goes through these two so a dead `localStorage` reads
 * as "signed out" instead of taking the render down with it.
 */
function read(store: "local" | "session", key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (store === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function write(store: "local" | "session", key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    const s = store === "local" ? window.localStorage : window.sessionStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    // Nothing useful to do — the caller's flow continues without the mirror.
  }
}

/*
 * Keys this file used to write and no longer does.
 *
 * `email_verified` and the 2FA state were mirrored here before both moved to
 * `{base}/profile`. Nothing reads them any more, but a browser that signed in
 * under the old build still has them sitting in localStorage, where they are
 * confusing to anyone opening devtools and look like live state. Swept up on
 * the next `clearAuthState()` — logout, or any 401.
 */
const LEGACY_MIRROR_KEYS = [
  "handiman_email_verified",
  "handiman_2fa",
  "handiman_vendor_email_verified",
  "handiman_vendor_2fa",
];

/* ── Token ── */

export function setToken(token: string, role: AuthRole = "user") {
  write("local", keysFor(role).token, token);
}

export function readToken(role: AuthRole = "user"): string {
  return read("local", keysFor(role).token) ?? "";
}

/* ── Google 2FA ──
 *
 * Two flags decide this, and only together: `two_factor_status` says whether the
 * account has an authenticator attached at all, `two_factor_verified` says
 * whether this session has answered its code. We collapse them into one value:
 *
 *   "off"     — 2FA isn't switched on; nothing to ask for.
 *   "ok"      — switched on and already answered.
 *   "pending" — switched on and still owed a code; the dashboard stays shut.
 *
 * Derived from a response every time. Nothing is cached.
 */
export type TwoFaState = "off" | "ok" | "pending";

/**
 * Collapses `data.user.two_factor_status` + `two_factor_verified` out of a
 * login/profile payload. `null` when the response doesn't carry the flags at
 * all — that's "unknown", not "off", so callers keep whatever they already knew.
 */
export function twoFaStateFromResponse(res: unknown): TwoFaState | null {
  const user = (res as {
    data?: { user?: { two_factor_status?: number | string; two_factor_verified?: number | string } };
  })?.data?.user;
  const status = user?.two_factor_status;
  if (status === undefined || status === null) return null;
  if (String(status) !== "1") return "off";
  return String(user?.two_factor_verified) === "1" ? "ok" : "pending";
}

/* ── The OTP screen's two flows ── */

export type OtpOrigin = "register" | "login";

/** Which flow the OTP screen is serving — it verifies an email OR a reset. */
export type OtpFlow = "email" | "reset";

/**
 * Point the OTP screen at the email-verification flow (vs. password reset).
 * `origin` and `email` are what let that screen offer a way back — without them
 * a typo in the signup email is a dead end.
 */
export function startEmailOtpFlow(
  origin: OtpOrigin = "login",
  email?: string,
  role: AuthRole = "user",
) {
  const k = keysFor(role);
  write("session", k.otpFlow, "email");
  write("session", k.otpOrigin, origin);
  if (email) write("session", k.otpEmail, email);
}

export function setOtpEmail(email: string, role: AuthRole = "user") {
  write("session", keysFor(role).otpEmail, email);
}

export function readOtpOrigin(role: AuthRole = "user"): OtpOrigin {
  return read("session", keysFor(role).otpOrigin) === "register" ? "register" : "login";
}

export function readOtpEmail(role: AuthRole = "user"): string {
  return read("session", keysFor(role).otpEmail) ?? "";
}

export function readOtpFlow(role: AuthRole = "user"): OtpFlow {
  return read("session", keysFor(role).otpFlow) === "reset" ? "reset" : "email";
}

/**
 * Point the OTP screen at the password-reset flow. The mirror of
 * `startEmailOtpFlow`, and the only place the reset keys are written on the way
 * in — the OTP screen needs the email to resend, the reset screen needs the
 * token to spend.
 */
export function startResetOtpFlow(email: string, token?: string, role: AuthRole = "user") {
  const k = keysFor(role);
  write("session", k.otpFlow, "reset");
  write("session", k.resetEmail, email);
  setOtpEmail(email, role);
  if (token) setResetToken(token, role);
}

export function setResetToken(token: string, role: AuthRole = "user") {
  write("session", keysFor(role).resetToken, token);
}

export function readResetToken(role: AuthRole = "user"): string {
  return read("session", keysFor(role).resetToken) ?? "";
}

export function readResetEmail(role: AuthRole = "user"): string {
  return read("session", keysFor(role).resetEmail) ?? "";
}

/** Everything the reset flow left behind, once the password is changed. */
export function clearResetFlow(role: AuthRole = "user") {
  const k = keysFor(role);
  write("session", k.resetToken, null);
  write("session", k.resetEmail, null);
  clearOtpFlow(role);
}

export function clearOtpFlow(role: AuthRole = "user") {
  const k = keysFor(role);
  [k.otpFlow, k.otpOrigin, k.otpEmail].forEach((key) => write("session", key, null));
}

/**
 * Wipe everything that makes this browser look signed in **as `role`**. The
 * other role's session is deliberately left alone — someone can be a customer
 * and a vendor at once, and logging out of one is not logging out of the other.
 */
export function clearAuthState(role: AuthRole = "user") {
  const k = keysFor(role);
  write("local", k.token, null);
  LEGACY_MIRROR_KEYS.forEach((key) => write("local", key, null));
  clearOtpFlow(role);
  write("session", k.resetToken, null);
  write("session", k.resetEmail, null);
}

/** Reads `data.user.email_verified` out of a login/register/profile payload. */
export function emailVerifiedFromResponse(res: unknown): boolean | null {
  const flag = (res as { data?: { user?: { email_verified?: number | string } } })?.data?.user
    ?.email_verified;
  if (flag === undefined || flag === null) return null;
  return String(flag) === "1";
}
