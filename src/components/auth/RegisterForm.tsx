"use client";

import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useRegister } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SocialSignIn } from "@/components/auth/SocialSignIn";
import { applyServerErrors } from "@/components/auth/serverErrors";
import { registerRequestSchema, type RegisterRequest } from "@/schemas/auth.schema";

/**
 * Create an account.
 *
 * The field set is the endpoint's, not a shorter one: `/user/register` wants
 * `first_name`, `last_name` and `password_confirmation`, so asking for an email
 * and a password alone would only produce a 422 the user cannot act on.
 *
 * `policy` never leaves the browser — Laravel is sent the literal `policy: "on"`
 * by the service. The checkbox is the consent record, not a payload field.
 */
export function RegisterForm() {
  const { t } = useLang();
  const register = useRegister();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
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

  const onSubmit = (data: RegisterRequest) =>
    register.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      },
      {
        onError: (err) =>
          applyServerErrors(err, setError, {
            first_name: "first_name",
            last_name: "last_name",
            email: "email",
            password: "password",
          }),
      },
    );

  return (
    <AuthShell
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      footer={
        <p className="text-center text-[13.5px] text-muted">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-bold text-heading underline underline-offset-2">
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
                  <Link href="/terms-and-conditions" className="font-semibold text-brand underline">
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

        <Button type="submit" size="lg" fullWidth loading={register.isPending} className="mt-1">
          {t(register.isPending ? "auth.registering" : "auth.registerButton")}
        </Button>
      </form>

      <SocialSignIn />
    </AuthShell>
  );
}
