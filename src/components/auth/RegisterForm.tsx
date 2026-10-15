"use client";

import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLang } from "@/hooks/useLang";
import { useRegister, authRoutes } from "@/hooks/useAuth";
import {
  useAgreePolicyRequired,
  useRecaptcha,
  useRegistrationEnabled,
} from "@/hooks/useBasicSettings";
import { Recaptcha } from "@/components/share/Recaptcha";
import type { AuthRole } from "@/lib/authState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SocialSignIn } from "@/components/auth/SocialSignIn";
import { applyServerErrors } from "@/components/auth/serverErrors";
import {
  registerRequestSchema,
  registerRequestSchemaWithoutPolicy,
  type RegisterRequest,
} from "@/schemas/auth.schema";

/**
 * Create an account.
 *
 * The field set is the endpoint's, not a shorter one: `/user/register` wants
 * `first_name`, `last_name` and `password_confirmation`, so asking for an email
 * and a password alone would only produce a 422 the user cannot act on.
 *
 * `policy` never leaves the browser — Laravel is sent the literal `policy: "on"`
 * by the service. The checkbox is the consent record, not a payload field.
 *
 * Three things here are the admin's call, not ours, and all three come from
 * `/basic/settings`:
 *   `user_registration` — signups open at all
 *   `agree_policy`      — whether to ask for terms consent
 *   `google_recaptcha`  — whether a challenge stands in front of submit
 * Each defaults to the permissive answer while the settings request is in
 * flight, so a slow network never shows a form nobody can complete.
 */
export function RegisterForm({ role = "user" }: { role?: AuthRole }) {
  const { t } = useLang();
  const register = useRegister(role);
  const routes = authRoutes(role);
  const { enabled: registrationEnabled } = useRegistrationEnabled();
  const { required: policyRequired } = useAgreePolicyRequired();
  const { enabled: recaptchaEnabled, siteKey } = useRecaptcha();

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterRequest>({
    // Swapping the resolver is how the hidden checkbox stops being required —
    // RHF reads it at validation time, so this tracks the flag as it arrives.
    resolver: zodResolver(
      policyRequired ? registerRequestSchema : registerRequestSchemaWithoutPolicy,
    ),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirmation: "",
      policy: false,
    },
  });

  // `useWatch`, never `watch()` — the React Compiler is on.
  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = (data: RegisterRequest) => {
    // The admin has closed signups — say so rather than posting into a 4xx.
    if (!registrationEnabled) {
      toast.error(t("auth.registrationDisabled"));
      return;
    }
    // Hold the submit until the challenge is solved, but only when there is one.
    if (recaptchaEnabled && !captchaToken) {
      setCaptchaError(t("auth.recaptchaError"));
      return;
    }
    setCaptchaError("");

    register.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        // No `password_confirmation` — the endpoint does not take it; the
        // repeat is checked in `registerRequestSchema` and stops here.
        ...(recaptchaEnabled ? { recaptchaToken: captchaToken } : {}),
      },
      {
        onError: (err) => {
          // A reCAPTCHA token is single-use: without this reset the retry is
          // spent against a token Google has already burned, and fails forever.
          if (recaptchaEnabled) {
            setCaptchaToken("");
            setCaptchaReset((n) => n + 1);
          }
          applyServerErrors(err, setError, {
            first_name: "first_name",
            last_name: "last_name",
            email: "email",
            password: "password",
          });
        },
      },
    );
  };

  return (
    <AuthShell
      title={t(role === "vendor" ? "auth.vendorRegisterTitle" : "auth.registerTitle")}
      subtitle={t(role === "vendor" ? "auth.vendorRegisterSubtitle" : "auth.registerSubtitle")}
      footer={
        <p className="text-center text-[13.5px] text-muted">
          {t("auth.haveAccount")}{" "}
          <Link href={routes.login} className="font-bold text-heading underline underline-offset-2">
            {t("auth.loginButton")}
          </Link>
        </p>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                autoComplete="given-name"
                label={t("auth.labelFirstName")}
                placeholder={t("auth.firstNamePlaceholder")}
                error={errors.first_name?.message}
                leftIcon={<User size={16} strokeWidth={2} aria-hidden />}
              />
            )}
          />
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                autoComplete="family-name"
                label={t("auth.labelLastName")}
                placeholder={t("auth.lastNamePlaceholder")}
                error={errors.last_name?.message}
              />
            )}
          />
        </div>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="email"
              autoComplete="email"
              label={t("auth.labelEmail")}
              placeholder={t("auth.emailPlaceholder")}
              error={errors.email?.message}
              leftIcon={<Mail size={16} strokeWidth={2} aria-hidden />}
            />
          )}
        />

        <div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordField
                {...field}
                autoComplete="new-password"
                label={t("auth.labelPassword")}
                placeholder={t("auth.choosePasswordPlaceholder")}
                error={errors.password?.message}
              />
            )}
          />
          <PasswordStrength value={password} />
        </div>

        <Controller
          name="password_confirmation"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              autoComplete="new-password"
              label={t("auth.labelConfirmPassword")}
              placeholder={t("auth.confirmPasswordPlaceholder")}
              error={errors.password_confirmation?.message}
            />
          )}
        />

{/* Shown only while `agree_policy` is on. The schema swaps with it, so a
            hidden checkbox is not silently blocking the submit. */}
        {policyRequired && (
          <Controller
            name="policy"
            control={control}
            render={({ field }) => (
              <Input
                type="checkbox"
                name={field.name}
                ref={field.ref}
                checked={field.value}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.checked)}
                error={errors.policy?.message}
                label={
                  <span className="inline leading-snug">
                    {t("auth.agreePrefix")}{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="font-semibold text-brand underline"
                    >
                      {t("auth.terms")}
                    </Link>{" "}
                    {t("auth.and")}{" "}
                    <Link href="/privacy-policy" className="font-semibold text-brand underline">
                      {t("auth.privacy")}
                    </Link>
                  </span>
                }
              />
            )}
          />
        )}

        {recaptchaEnabled && (
          <div>
            <Recaptcha
              siteKey={siteKey}
              resetSignal={captchaReset}
              onVerify={(token) => {
                setCaptchaToken(token);
                if (token) setCaptchaError("");
              }}
            />
            {captchaError && (
              <p className="mt-1.5 text-[13px] font-medium text-red-500">{captchaError}</p>
            )}
          </div>
        )}

        {!registrationEnabled && (
          <p className="border border-border bg-surface px-4 py-3 text-center text-[13px] leading-[1.5] text-muted">
            {t("auth.registrationDisabled")}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={register.isPending}
          disabled={!registrationEnabled}
          className="mt-1"
        >
          {t(register.isPending ? "auth.registering" : "auth.registerButton")}
        </Button>
      </form>

      <SocialSignIn />
    </AuthShell>
  );
}
