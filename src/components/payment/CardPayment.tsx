"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard, Loader2, Lock, ShieldCheck, TimerOff } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import { useCardPayment } from "@/hooks/useCardPayment";
import { readPendingCardPayment, type PendingCardPayment } from "@/lib/pendingPayment";
import { cardPaymentSchema, type CardPaymentRequest } from "@/schemas/cardPayment.schema";
import { ERROR_TEXT, FIELD, LABEL, RequiredMark } from "@/components/forms/itemListForm";
import { cn } from "@/components/ui/cn";

/** "4111111111111111" → "4111 1111 1111 1111" (Amex's 4-6-5 is close enough to read). */
const groupCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

/** Digits as typed → "YY / MM". */
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

function brandOf(number: string) {
  const d = number.replace(/\D/g, "");
  if (/^4/.test(d)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "MASTERCARD";
  if (/^3[47]/.test(d)) return "AMEX";
  if (/^6(011|5)/.test(d)) return "DISCOVER";
  return "";
}

/**
 * `/payment/card?trx=…` - the card form for Authorize.net, the one gateway the
 * site charges on its own page instead of redirecting away.
 *
 * A checkout that picked an Authorize currency leaves the transaction, the
 * amounts and the endpoint in session storage (`savePendingCardPayment`) and
 * comes here. Without that record - another tab, an old link - the page says
 * the payment has expired rather than taking a card for an unknown order.
 *
 * The card is posted, never stored: not in the form's defaults, not in
 * storage, not in the URL.
 */
export function CardPayment() {
  const { t } = useLang();
  const isClient = useIsClient();
  const trx = useSearchParams().get("trx") ?? "";
  const pending = isClient && trx ? readPendingCardPayment(trx) : null;

  return (
    <section className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(36px,5vw,80px)]">
      <div className="mx-auto max-w-[560px]">
        {!isClient ? (
          <div aria-hidden className="h-[520px] animate-pulse border border-border bg-card" />
        ) : !pending ? (
          <div className="flex flex-col items-center gap-3 border border-border bg-card px-6 py-[clamp(36px,5vw,56px)] text-center">
            <span className="flex h-14 w-14 items-center justify-center bg-brand/12 text-brand">
              <TimerOff size={24} strokeWidth={1.6} aria-hidden />
            </span>
            <h1 className="text-[clamp(20px,2.2vw,26px)] leading-tight">{t("cardPayment.expired")}</h1>
            <p className="max-w-[40ch] text-[14px] text-muted">{t("cardPayment.expiredHint")}</p>
            <Link
              href="/dashboard"
              className="mt-2 flex h-12 items-center gap-2.5 bg-primary px-6 font-display text-[14px] font-bold tracking-[0.13em] text-white uppercase transition-colors hover:bg-primary-dark"
            >
              {t("cardPayment.toOrders")}
            </Link>
          </div>
        ) : (
          <CardForm pending={pending} />
        )}
      </div>
    </section>
  );
}

function CardForm({ pending }: { pending: PendingCardPayment }) {
  const { t } = useLang();
  const pay = useCardPayment(pending);
  const [brand, setBrand] = useState("");
  const s = pending.summary;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CardPaymentRequest>({
    resolver: zodResolver(cardPaymentSchema),
    defaultValues: { card_number: "", date: "", code: "" },
  });

  const rows = [
    [t("cardPayment.amount"), s.request_amount],
    [t("cardPayment.charge"), s.total_charge],
    [t("cardPayment.rate"), s.exchange_rate],
  ].filter(([, v]) => v);

  return (
    <div className="flex flex-col border border-border bg-card shadow-[0_24px_60px_-40px_rgba(0,0,0,0.45)]">
      {/* ── What is being paid ── */}
      <div className="flex flex-col gap-3 border-b border-border bg-sunk p-[clamp(18px,2.2vw,26px)]">
        <span className="flex items-center justify-between gap-3">
          <span className="font-display text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">
            {s.gateway_currency_name ?? t("cardPayment.title")}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ok">
            <ShieldCheck size={14} strokeWidth={2.2} aria-hidden />
            {t("cardPayment.secure")}
          </span>
        </span>
        {s.payable_amount && (
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[14px] font-medium text-body">{t("cardPayment.payable")}</span>
            <span className="text-[clamp(24px,2.6vw,30px)] leading-none font-black tracking-[-0.02em] text-brand tabular-nums">
              {s.payable_amount}
            </span>
          </span>
        )}
        {rows.length > 0 && (
          <dl className="flex flex-col gap-1.5 border-t border-border pt-3">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 text-[13px]">
                <dt className="text-muted">{k}</dt>
                <dd className="font-semibold text-heading tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* ── The card ── */}
      <form
        noValidate
        onSubmit={handleSubmit((v) => pay.mutate(v))}
        className="flex flex-col gap-5 p-[clamp(18px,2.2vw,26px)]"
      >
        <h1 className="flex items-center gap-2.5 text-[clamp(20px,2.2vw,24px)] leading-tight tracking-[-0.02em]">
          <CreditCard size={20} strokeWidth={2} aria-hidden className="text-brand" />
          {t("cardPayment.title")}
        </h1>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="card-number" className={LABEL}>
            {t("cardPayment.number")}
            <RequiredMark />
          </label>
          <div className="relative">
            <Controller
              name="card_number"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="card-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 1234 1234 1234"
                  aria-invalid={errors.card_number ? true : undefined}
                  onChange={(e) => {
                    const v = groupCard(e.target.value);
                    setBrand(brandOf(v));
                    field.onChange(v);
                  }}
                  className={cn(FIELD, "pe-28 tabular-nums tracking-[0.06em]", errors.card_number ? "border-danger" : "border-border")}
                />
              )}
            />
            <span className="pointer-events-none absolute inset-y-0 inset-e-3 flex items-center">
              {brand ? (
                <span className="bg-primary/10 px-2 py-1 font-display text-[10.5px] font-bold tracking-[0.12em] text-brand">
                  {brand}
                </span>
              ) : (
                <CreditCard size={18} strokeWidth={1.8} aria-hidden className="text-muted" />
              )}
            </span>
          </div>
          {errors.card_number && <span className={ERROR_TEXT}>{errors.card_number.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="card-expiry" className={LABEL}>
              {t("cardPayment.expiry")}
              <RequiredMark />
            </label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="card-expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="YY / MM"
                  aria-invalid={errors.date ? true : undefined}
                  onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                  className={cn(FIELD, "tabular-nums", errors.date ? "border-danger" : "border-border")}
                />
              )}
            />
            {errors.date && <span className={ERROR_TEXT}>{errors.date.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="card-code" className={LABEL}>
              {t("cardPayment.code")}
              <RequiredMark />
            </label>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="card-code"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="CVC"
                  maxLength={4}
                  aria-invalid={errors.code ? true : undefined}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={cn(FIELD, "tabular-nums", errors.code ? "border-danger" : "border-border")}
                />
              )}
            />
            {errors.code && <span className={ERROR_TEXT}>{errors.code.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={pay.isPending}
          aria-busy={pay.isPending}
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 bg-primary font-display text-[14.5px] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
        >
          {pay.isPending ? (
            <Loader2 size={16} strokeWidth={2.6} aria-hidden className="animate-spin" />
          ) : (
            <Lock size={15} strokeWidth={2.4} aria-hidden />
          )}
          {s.payable_amount ? `${t("cardPayment.pay")} ${s.payable_amount}` : t("cardPayment.pay")}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link
            href={pending.cancelHref}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted transition-colors hover:text-brand"
          >
            <ArrowLeft size={14} strokeWidth={2.4} aria-hidden className="rtl:rotate-180" />
            {t("cardPayment.back")}
          </Link>
          <span className="flex items-center gap-1.5 text-[12px] text-muted">
            <Lock size={12} strokeWidth={2.4} aria-hidden />
            {t("cardPayment.notStored")}
          </span>
        </div>
      </form>
    </div>
  );
}
