import { apiFor } from "@/lib/axios";
import type { AuthRole } from "@/lib/authState";

export interface Google2faData {
  /** Either a full SVG document or a URL — see `qrSrcFrom` in the screen. */
  qr_code: string;
  qr_secrete: string;
  /** 1 = enabled. */
  qr_status: number;
  alert?: string;
}

/**
 * The authenticator-management pair, for the dashboard's 2FA screen:
 *
 *   GET  {base}/google-2fa               — QR, secret and current status
 *   POST {base}/google-2fa/status/update — switch it on or off
 *
 * where `{base}` is `/user/profile` for customers and `/vendors/profile` for
 * vendors. Identical payloads on both sides, so this is written once and
 * stamped per role, like `auth.service.ts`.
 *
 * Not to be confused with `{base}/google-2fa/otp/verify` in `auth.service.ts`:
 * that one answers the challenge at LOGIN time. These two are settings.
 */
function createSecurityService(role: AuthRole) {
  const { privateApi } = apiFor(role);
  const base = role === "vendor" ? "/vendors/profile" : "/user/profile";

  return {
    role,

    /**
     * GET `{base}/google-2fa` — QR, secret and current status.
     *
     * `lang` is passed explicitly on the customer API because the endpoint
     * localises its `alert` copy and the caller keys its cache by language, so
     * the request must carry the language the cache entry claims. The vendor
     * API takes no `lang` at all.
     */
    async getGoogle2fa(lang = "en"): Promise<{ data: Google2faData }> {
      const res = await privateApi.get(
        `${base}/google-2fa`,
        role === "vendor" ? undefined : { params: { lang } },
      );
      return res.data;
    },

    /**
     * POST `{base}/google-2fa/status/update` — enable (1) or disable (0).
     *
     * BOTH directions need a live authenticator code; turning it off without
     * one would make a stolen session enough to strip the second factor.
     *
     * Sent as form-data to match the collection. `status` must be stringified —
     * Laravel's `integer` rule rejects a raw JS number arriving as a file-less
     * multipart part otherwise.
     */
    async updateStatus(status: number, code: string) {
      const form = new FormData();
      form.append("status", String(status));
      form.append("code", code);
      const res = await privateApi.post(`${base}/google-2fa/status/update`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  };
}

export type SecurityService = ReturnType<typeof createSecurityService>;

/** `…/api/v1/user/profile/google-2fa` */
export const securityService = createSecurityService("user");

/** `…/api/vendor/v1/vendors/profile/google-2fa` */
export const vendorSecurityService = createSecurityService("vendor");

export function securityServiceFor(role: AuthRole): SecurityService {
  return role === "vendor" ? vendorSecurityService : securityService;
}

export default securityService;
