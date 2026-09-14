"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MailCheck, RotateCcw } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import {
  useEmailVerify,
  useForgotResendOtp,
  useForgotVerifyOtp,
  useResendEmail,
  authRoutes,
} from "@/hooks/useAuth";
import {
  clearAuthState,
  readOtpEmail,
  readOtpFlow,
  readOtpOrigin,
  readResetEmail,
  readResetToken,
  type AuthRole,
} from "@/lib/authState";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpInput } from "@/components/auth/OtpInput";
import { OTP_LENGTH, RESEND_SECONDS } from "@/components/auth/authData";

/**
 * One screen, two flows. `handiman_otp_flow` says which:
 *
 *   "email" — a fresh signup, or a login against an unverified account. The
 *             code goes to `{base}/email/otp/verify` and the token the user
 *             already holds authenticates the call.
 *   "reset"  — the middle of a password reset. The code goes to
 *             `{base}/forgot/password/verify` together with the reset token.
 *
 * The two flows resend through DIFFERENT endpoints, which is why there are two
 * resend hooks below: `email/resend/code` re-mails the signup code, while
 * `forgot/password/resend/code` rotates the reset token and must store what it
 * gets back.
 *
 * Flow, origin and address are read once, in lazy initialisers: they come from
 * sessionStorage, which does not exist on the server, so anything RENDERED from
 * them is gated behind `useIsClient` to keep the server and hydration paints
 * identical. Using them inside a handler needs no such gate.
 *
 * No auto-submit on the last digit: a mistyped or half-pasted code would spend
 * an attempt the user never chose to make.
 */
export function OtpForm({ role = "user" }: { role?: AuthRole }) {
  const { t } = useLang();
  const router = useRouter();
  const isClient = useIsClient();
  const routes = authRoutes(role);

  const [flow] = useState(() => readOtpFlow(role));
  const [origin] = useState(() => readOtpOrigin(role));
  const [sentTo] = useState(() => readOtpEmail(role));
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  const emailVerify = useEmailVerify(role);
  const forgotVerify = useForgotVerifyOtp(role);
  const resendEmail = useResendEmail(role);
  const forgotResend = useForgotResendOtp(role);

  const isVerifying = emailVerify.isPending || forgotVerify.isPending;
  const isResending = resendEmail.isPending || forgotResend.isPending;

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < OTP_LENGTH) return;
    if (flow === "reset") {
      forgotVerify.mutate({ otp: code, token: readResetToken(role) });
      return;
    }
    emailVerify.mutate(code);
  };

  /*
   * The countdown restarts only once the backend confirms a code went out.
   * Resetting it up front would punish the user for the API's own rate limit —
   * "You can resend verification code after 38 seconds" comes back as a
   * failure, and they'd be made to sit through a fresh 60 on top of it.
   */
  const restartCountdown = {
    onSuccess: () => {
      setCode("");
      setSeconds(RESEND_SECONDS);
    },
  };

  const handleResend = () => {
    if (isResending) return;
    if (flow === "reset") {
      const email = readResetEmail(role);
      if (email) forgotResend.mutate(email, restartCountdown);
      return;
    }
    resendEmail.mutate(undefined, restartCountdown);
  };

  /**
   * Escape hatch for a mistyped signup address. The half-finished account still
   * holds a real token, so it has to go — otherwise `GuestGuard` reads "logged
   * in" and throws the user straight back here.
   */
  const handleStartOver = () => {
    clearAuthState(role);
    router.replace(origin === "register" ? routes.register : routes.login);
  };

  const linkClass =
    "inline-flex cursor-pointer items-center gap-1.5 font-bold text-heading underline underline-offset-2";

  const subtitle =
    isClient && sentTo ? (
      <>
        {t("auth.otpSentTo")}{" "}
        <strong className="font-bold text-heading">{sentTo}</strong>
      </>
    ) : (
      t("auth.otpSubtitle")
    );

  let footer = (
    <p className="text-center text-[13.5px] text-muted">
      <Link href={routes.forgotPassword} className={linkClass}>
        <ArrowLeft size={14} strokeWidth={2.4} aria-hidden />
        {t("auth.backToForgot")}
      </Link>
    </p>
  );

  if (isClient && flow === "email") {
    // The reset flow came from /forgot-password and can simply go back there.
    // The email flow has no way back at all without this — a typo in the signup
    // address would strand the user on a code they can never receive.
    footer =
      origin === "register" ? (
        <p className="text-center text-[13.5px] text-muted">
          {t("auth.wrongEmail")}{" "}
          <button type="button" onClick={handleStartOver} className={linkClass}>
            {t("auth.useDifferentEmail")}
          </button>
        </p>
      ) : (
        <p className="text-center text-[13.5px] text-muted">
          <button type="button" onClick={handleStartOver} className={linkClass}>
            <ArrowLeft size={14} strokeWidth={2.4} aria-hidden />
            {t("auth.backToLogin")}
          </button>
        </p>
      );
  }

  return (
    <AuthShell
      step={isClient && flow === "reset" ? { current: 2, total: 3 } : undefined}
      icon={<MailCheck size={22} strokeWidth={2} aria-hidden />}
      title={t("auth.otpTitle")}
      subtitle={subtitle}
      footer={footer}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <OtpInput value={code} onChange={setCode} disabled={isVerifying} autoFocus />

        <div className="border border-border bg-surface px-4 py-3 text-center">
          {seconds > 0 ? (
            <span className="inline text-[13.5px] text-muted">
              {t("auth.resendIn")}{" "}
              <strong className="font-bold text-heading tabular-nums">{seconds}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex cursor-pointer items-center gap-1.5 text-[13.5px] font-bold text-brand hover:underline disabled:opacity-60"
            >
              <RotateCcw size={13} strokeWidth={2.5} aria-hidden />
              {t(isResending ? "auth.resending" : "auth.resendCode")}
            </button>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isVerifying}
          disabled={code.length < OTP_LENGTH}
        >
          {t(isVerifying ? "auth.verifying" : "auth.otpButton")}
        </Button>
      </form>
    </AuthShell>
  );
}
