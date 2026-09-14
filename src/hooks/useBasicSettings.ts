"use client";

import { useQuery } from "@tanstack/react-query";
import { basicService, type BasicSettingsFlags } from "@/services/basic.service";

/**
 * GET /basic/settings — cached hard, because it is one answer for the whole
 * site and it changes only when an admin flips a switch.
 *
 * Every selector below reads a single flag out of it. They exist so a component
 * asks one plain question ("do I show the policy checkbox?") instead of digging
 * through `data.data.app_settings.basic_settings` and re-deciding what a
 * missing value means.
 */
export function useBasicSettings() {
  return useQuery({
    queryKey: ["basic-settings"],
    queryFn: () => basicService.getSettings(),
    staleTime: 10 * 60 * 1000,
  });
}

function useFlags(): { flags: BasicSettingsFlags; isLoading: boolean } {
  const { data, isLoading } = useBasicSettings();
  return { flags: data?.data?.app_settings?.basic_settings ?? {}, isLoading };
}

/**
 * Reads a 1/0 switch.
 *
 * `fallback` is what we assume while the request is in flight or if it fails —
 * and choosing it is the whole job. These flags gate a form the user is already
 * looking at, so an absent answer must never be the restrictive one: guessing
 * "signups closed" on a slow network locks people out of a site that is
 * perfectly open. Only an explicit value from the backend turns a switch off.
 */
function readFlag(value: number | string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value) === "1";
}

/**
 * Google reCAPTCHA. `enabled` is true only when the backend has it switched on
 * AND handed us a site key — a widget with no key renders an error box, which
 * is worse than no widget, so both are required.
 *
 * Default OFF: unlike the flags above, guessing "on" here would render a broken
 * widget and block every submit behind a captcha that can never be solved.
 */
export function useRecaptcha() {
  const { data, isLoading } = useBasicSettings();
  const config = data?.data?.google_recaptcha;
  const siteKey = config?.site_key ?? "";
  return {
    enabled: String(config?.status ?? 0) === "1" && Boolean(siteKey),
    siteKey,
    isLoading,
  };
}

/** `user_registration` — whether the admin is accepting signups at all. */
export function useRegistrationEnabled() {
  const { flags, isLoading } = useFlags();
  return { enabled: readFlag(flags.user_registration, true), isLoading };
}

/**
 * `agree_policy` — whether the register form must collect terms consent.
 *
 * Defaults to **required**. Showing a consent checkbox that wasn't strictly
 * needed costs a click; skipping one that was needed means taking a signup
 * without the consent record, which is not ours to get wrong.
 */
export function useAgreePolicyRequired() {
  const { flags, isLoading } = useFlags();
  return { required: readFlag(flags.agree_policy, true), isLoading };
}

/**
 * `email_verification` — whether a new account must confirm its address.
 *
 * Note this is only half the answer. The register/login RESPONSE carries
 * `user.email_verified`, which is what actually decides where someone lands;
 * this flag is the site-wide policy behind it. `useRegister` uses the flag only
 * to *skip* the OTP screen when verification is switched off — it never adds a
 * step the response didn't ask for.
 */
export function useEmailVerificationRequired() {
  const { flags, isLoading } = useFlags();
  return { required: readFlag(flags.email_verification, true), isLoading };
}

/** `frontend_mode` — true when the admin has put the public site in maintenance. */
export function useMaintenanceMode() {
  const { flags, isLoading } = useFlags();
  return { maintenance: flags.frontend_mode === true, isLoading };
}
