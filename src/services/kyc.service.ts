import { privateApi } from "@/lib/axios";

/** One field of the server-defined KYC form. `type` drives which control renders. */
export interface KycField {
  type: "text" | "number" | "select" | "file" | string;
  label: string;
  name: string;
  required: boolean;
  validation: {
    max?: number | string;
    min?: number | string;
    mimes?: string[];
    options?: string[];
    required?: boolean;
  };
}

export interface KycData {
  status_info?: string;
  /** 0 Unverified, 1 Verified, 2 Pending, 3 Rejected. */
  kyc_status: number;
  input_fields: KycField[];
}

export const kycService = {
  /** GET /user/kyc/input-fields — status + the dynamic form definition. */
  async getFields(): Promise<{ data: KycData }> {
    const res = await privateApi.get("/user/kyc/input-fields");
    return res.data;
  },

  /** POST /user/kyc/submit — form-data, because the fields include uploads. */
  async submit(fields: Record<string, unknown>) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === "") continue;
      if (typeof File !== "undefined" && value instanceof File) form.append(key, value);
      else form.append(key, String(value));
    }
    const res = await privateApi.post("/user/kyc/submit", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default kycService;
