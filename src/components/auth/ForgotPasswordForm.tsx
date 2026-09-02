"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useForgotSendOtp } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { applyServerErrors } from "@/components/auth/serverErrors";
import { forgotRequestSchema, type ForgotRequest } from "@/schemas/auth.schema";

/**
 * Step 1 of the reset: name the account. `useForgotSendOtp` stashes the address
 * and the reset token, then moves the user on to the code screen.
 *
 * The endpoint rejects an unknown address under `credentials`, not `email` —
 * that mapping is the whole reason `applyServerErrors` takes one.
 */
export function ForgotPasswordForm() {
  const { t } = useLang();
  const forgot = useForgotSendOtp();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotRequest>({
    resolver: zodResolver(forgotRequestSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotRequest) =>
    forgot.mutate(data.email, {
      onError: (err) =>
        applyServerErrors(err, setError, { credentials: "email", email: "email" }),
    });

  return (
    <AuthShell
      step={{ current: 1, total: 3 }}
      icon={<KeyRound size={22} strokeWidth={2} aria-hidden />}
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
      footer={
        <p className="text-center text-[13.5px] text-muted">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-bold text-heading underline underline-offset-2"
          >
            <ArrowLeft size={14} strokeWidth={2.4} aria-hidden />
            {t("auth.backToLogin")}
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

        <Button type="submit" size="lg" fullWidth loading={forgot.isPending} className="mt-2">
          {t(forgot.isPending ? "auth.sendingCode" : "auth.sendCode")}
        </Button>
      </form>
    </AuthShell>
  );
}
