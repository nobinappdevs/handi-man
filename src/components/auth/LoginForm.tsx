"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useLogin } from "@/hooks/useAuth";
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
 */
export function LoginForm() {
  const { t } = useLang();
  const login = useLogin();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginRequest) =>
    login.mutate(data, {
      onError: (err) => applyServerErrors(err, setError, { email: "email", password: "password" }),
    });

  return (
    <AuthShell
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <p className="text-center text-[13.5px] text-muted">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-bold text-heading underline underline-offset-2">
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
              href="/forgot-password"
              className="text-[13px] font-semibold text-brand hover:underline"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" fullWidth loading={login.isPending} className="mt-2">
          {t(login.isPending ? "auth.loggingIn" : "auth.loginButton")}
        </Button>
      </form>

      <SocialSignIn />
    </AuthShell>
  );
}
