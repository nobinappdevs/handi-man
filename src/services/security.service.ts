import { privateApi } from "@/lib/axios";

export interface Google2faData {
  /** Either a full SVG document or a URL — see `qrSrcFrom` in the screen. */
  qr_code: string;
  qr_secrete: string;
  /** 1 = enabled. */
  qr_status: number;
  alert?: string;
}

export const securityService = {
  /** GET /user/profile/google-2fa — QR, secret and current status. */
  async getGoogle2fa(lang = "en"): Promise<{ data: Google2faData }> {
    const res = await privateApi.get("/user/profile/google-2fa", { params: { lang } });
    return res.data;
  },

  /**
   * POST /user/profile/google-2fa/status/update — enable (1) or disable (0).
   * BOTH directions need a live authenticator code; turning it off without one
   * would make a stolen session enough to strip the second factor.
   */
  async updateStatus(status: number, code: string) {
    const form = new FormData();
    form.append("status", String(status));
    form.append("code", code);
    const res = await privateApi.post("/user/profile/google-2fa/status/update", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default securityService;
