"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Apple, Check, Copy, Shield, ShieldCheck, TriangleAlert } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGoogle2fa, useUpdate2faStatus } from "@/hooks/useSecurity";
import { Panel, PanelHeader, PANEL_BODY, FieldLabel, SkLine } from "@/components/dashboard/Panel";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { applyServerErrors } from "@/components/auth/serverErrors";
import { twoFaToggleSchema, type TwoFaToggleRequest } from "@/schemas/profile.schema";
import type { Google2faData } from "@/services/security.service";

/** Google Authenticator's asterisk mark — six arms round a centre. */
function GALogo() {
  return (
    <svg viewBox="0 0 96 96" width={72} height={72} aria-hidden>
      {[
        ["#EA4335", 0], ["#4285F4", 60], ["#FBBC05", 120],
        ["#34A853", 240], ["#4285F4", 300],
      ].map(([fill, deg], i) => (
        <rect key={i} x="42" y="8" width="12" height="38" rx="6" fill={fill as string}
          transform={`rotate(${deg} 48 48)`} />
      ))}
      <rect x="42" y="50" width="12" height="38" rx="6" fill="#EA4335" />
    </svg>
  );
}

/**
 * The endpoint returns the QR as a full SVG DOCUMENT, not a URL (it used to be
 * a URL, and may be again). Wrapping the markup in a data URI keeps it an
 * `<img>`: an SVG loaded that way is rendered without scripting, so markup
 * coming back from the API cannot execute anything. A plain URL passes through.
 */
const qrSrcFrom = (qr: string) =>
  qr.trimStart().startsWith("<") ? `data:image/svg+xml;utf8,${encodeURIComponent(qr)}` : qr;

function SecuritySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-[clamp(16px,1.8vw,24px)] min-[1180px]:grid-cols-[minmax(0,1fr)_380px]">
      {[0, 1].map((i) => (
        <Panel key={i}>
          <div className="border-b border-border p-[clamp(16px,1.6vw,22px)]"><SkLine className="h-4 w-44" /></div>
          <div className={`flex flex-col gap-5 ${PANEL_BODY}`}>
            <SkLine className="h-14 w-full" />
            <SkLine className="h-11 w-full" />
            <SkLine className="mx-auto h-52 w-52" />
            <SkLine className="h-12 w-full" />
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function Security() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: res, isLoading } = useGoogle2fa();
  const twoFa = (res as { data?: Google2faData } | undefined)?.data;
  const secret = twoFa?.qr_secrete ?? "";
  const qrSrc = twoFa?.qr_code ? qrSrcFrom(twoFa.qr_code) : "";
  const enabled = twoFa?.qr_status === 1;

  const update2fa = useUpdate2faStatus();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TwoFaToggleRequest>({
    resolver: zodResolver(twoFaToggleSchema),
    defaultValues: { code: "" },
  });

  function openConfirm() {
    reset({ code: "" });
    setConfirmOpen(true);
  }

  const onConfirm = ({ code }: TwoFaToggleRequest) =>
    update2fa.mutate(
      { status: enabled ? 0 : 1, code },
      {
        onSuccess: () => { setConfirmOpen(false); reset({ code: "" }); },
        onError: (err) => applyServerErrors(err, setError, { code: "code" }),
      },
    );

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard permission — the field is selectable, so nothing is lost.
    }
  }

  if (isLoading && !twoFa) return <SecuritySkeleton />;

  const steps = [1, 2, 3, 4].map((n) => t(`dashboard.security.step${n}`));

  return (
    <div className="grid grid-cols-1 items-start gap-[clamp(16px,1.8vw,24px)] min-[1180px]:grid-cols-[minmax(0,1fr)_380px]">
      {/* ── setup ── */}
      <Panel>
        <PanelHeader title={t("dashboard.security.twoFactorTitle")}>
          {enabled && (
            <span className="inline-flex flex-none items-center gap-1.5 bg-ok/14 px-2.5 py-1 text-[11.5px] font-bold tracking-[0.1em] text-ok uppercase">
              <ShieldCheck size={13} strokeWidth={2.5} aria-hidden />
              {t("dashboard.security.enabledBadge")}
            </span>
          )}
        </PanelHeader>

        <div className={`flex flex-col gap-6 ${PANEL_BODY}`}>
          <div
            className={`flex items-center gap-3 border px-4 py-3.5 ${
              enabled ? "border-ok/30 bg-ok/8" : "border-warn/30 bg-warn/8"
            }`}
          >
            {enabled ? (
              <ShieldCheck size={18} strokeWidth={2} className="flex-none text-ok" aria-hidden />
            ) : (
              <TriangleAlert size={18} strokeWidth={2} className="flex-none text-warn" aria-hidden />
            )}
            <p className={`text-[13.5px] font-medium ${enabled ? "text-ok" : "text-warn"}`}>
              {t(enabled ? "dashboard.security.activeBanner" : "dashboard.security.notProtectedBanner")}
            </p>
          </div>

          {/* secret */}
          <div>
            <FieldLabel required>{t("dashboard.security.secretKeyLabel")}</FieldLabel>
            <div className="flex h-11 border border-border bg-surface focus-within:border-primary">
              <input
                readOnly
                value={secret}
                aria-label={t("dashboard.security.secretKeyLabel")}
                className="min-w-0 flex-1 bg-transparent px-4 font-mono text-[13.5px] font-medium text-heading outline-none"
              />
              <button
                type="button"
                onClick={copySecret}
                aria-label={t(copied ? "dashboard.security.copied" : "dashboard.security.copySecretKey")}
                className={`flex flex-none cursor-pointer items-center border-s border-border px-4 transition-colors ${
                  copied ? "bg-ok/14 text-ok" : "text-muted hover:bg-brand/10 hover:text-brand"
                }`}
              >
                {copied ? <Check size={15} strokeWidth={2.5} aria-hidden /> : <Copy size={15} strokeWidth={2} aria-hidden />}
              </button>
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted">{t("dashboard.security.secretKeyHelp")}</p>
          </div>

          {/* QR — always on white: a scanner needs the light quiet zone, so this
              one surface deliberately does not follow the theme. */}
          <div className="flex justify-center">
            <div className="border border-border bg-white p-4">
              {qrSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element -- data-URI QR built at runtime in a static export */
                <img src={qrSrc} alt={t("dashboard.security.qrAlt")} width={224} height={224} className="h-56 w-56 max-w-full" />
              ) : (
                <SkLine className="h-56 w-56" />
              )}
            </div>
          </div>

          <Button
            variant={enabled ? "danger" : "primary"}
            size="lg"
            fullWidth
            disabled={!secret}
            onClick={openConfirm}
            leftIcon={enabled ? <Shield size={17} strokeWidth={2.5} aria-hidden /> : <ShieldCheck size={17} strokeWidth={2.5} aria-hidden />}
          >
            {t(enabled ? "dashboard.security.disable2fa" : "dashboard.security.enable")}
          </Button>
        </div>
      </Panel>

      {/* ── the app ── */}
      <Panel>
        <PanelHeader title={t("dashboard.security.googleAuthTitle")} />
        <div className={`flex flex-col gap-6 ${PANEL_BODY}`}>
          <p className="text-[13.5px] leading-[1.6]">{t("dashboard.security.googleAuthDesc")}</p>

          <div className="flex justify-center">
            <span className="flex h-32 w-32 items-center justify-center border border-border bg-white">
              <GALogo />
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2.5 bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-dark hover:text-white"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
                <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5c.5.3.5 1 0 1.3L4.5 21c-.5.33-1.5.33-1.5-.5z" />
              </svg>
              {t("dashboard.security.downloadAndroid")}
            </a>
            <a
              href="https://apps.apple.com/us/app/google-authenticator/id388497605"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2.5 bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-dark hover:text-white"
            >
              <Apple size={16} strokeWidth={2} aria-hidden />
              {t("dashboard.security.downloadIos")}
            </a>
          </div>

          <div className="border border-border bg-sunk p-4">
            <span className="text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">
              {t("dashboard.security.setupSteps")}
            </span>
            <ol className="mt-3 flex flex-col gap-2.5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 flex-none items-center justify-center bg-brand/14 text-[11px] font-bold text-brand">
                    {i + 1}
                  </span>
                  <span className="text-[12.5px] leading-[1.5] font-normal">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit(onConfirm)}
        busy={update2fa.isPending}
        tone={enabled ? "danger" : "primary"}
        icon={enabled ? <Shield size={22} strokeWidth={2} aria-hidden /> : <ShieldCheck size={22} strokeWidth={2} aria-hidden />}
        title={t(enabled ? "dashboard.security.disableTitle" : "dashboard.security.enableTitle")}
        description={t(enabled ? "dashboard.security.disableDesc" : "dashboard.security.enableDesc")}
        confirmLabel={t(enabled ? "dashboard.security.disable2fa" : "dashboard.security.enable")}
      >
        {/* A code is required to turn 2FA OFF as well as on — otherwise a stolen
            session is enough to strip the second factor. */}
        <div className="mt-5 text-start">
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                label={t("dashboard.security.authCodeLabel")}
                hint={t("dashboard.security.authCodeHelp")}
                error={errors.code?.message}
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center font-mono text-lg tracking-[0.5em]"
              />
            )}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
