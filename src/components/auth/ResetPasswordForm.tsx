"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole, TriangleAlert } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import { useResetPassword } from "@/hooks/useAuth";
import { readOtpFlow, readResetToken } from "@/lib/authState";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { resetPasswordSchema, type ResetPasswordRequest } from "@/schemas/auth.schema";

/**
 * Step 3 of the reset: the new password, spent against the token the OTP screen
 * left in sessionStorage.
 *
 * Reached directly — a bookmark, a reload in a fresh tab — there is no flow to
 * finish, and the honest answer is to say so rather than to show a form whose
 * submit can only 422. The check is on the flow marker rather than the token
 * itself: `useForgotSendOtp` always sets the marker, but only stores a token if
 * the API returned one, so gating on the token would strand people mid-flow.
 */
export function ResetPasswordForm() {
  const { t } = useLang();
  const router = useRouter();
  const reset = useResetPassword();
  // sessionStorage is client-only, so the server and the hydration paint have
  // to agree on something first. They agree on the form: it is what all but a
  // stray deep link wants, and swapping it out one frame later beats flashing
  // "expired" at everyone who arrived here legitimately.
  const isClient = useIsClient();
  const expired = isClient && readOtpFlow() !== "reset";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = (data: ResetPasswordRequest) =>
    reset.mutate({
      password: data.password,
      password_confirmation: data.password_confirmation,
      token: readResetToken(),
    });

  const backToLogin = (
    <p className="text-center text-[13.5px] text-muted">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 font-bold text-heading underline underline-offset-2"
      >
        <ArrowLeft size={14} strokeWidth={2.4} aria-hidden />
        {t("auth.backToLogin")}
      </Link>
    </p>
  );

  if (expired) {
    return (
      <AuthShell
        icon={<TriangleAlert size={22} strokeWidth={2} aria-hidden />}
        title={t("auth.resetExpiredTitle")}
        subtitle={t("auth.resetExpiredBody")}
        footer={backToLogin}
      >
        <Button type="button" size="lg" fullWidth onClick={() => router.replace("/forgot-password")}>
          {t("auth.startOver")}
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      step={{ current: 3, total: 3 }}
      icon={<LockKeyhole size={22} strokeWidth={2} aria-hidden />}
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle")}
      footer={backToLogin}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

        <Button type="submit" size="lg" fullWidth loading={reset.isPending} className="mt-2">
          {t(reset.isPending ? "auth.resetting" : "auth.resetButton")}
        </Button>
      </form>
    </AuthShell>
  );
}
