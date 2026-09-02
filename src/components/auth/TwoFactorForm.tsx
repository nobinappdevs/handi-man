"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useVerifyGoogle2fa } from "@/hooks/useAuth";
import { clearAuthState } from "@/lib/authState";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpInput } from "@/components/auth/OtpInput";
import { OTP_LENGTH } from "@/components/auth/authData";

/**
 * The authenticator step, for accounts with Google 2FA switched on. `useLogin`
 * and `useEmailVerify` both route here when the session still owes a code, and
 * `AuthGuard` keeps the dashboard shut until it is answered.
 *
 * No resend and no countdown, unlike the email OTP: a TOTP code is generated on
 * the user's own device, so there is nothing to re-send — the next one is
 * thirty seconds away in their app.
 *
 * The way out drops the session. The half-authenticated token is real, so
 * merely navigating to /login would have `GuestGuard` read "logged in" and
 * bounce the user straight back here.
 */
export function TwoFactorForm() {
  const { t } = useLang();
  const router = useRouter();
  const verify = useVerifyGoogle2fa();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < OTP_LENGTH) return;
    verify.mutate(code);
  };

  const handleSignOut = () => {
    clearAuthState();
    router.replace("/login");
  };

  return (
    <AuthShell
      icon={<ShieldCheck size={22} strokeWidth={2} aria-hidden />}
      title={t("auth.twoFaTitle")}
      subtitle={t("auth.twoFaSubtitle")}
      footer={
        <p className="text-center text-[13.5px] text-muted">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex cursor-pointer items-center gap-1.5 font-bold text-heading underline underline-offset-2"
          >
            <ArrowLeft size={14} strokeWidth={2.4} aria-hidden />
            {t("auth.useDifferentAccount")}
          </button>
        </p>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <OtpInput value={code} onChange={setCode} disabled={verify.isPending} autoFocus />

        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-[13px] leading-[1.5] text-muted">
          {t("auth.twoFaHelp")}
        </p>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={verify.isPending}
          disabled={code.length < OTP_LENGTH}
        >
          {t(verify.isPending ? "auth.verifying" : "auth.otpButton")}
        </Button>
      </form>
    </AuthShell>
  );
}
