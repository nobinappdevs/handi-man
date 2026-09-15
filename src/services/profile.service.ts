import { apiFor } from "@/lib/axios";
import type { AuthRole } from "@/lib/authState";
import {
  updateProfileRequestSchema,
  updatePasswordRequestSchema,
  type UpdateProfileRequest,
  type UpdatePasswordRequest,
} from "@/schemas/profile.schema";

/** `/user/profile` also answers with the country list the form's select needs. */
/**
 * The nested `user.address` object. `zip_code`, NOT `zip` — the form seeded
 * itself from `zip`, so the field rendered blank however many times it had been
 * saved, and posting that blank back meant it never stuck.
 */
export interface ProfileAddress {
  country?: string;
  state?: string;
  city?: string;
  zip_code?: string;
  address?: string;
}

/**
 * The user object as `{base}/profile` actually returns it.
 *
 * Snake_case throughout, and `image` is a BARE FILENAME, not a URL — see
 * `ProfileData` for the three pieces that build one. (These were `firstname` /
 * `lastname` / `userImage` here, carried over from the reference project; this
 * API uses none of those names.)
 */
export interface ProfileUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  mobile?: string;
  mobile_code?: string;
  full_mobile?: string;
  image?: string;
  status?: number;
  email_verified?: number | boolean;
  sms_verified?: number;
  kyc_verified?: number;
  two_factor_verified?: number;
  two_factor_status?: number;
  address?: ProfileAddress;
}

export interface ProfileData {
  user: ProfileUser;
  /**
   * Storage root. Spelled `base_ur` by the API — a typo on their side, not
   * ours; `base_url` is accepted too in case it is ever corrected.
   */
  base_ur?: string;
  base_url?: string;
  /** Directory the user's own uploads live in, e.g. "frontend/user". */
  image_path?: string;
  /** Full path (already includes its directory) to the fallback avatar. */
  default_image?: string;
  countries?: { name: string }[];
}

/**
 * The account screen's three writes, for either side of the API.
 *
 * `{base}` is `/user/profile` for customers and `/vendors/profile` for vendors;
 * the field names and envelopes are identical, so this is written once and
 * stamped per role — same arrangement as `auth`, `security` and `kyc`.
 */
function createProfileService(role: AuthRole) {
  const { privateApi } = apiFor(role);
  const base = role === "vendor" ? "/vendors/profile" : "/user/profile";

  return {
    role,

    /**
     * POST `{base}/update` — form-data, because the avatar rides along.
     *
     * Every managed field is sent, INCLUDING empty ones. The old rule dropped
     * blanks to avoid wiping untouched fields, but the form seeds itself from
     * the server's own copy before it is editable, so "blank" can only mean the
     * user cleared it — and dropping it made clearing an address line or a zip
     * impossible. The endpoint declares all of them `nullable`, so an empty
     * value is a legal "unset".
     *
     * `undefined` is still skipped: that is a field this form does not manage,
     * which is a different thing from one the user emptied.
     */
    async update(payload: UpdateProfileRequest) {
      const { image, ...body } = updateProfileRequestSchema.parse(payload);
      const form = new FormData();
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined && value !== null) form.append(key, String(value));
      }
      if (image) form.append("image", image);
      const res = await privateApi.post(`${base}/update`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },

    /** POST `{base}/password/update` — form-data. */
    async updatePassword(payload: UpdatePasswordRequest) {
      const body = updatePasswordRequestSchema.parse(payload);
      const form = new FormData();
      for (const [key, value] of Object.entries(body)) form.append(key, String(value));
      const res = await privateApi.post(`${base}/password/update`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },

    /**
     * POST `{base}/delete/account` — permanent.
     *
     * `status: 1` is required; both collection entries declare it and the call
     * was going out with an empty body.
     */
    async deleteAccount() {
      const form = new FormData();
      form.append("status", "1");
      const res = await privateApi.post(`${base}/delete/account`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  };
}

export type ProfileService = ReturnType<typeof createProfileService>;

export const profileService = createProfileService("user");
export const vendorProfileService = createProfileService("vendor");

export function profileServiceFor(role: AuthRole): ProfileService {
  return role === "vendor" ? vendorProfileService : profileService;
}

export default profileService;
