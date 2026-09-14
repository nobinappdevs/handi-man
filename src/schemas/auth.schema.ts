import { z } from "zod";

/*
 * Validation messages live HERE — React Hook Form renders them under the field.
 * Cross-field checks use `.refine()`.
 *
 * NOTE: these mirror the Laravel field names. Confirm each one against the
 * Handiman API collection before wiring a screen to it.
 */

/* ─────────────────────────── Login ─────────────────────────── */
export const loginRequestSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* Real login response: { message: { success: [...] }, data: { token, user } } */
export const loginUserSchema = z.object({
  id: z.number(),
  email: z.string().optional(),
  email_verified: z.number().optional(),
  sms_verified: z.number().optional(),
  kyc_verified: z.number().optional(),
  two_factor_verified: z.number().optional(),
  two_factor_status: z.number().optional(),
});

export const loginResponseSchema = z.object({
  message: z.object({ success: z.array(z.string()).optional() }).optional(),
  data: z.object({
    token: z.string(),
    user: loginUserSchema,
  }),
});

/* ─────────────────────────── Register ─────────────────────────── */
/*
 * Two schemas, one field set. `/basic/settings` carries an `agree_policy`
 * switch: when it is off the register form does not render a consent checkbox
 * at all, and a schema that still demanded `policy === true` would fail a form
 * the user has no way to satisfy. So the consent rule is the only difference
 * between these two, and the form picks by the flag.
 *
 * `password_confirmation` is checked in BOTH: the repeat is a client-side
 * courtesy (the endpoint has no `confirmed` rule and is never sent it), but it
 * catches a typo before the account is created either way.
 */
export const registerRequestSchemaWithoutPolicy = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
    policy: z.boolean(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

/** The default — consent required, which is what `agree_policy: 1` means. */
export const registerRequestSchema = registerRequestSchemaWithoutPolicy.refine(
  (d) => d.policy === true,
  { path: ["policy"], message: "You must accept the terms" },
);

/* ─────────────────────────── Forgot password ─────────────────────────── */
export const forgotRequestSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

/* ─────────────────────────── OTP ─────────────────────────── */
export const otpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});

/* ─────────────────────────── Reset password ─────────────────────────── */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

/* ─────────────────────────── Types ─────────────────────────── */
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type ForgotRequest = z.infer<typeof forgotRequestSchema>;
export type OtpRequest = z.infer<typeof otpSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
