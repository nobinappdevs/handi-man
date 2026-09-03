"use client";

import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowRight, Banknote, Wallet } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY, FieldLabel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DASH_ROUTES } from "@/components/dashboard/dashboardData";
import { PAYOUT_METHODS, VENDOR_BALANCE } from "@/components/dashboard/page/vendor/vendorData";

/** Money is a string on the wire; parse once, here, rather than at each use. */
const toNumber = (money: string) => Number(money.replace(/[^\d.]/g, "")) || 0;

const AVAILABLE = toNumber(VENDOR_BALANCE.available);
const MINIMUM = toNumber(VENDOR_BALANCE.minimum);
/** Flat 1% of the requested amount, matching the log's fee column. */
const FEE_RATE = 0.01;

/* A string field, not `z.coerce.number`: coerce types its INPUT as `unknown`,
   which will not line up with a controlled `<input>` value. The input hands
   over a string either way, so validate the string and convert once. */
const payoutSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount")
    .refine((v) => Number(v) > 0, "Enter an amount")
    .refine((v) => Number(v) >= MINIMUM, `The minimum payout is ${VENDOR_BALANCE.minimum}`)
    .refine((v) => Number(v) <= AVAILABLE, "That is more than your available balance"),
  method: z.string().min(1, "Choose where to send it"),
});
type PayoutRequest = z.infer<typeof payoutSchema>;

const money = (n: number) =>
  `৳ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function MoneyOut() {
  const { t } = useLang();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PayoutRequest>({
    resolver: zodResolver(payoutSchema),
    defaultValues: { amount: "", method: PAYOUT_METHODS[0].key },
  });

  /* `useWatch`, not `watch()` — the React Compiler is on. */
  const amount = Number(useWatch({ control, name: "amount" })) || 0;
  const fee = amount * FEE_RATE;

  /* No payout endpoint yet. The form, its validation and the arithmetic are
     real; the submit is the one part waiting on the API. */
  const onSubmit = () => {
    toast.success(t("dashboard.vendor.moneyOut.requested"));
    reset({ amount: "", method: PAYOUT_METHODS[0].key });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-[clamp(16px,1.8vw,24px)] min-[1180px]:grid-cols-[minmax(0,1fr)_360px]">
      <Panel>
        <PanelHeader title={t("dashboard.vendor.moneyOut.title")} />
        <form noValidate onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-5 ${PANEL_BODY}`}>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                required
                type="number"
                inputMode="decimal"
                label={t("dashboard.vendor.moneyOut.amount")}
                placeholder="0.00"
                hint={`${t("dashboard.vendor.moneyOut.minimum")} ${VENDOR_BALANCE.minimum}`}
                leftIcon={<Banknote size={14} strokeWidth={2} aria-hidden />}
                error={errors.amount?.message}
              />
            )}
          />

          <div>
            <FieldLabel required>{t("dashboard.vendor.moneyOut.method")}</FieldLabel>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={PAYOUT_METHODS.map((m) => ({
                    value: m.key,
                    label: `${t(`dashboard.history.payment.${m.key === "bank" ? "card" : m.key}`)} ${m.detail}`,
                  }))}
                  placeholder={t("dashboard.vendor.moneyOut.methodPlaceholder")}
                  required
                />
              )}
            />
            {errors.method?.message && (
              <p className="mt-1.5 text-xs text-danger">{errors.method.message}</p>
            )}
          </div>

          {/* Shown live rather than after submitting: the fee is the thing a
              vendor is deciding against, so it has to move with the amount. */}
          <div className="flex flex-col gap-2 border border-border bg-sunk px-4 py-3.5">
            <span className="flex items-baseline justify-between gap-3 text-[13px] text-muted">
              {t("dashboard.vendor.moneyOut.requesting")}
              <span className="font-bold text-heading">{money(amount)}</span>
            </span>
            <span className="flex items-baseline justify-between gap-3 text-[13px] text-muted">
              {t("dashboard.vendor.moneyOut.fee")}
              <span className="font-bold text-heading">−{money(fee)}</span>
            </span>
            <span className="flex items-baseline justify-between gap-3 border-t border-border pt-2.5 text-[13px] font-bold tracking-[0.1em] text-heading uppercase">
              {t("dashboard.vendor.moneyOut.youReceive")}
              <span className="text-[18px] tracking-[-0.02em]">{money(amount - fee)}</span>
            </span>
          </div>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {t("dashboard.vendor.moneyOut.submit")}
          </Button>
        </form>
      </Panel>

      <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
        <section className="relative overflow-hidden bg-rail p-[clamp(18px,1.9vw,24px)]">
          <div aria-hidden className="absolute inset-y-0 -right-10 w-30 skew-x-[-13deg] bg-primary opacity-85" />
          <div className="relative flex flex-col gap-4">
            <span className="flex items-center gap-2 text-[12px] font-bold tracking-[0.13em] text-primary-on-dark uppercase">
              <Wallet size={14} strokeWidth={2.4} aria-hidden />
              {t("dashboard.vendor.overview.available")}
            </span>
            <span className="text-[clamp(26px,2.6vw,34px)] leading-none font-bold tracking-[-0.03em] text-white">
              {VENDOR_BALANCE.available}
            </span>
            <span className="flex items-center justify-between gap-3 border-t border-white/15 pt-3.5 text-[13px] text-white/65">
              {t("dashboard.vendor.overview.pending")}
              <span className="font-bold text-white">{VENDOR_BALANCE.pending}</span>
            </span>
          </div>
        </section>

        <Panel>
          <div className={`flex flex-col gap-3 ${PANEL_BODY}`}>
            <span className="text-[13px] leading-[1.55] text-body">
              {t("dashboard.vendor.moneyOut.note")}
            </span>
            <Link
              href={DASH_ROUTES.moneyOutLogs}
              className="flex items-center gap-2 text-[12.5px] font-bold tracking-[0.12em] text-brand uppercase"
            >
              {t("dashboard.vendor.moneyOut.seeLogs")}
              <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
