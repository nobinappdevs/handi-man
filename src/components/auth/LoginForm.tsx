"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { useLogin, authRoutes } from "@/hooks/useAuth";
import { useRecaptcha } from "@/hooks/useBasicSettings";
import { Recaptcha } from "@/components/share/Recaptcha";
import type { AuthRole } from "@/lib/authState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { SocialSignIn } from "@/components/auth/SocialSignIn";
import { applyServerErrors } from "@/components/auth/serverErrors";
import { loginRequestSchema, type LoginRequest } from "@/schemas/auth.schema";

/**
 * Sign in. Everything past a valid email + password belongs to `useLogin` —
 * the toast, the token, and the three-way decision between the dashboard, the
 * email OTP screen and the authenticator screen.
 *
 * There is no "remember me": the token goes to localStorage either way, so a
 * checkbox here would be decoration that reads as a security control.
 *
 * `role` picks which API signs the person in — `/user/login` or
 * `/vendors/login` — and with it every link and redirect on the screen. One
 * form, because the two endpoints take and return exactly the same shape.
 */
export function LoginForm({ role = "user" }: { role?: AuthRole }) {
  const { t } = useLang();
  const login = useLogin(role);
  const routes = authRoutes(role);
  const { enabled: recaptchaEnabled, siteKey } = useRecaptcha();

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginRequest) => {
    if (recaptchaEnabled && !captchaToken) {
      setCaptchaError(t("auth.recaptchaError"));
      return;
    }
    setCaptchaError("");

    login.mutate(
      { ...data, ...(recaptchaEnabled ? { recaptchaToken: captchaToken } : {}) },
      {
        onError: (err) => {
          // Single-use token — clear it so the retry gets a fresh challenge.
          if (recaptchaEnabled) {
            setCaptchaToken("");
            setCaptchaReset((n) => n + 1);
          }
          applyServerErrors(err, setError, { email: "email", password: "password" });
        },
      },
    );
  };

  return (
    <AuthShell
      title={t("auth.loginTitle")}
      subtitle={t(role === "vendor" ? "auth.vendorLoginSubtitle" : "auth.loginSubtitle")}
      footer={
        <p className="text-center text-[13.5px] text-muted">
          {t(role === "vendor" ? "auth.vendorNoAccount" : "auth.noAccount")}{" "}
          <Link href={routes.register} className="font-bold text-heading underline underline-offset-2">
            {t("auth.registerButton")}
          </Link>
        </p>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                autoComplete="current-password"
                label={t("auth.labelPassword")}
                placeholder={t("auth.passwordPlaceholder")}
                error={errors.password?.message}
              />
            )}
          />
          <div className="mt-2 flex justify-end">
            <Link
              href={routes.forgotPassword}
              className="text-[13px] font-semibold text-brand hover:underline"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </div>

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

        <Button type="submit" size="lg" fullWidth loading={login.isPending} className="mt-2">
          {t(login.isPending ? "auth.loggingIn" : "auth.loginButton")}
        </Button>
      </form>

      <SocialSignIn />
    </AuthShell>
  );
}
