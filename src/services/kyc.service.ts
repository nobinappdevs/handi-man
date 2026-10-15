import { apiFor } from "@/lib/axios";
import type { AuthRole } from "@/lib/authState";

/** One field of the server-defined KYC form. `type` drives which control renders. */
export interface KycField {
  type: "text" | "number" | "select" | "file" | string;
  label: string;
  name: string;
  required: boolean;
  validation: {
    /** For files this is a size in MB, as a string. */
    max?: number | string;
    min?: number | string;
    mimes?: string[];
    options?: string[];
    required?: boolean;
  };
}

export interface KycData {
  /**
   * A developer legend, e.g. "0: Unverified, 1: Verified, 2: Pending,
   * 3: Rejected" — it documents `kyc_status` for whoever is reading the API.
   * NOT display copy: it is untranslated and meaningless to a user. The screen
   * renders its own localized note per status instead.
   */
  status_info?: string;
  /** 0 Unverified, 1 Verified, 2 Pending, 3 Rejected. */
  kyc_status: number;
  input_fields: KycField[];
}

/*
 * KYC is a SERVER-DEFINED form: the endpoint returns the fields, their types,
 * their options and their validation, and the screen builds itself from that.
 * Nothing about the document set is hard-coded here, so an admin adding a field
 * needs no frontend change.
 *
 * ⚠️ Only the VENDOR side exists in the API collection:
 *     GET  /vendors/profile/kyc/input-fields
 *     POST /vendors/profile/kyc/submit
 *
 * The customer paths below (`/user/kyc/*`) are inherited from the reference
 * project and 404 against this backend — there is no customer KYC endpoint
 * documented. They are left in place rather than pointed somewhere wrong, so
 * `/dashboard/kyc` fails loudly instead of quietly reading a vendor's
 * documents. Swap them the moment a customer endpoint is published.
 */
const BASE: Record<AuthRole, { fields: string; submit: string }> = {
  vendor: {
    fields: "/vendors/profile/kyc/input-fields",
    submit: "/vendors/profile/kyc/submit",
  },
  user: {
    fields: "/user/kyc/input-fields",
    submit: "/user/kyc/submit",
  },
};

function createKycService(role: AuthRole) {
  const { privateApi } = apiFor(role);
  const paths = BASE[role];

  return {
    role,

    /** GET — status + the dynamic form definition. */
    async getFields(): Promise<{ data: KycData }> {
      const res = await privateApi.get(paths.fields);
      return res.data;
    },

    /**
     * POST — form-data, because the fields include uploads.
     *
     * Built from whatever the definition asked for rather than a fixed shape:
     * `id_type` is a string, `front`/`back` are Files, and a future field is
     * whichever of the two it declares itself to be. Empty values are dropped
     * so an untouched optional field is absent rather than an empty string,
     * which Laravel's `mimes` rule would reject as a malformed file.
     */
    async submit(fields: Record<string, unknown>) {
      const form = new FormData();
      for (const [key, value] of Object.entries(fields)) {
        if (value === undefined || value === null || value === "") continue;
        if (typeof File !== "undefined" && value instanceof File) form.append(key, value);
        else form.append(key, String(value));
      }
      const res = await privateApi.post(paths.submit, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  };
}

export type KycService = ReturnType<typeof createKycService>;

export const kycService = createKycService("user");
export const vendorKycService = createKycService("vendor");

export function kycServiceFor(role: AuthRole): KycService {
  return role === "vendor" ? vendorKycService : kycService;
}

export default kycService;
