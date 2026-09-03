import { z } from "zod";

/* ─────────────────────────── Profile update ───────────────────────────
 * POST /user/profile/update (form-data). Field names mirror the Laravel API,
 * which is why they are snake_case here and camelCase nowhere.
 */
export const updateProfileRequestSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  country: z.string().optional(),
  phone_code: z.string().optional(),
  phone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
  address: z.string().optional(),
  /* The avatar. Outside the string handling above because it is a File and the
     service appends it to the form-data separately. */
  image: z.instanceof(File).optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

/* ─────────────────────────── Password update ───────────────────────────
 * POST /user/profile/password/update (form-data).
 */
export const updatePasswordRequestSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

export type UpdatePasswordRequest = z.infer<typeof updatePasswordRequestSchema>;

/* ─────────────────────────── 2FA toggle ───────────────────────────
 * POST /user/profile/google-2fa/status/update. `status` is 1 to enable, 0 to
 * disable; either direction needs a live authenticator code.
 */
export const twoFaToggleSchema = z.object({
  code: z
    .string()
    .min(6, "Enter the 6-digit code")
    .max(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type TwoFaToggleRequest = z.infer<typeof twoFaToggleSchema>;
