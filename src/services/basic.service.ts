import { publicApi } from "@/lib/axios";

/**
 * GET /basic/settings — the public site config.
 *
 * This is the switchboard the admin panel writes to: whether signups are open,
 * whether the policy checkbox is required, whether a new account has to verify
 * its email, and the reCAPTCHA credentials. The frontend asks once and caches;
 * nothing here is per-user.
 *
 * ⚠️ The shape differs from the reference project's. Handiman puts the flags in
 * `data.app_settings.basic_settings` and the captcha in `data.google_recaptcha`
 * (the demo used `data.all_logo` and `data.google_recaptcha_credentials`), and
 * sends them as **numbers**, not strings. Everything below reads them through
 * `String(...)` so either spelling works if the backend changes its mind.
 */

export interface GoogleRecaptchaConfig {
  /** 1 = on, 0 = off. Arrives as a number today. */
  status?: number | string;
  site_key?: string;
}

export interface TawkToConfig {
  status?: number | string;
  property_id?: string;
  widget_id?: string;
}

/** The admin switches that actually change how the auth screens behave. */
export interface BasicSettingsFlags {
  site_name?: string;
  site_title?: string;
  timezone?: string;
  /** `true` puts the whole public site into maintenance. */
  frontend_mode?: boolean;
  /** 1 = signups open, 0 = closed by the admin. */
  user_registration?: number | string;
  /** 1 = the register form must collect terms consent, 0 = don't ask. */
  agree_policy?: number | string;
  /** 1 = a new account must verify its email before it can use the site. */
  email_verification?: number | string;
}

/** Site identity — the logo set, for the header/footer. */
export interface AllLogo {
  site_logo?: string;
  site_logo_dark?: string;
  site_fav?: string;
  site_fav_dark?: string;
  [key: string]: unknown;
}

export interface BasicSettingsData {
  base_url?: string;
  image_path?: string;
  logo_image_path?: string;
  default_logo_path?: string;
  all_logo?: AllLogo;
  app_settings?: {
    basic_settings?: BasicSettingsFlags;
    [key: string]: unknown;
  };
  google_recaptcha?: GoogleRecaptchaConfig;
  tawk_to?: TawkToConfig;
}

export const basicService = {
  /** GET /basic/settings — public, no auth. */
  async getSettings(): Promise<{ data: BasicSettingsData }> {
    const res = await publicApi.get("/basic/settings");
    return res.data;
  },
};

export default basicService;
