"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, ArrowRightLeft, Banknote, Receipt, Wallet } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Panel, PanelHeader, PANEL_BODY, FieldLabel, SkLine } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DASH_ROUTES } from "@/components/dashboard/dashboardData";
import { applyServerErrors } from "@/components/auth/serverErrors";
import { useMoneyOutInfo, useInsertMoneyOut, useConfirmMoneyOut } from "@/hooks/useMoneyOut";
import { MoneyOutHistory } from "@/components/dashboard/page/vendor/MoneyOutHistory";
import { num, money, formatMoneyString, formatRateString } from "@/lib/money";
import {
  quoteMoneyOut,
  limitsInBaseCurrency,
  payoutOptions,
  type GatewayCurrency,
  type MoInputField,
  type MoneyOutInsertData,
} from "@/services/moneyout.service";

/**
 * The gateway's `details` are admin-authored HTML. Rendered as text, not
 * injected: this is a payout screen, and no instruction block is worth an
 * injection point. Formatting is lost; the wording is not.
 */
function plainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/* ── the summary panel, shared by both steps ── */

function SummaryRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "ok" | "strong";
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span className="flex h-8 w-8 flex-none items-center justify-center bg-brand/14 text-brand">
        {icon}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[13.5px] ${
          tone === "strong" ? "font-bold text-heading" : "text-body"
        }`}
      >
        {label}
      </span>
      <span
        className={`flex-none text-[13.5px] tabular-nums ${
          tone === "ok" ? "font-semibold text-ok" : tone === "strong" ? "text-[15px] font-bold text-warn" : "font-medium text-heading"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-[clamp(16px,1.8vw,24px)] wide:grid-cols-2">
      <Panel>
        <div className={`flex flex-col gap-4 ${PANEL_BODY}`}>
          <SkLine className="h-16 w-full" />
          <SkLine className="h-11 w-full" />
          <SkLine className="h-11 w-full" />
          <SkLine className="h-12 w-full" />
        </div>
      </Panel>
      <Panel>
        <div className={`flex flex-col gap-3 ${PANEL_BODY}`}>
          {Array.from({ length: 5 }, (_, i) => (
            <SkLine key={i} className="h-10 w-full" />
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ── step 1 ── */

type AmountForm = { gateway: string; amount: string };

export function MoneyOut() {
  const { t } = useLang();
  const { data: res, isLoading } = useMoneyOutInfo();
  const insert = useInsertMoneyOut();

  /* The `insert` response IS the second step: holding it here is what advances
     the screen, and dropping it is what goes back. No route change, because a
     reload would strand a `trx` the server has already reserved. */
  const [pending, setPending] = useState<MoneyOutInsertData | null>(null);

  const data = res?.data;
  const baseCurrency = data?.base_curr ?? "";
  const balance = data?.userWallet?.balance ?? 0;
  const options = useMemo(() => payoutOptions(data?.gateways), [data?.gateways]);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<AmountForm>({
    resolver: zodResolver(
      z.object({
        gateway: z.string().min(1, t("dashboard.vendor.moneyOut.chooseGateway")),
        amount: z
          .string()
          .trim()
          .min(1, t("dashboard.vendor.moneyOut.enterAmount"))
          .refine((v) => Number(v) > 0, t("dashboard.vendor.moneyOut.enterAmount")),
      }),
    ),
    defaultValues: { gateway: "", amount: "" },
  });

  const gatewayAlias = useWatch({ control, name: "gateway" }) ?? "";
  const amountRaw = useWatch({ control, name: "amount" }) ?? "";
  const amount = Number(amountRaw) || 0;

  /* Everything below the picker hangs off THIS object — rate, limits, charge
     and currency. Changing the gateway changes the selection, and every figure
     re-derives; there is no separate state to keep in step. */
  const selected: GatewayCurrency | undefined = options.find((o) => o.alias === gatewayAlias);
  const quote = selected ? quoteMoneyOut(amount, selected) : null;
  const limits = selected ? limitsInBaseCurrency(selected) : null;

  const onSubmit = ({ gateway, amount: value }: AmountForm) => {
    if (!selected || !limits) return;
    const entered = Number(value);
    // Checked here as well as by the backend so the vendor is told before a
    // round trip — the API's own refusal is just "Please follow the
    // transaction limit!", which does not say what the limit is.
    if (entered > balance) {
      setError("amount", { type: "manual", message: t("dashboard.vendor.moneyOut.overBalance") });
      return;
    }
    if (entered < limits.min || entered > limits.max) {
      setError("amount", {
        type: "manual",
        message: `${t("dashboard.vendor.moneyOut.limitIs")} ${money(limits.min, baseCurrency)} – ${money(limits.max, baseCurrency)}`,
      });
      return;
    }
    insert.mutate(
      { gateway, amount: entered },
      { onSuccess: (r) => setPending(r.data) },
    );
  };

  if (isLoading && !data) return <Skeleton />;

  if (pending) {
    return <ConfirmStep info={pending} onBack={() => setPending(null)} />;
  }

  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      <div className="grid grid-cols-1 items-start gap-[clamp(16px,1.8vw,24px)] wide:grid-cols-2">
      <Panel>
        <PanelHeader title={t("dashboard.vendor.moneyOut.title")} />
        <form noValidate onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-5 ${PANEL_BODY}`}>
          {/* The rate is the headline: it is what changes when the gateway does,
              and the reason the same amount pays out differently. */}
          {selected && (
            <div className="border border-border bg-surface px-4 py-3 text-center">
              <p className="text-[12.5px] font-semibold tracking-[0.08em] text-muted uppercase">
                {t("dashboard.vendor.moneyOut.exchangeRate")}
              </p>
              <p className="mt-1 text-[15px] font-bold tabular-nums text-heading">
                1 {baseCurrency} = {num(selected.rate, 4)} {selected.currency_code}
              </p>
            </div>
          )}

          <div>
            <FieldLabel required>{t("dashboard.vendor.moneyOut.method")}</FieldLabel>
            <Controller
              name="gateway"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={options.map((o) => ({
                    value: o.alias,
                    label: o.name,
                    sub: `1 ${baseCurrency} = ${num(o.rate, 4)} ${o.currency_code}`,
                    keywords: `${o.name} ${o.currency_code}`,
                  }))}
                  placeholder={t("dashboard.vendor.moneyOut.methodPlaceholder")}
                  leftIcon={<Banknote size={14} strokeWidth={2} aria-hidden />}
                />
              )}
            />
            {errors.gateway && (
              <p className="mt-1.5 text-[12.5px] text-danger">{errors.gateway.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  required
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  label={t("dashboard.vendor.moneyOut.amount")}
                  placeholder={t("dashboard.vendor.moneyOut.amountPlaceholder")}
                  error={errors.amount?.message}
                  rightIcon={
                    <span className="text-[12.5px] font-bold text-heading">{baseCurrency}</span>
                  }
                />
              )}
            />
            <p className="mt-1.5 text-end text-[12.5px] text-muted">
              {t("dashboard.vendor.moneyOut.available")}{" "}
              <strong className="font-bold text-heading tabular-nums">
                {money(balance, data?.userWallet?.currency ?? baseCurrency)}
              </strong>
            </p>
          </div>

          {/* Limit and charge, both per gateway and both in the currency the
              vendor is reading at the time. */}
          {selected && limits && (
            <div className="flex flex-wrap justify-between gap-2 text-[12.5px] text-muted">
              <span>
                {t("dashboard.vendor.moneyOut.limit")}{" "}
                <strong className="font-semibold text-heading tabular-nums">
                  {money(limits.min, baseCurrency)} – {money(limits.max, baseCurrency)}
                </strong>
              </span>
              <span>
                {t("dashboard.vendor.moneyOut.charge")}{" "}
                <strong className="font-semibold text-heading tabular-nums">
                  {money(selected.fixed_charge, selected.currency_code)} + {num(selected.percent_charge, 2)}% ={" "}
                  {money(quote?.charge ?? selected.fixed_charge, selected.currency_code)}
                </strong>
              </span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={insert.isPending}
            disabled={!selected}
            rightIcon={<ArrowRight size={16} strokeWidth={2.4} aria-hidden className="rtl:rotate-180" />}
          >
            {t("dashboard.vendor.moneyOut.submit")}
          </Button>
        </form>
      </Panel>

      {/* Always the five rows, never a placeholder: the breakdown is the
          shape of the decision being made, and swapping it for a sentence
          made the panel jump the moment a gateway was picked. With nothing
          selected the figures read "—" rather than a zero, because a zero in
          an unknown currency is a claim we cannot make yet. */}
      <Panel>
        <PanelHeader title={t("dashboard.vendor.moneyOut.preview")} />
        {(() => {
          const code = selected?.currency_code ?? "";
          const base = baseCurrency || "";
          const show = (value: number | null, unit: string) =>
            value === null || !unit ? "—" : money(value, unit);
          return (
            <div>
              <SummaryRow
                icon={<Wallet size={15} strokeWidth={2} aria-hidden />}
                label={t("dashboard.vendor.moneyOut.enteredAmount")}
                value={show(quote ? quote.payable : null, base)}
              />
              <SummaryRow
                icon={<ArrowRightLeft size={15} strokeWidth={2} aria-hidden />}
                label={t("dashboard.vendor.moneyOut.conversionAmount")}
                value={show(quote ? quote.conversion : null, code)}
              />
              <SummaryRow
                icon={<Receipt size={15} strokeWidth={2} aria-hidden />}
                label={t("dashboard.vendor.moneyOut.totalCharge")}
                value={show(quote ? quote.charge : null, code)}
              />
              <SummaryRow
                icon={<Banknote size={15} strokeWidth={2} aria-hidden />}
                label={t("dashboard.vendor.moneyOut.willGet")}
                value={show(quote ? quote.willGet : null, code)}
                tone="ok"
              />
              <SummaryRow
                icon={<Wallet size={15} strokeWidth={2} aria-hidden />}
                label={t("dashboard.vendor.moneyOut.payable")}
                value={show(quote ? quote.payable : null, base)}
                tone="strong"
              />
            </div>
          );
        })()}
        </Panel>
      </div>

      {/* The recent payouts, under the form that creates them — same table
          and same record modal as the logs page, capped so it stays a
          reference rather than becoming the page. It reads the query the
          form already made, so it costs no extra request. */}
      <MoneyOutHistory limit={5} />
    </div>
  );
}

/* ── step 2 ── */

/** Values are whatever the gateway asked for — a string, or a File. */
type ConfirmValues = Record<string, string | File | undefined>;

/**
 * The gateway defines this form, so its schema is assembled on arrival — the
 * same approach the KYC screen takes, and for the same reason: the field list
 * is not knowable at build time.
 */
function confirmSchemaFor(fields: MoInputField[], required: string) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    if (f.type === "file") {
      const file = z.instanceof(File, { message: required });
      shape[f.name] = f.required ? file : file.optional();
      continue;
    }
    const text = z.string({ message: required }).trim();
    shape[f.name] = f.required ? text.min(1, required) : text.optional();
  }
  return z.object(shape);
}

function ConfirmStep({ info, onBack }: { info: MoneyOutInsertData; onBack: () => void }) {
  const { t } = useLang();
  const confirm = useConfirmMoneyOut();
  const [done, setDone] = useState(false);

  const fields = info.input_fields ?? [];
  const summary = info.payment_informations;

  const { control, handleSubmit, setError, formState: { errors } } = useForm<ConfirmValues>({
    resolver: zodResolver(
      confirmSchemaFor(fields, t("dashboard.vendor.moneyOut.fieldRequired")),
    ) as never,
    defaultValues: Object.fromEntries(
      fields.filter((f) => f.type !== "file").map((f) => [f.name, ""]),
    ),
  });

  const onSubmit = (values: ConfirmValues) =>
    confirm.mutate(
      { trx: summary.trx, fields: values },
      {
        onSuccess: () => setDone(true),
        onError: (err) =>
          applyServerErrors(err, setError, Object.fromEntries(fields.map((f) => [f.name, f.name]))),
      },
    );

  const instructions = info.details ? plainText(info.details) : "";

  if (done) {
    return (
      <Panel>
        <div className={`flex flex-col items-center gap-3 text-center ${PANEL_BODY}`}>
          <span className="flex h-12 w-12 items-center justify-center bg-ok/14 text-ok">
            <Banknote size={22} strokeWidth={2} aria-hidden />
          </span>
          <h3 className="text-[18px] font-bold tracking-[-0.02em]">
            {t("dashboard.vendor.moneyOut.doneTitle")}
          </h3>
          <p className="text-[13.5px] text-muted">{t("dashboard.vendor.moneyOut.doneBody")}</p>
          <Link
            href={DASH_ROUTES.moneyOutLogs}
            className="mt-1 text-[13px] font-semibold text-brand hover:underline"
          >
            {t("dashboard.vendor.moneyOut.seeLogs")}
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-[clamp(16px,1.8vw,24px)] wide:grid-cols-2">
      <Panel>
        <PanelHeader
          title={`${t("dashboard.vendor.moneyOut.withdrawVia")} ${info.gateway_currency_name}`}
        />
        <form noValidate onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-4 ${PANEL_BODY}`}>
          {instructions && (
            <p className="border border-border bg-surface px-4 py-3 text-[13px] leading-[1.55] whitespace-pre-line text-body">
              {instructions}
            </p>
          )}

          {fields.map((f) => (
            <Controller
              key={f.name}
              name={f.name}
              control={control}
              render={({ field: rhf }) =>
                f.type === "select" ? (
                  <div>
                    <FieldLabel required={f.required}>{f.label}</FieldLabel>
                    <Select
                      value={(rhf.value as string) ?? ""}
                      onChange={rhf.onChange}
                      options={(f.validation?.options ?? []).map((o) => ({ value: o, label: o }))}
                      placeholder={f.label}
                    />
                    {errors[f.name] && (
                      <p className="mt-1.5 text-[12.5px] text-danger">
                        {errors[f.name]?.message as string}
                      </p>
                    )}
                  </div>
                ) : f.type === "file" ? (
                  <div>
                    <FieldLabel required={f.required}>{f.label}</FieldLabel>
                    <input
                      type="file"
                      accept={(f.validation?.mimes ?? []).map((m) => `.${m}`).join(",") || undefined}
                      onChange={(e) => rhf.onChange(e.target.files?.[0])}
                      onBlur={rhf.onBlur}
                      name={rhf.name}
                      className="w-full border border-border bg-surface px-3 py-2.5 text-[13.5px] text-heading"
                    />
                    {errors[f.name] && (
                      <p className="mt-1.5 text-[12.5px] text-danger">
                        {errors[f.name]?.message as string}
                      </p>
                    )}
                  </div>
                ) : (
                  <Input
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    onBlur={rhf.onBlur}
                    name={rhf.name}
                    required={f.required}
                    type={f.type === "number" ? "number" : "text"}
                    label={f.label}
                    placeholder={f.label}
                    error={errors[f.name]?.message as string | undefined}
                  />
                )
              }
            />
          ))}

          <div className="mt-1 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={confirm.isPending}
              className="flex-1"
              leftIcon={<ArrowLeft size={15} strokeWidth={2.4} aria-hidden className="rtl:rotate-180" />}
            >
              {t("common.back")}
            </Button>
            <Button type="submit" loading={confirm.isPending} className="flex-1">
              {t("dashboard.vendor.moneyOut.confirm")}
            </Button>
          </div>
        </form>
      </Panel>

      {/* Straight from the server. Not recomputed: these are the figures the
          backend will act on, and a local number that disagreed would be the
          more convincing of the two. */}
      <Panel>
        <PanelHeader title={t("dashboard.vendor.moneyOut.withdrawInfo")} />
        <div>
          <SummaryRow
            icon={<Wallet size={15} strokeWidth={2} aria-hidden />}
            label={t("dashboard.vendor.moneyOut.enteredAmount")}
            value={formatMoneyString(summary.request_amount)}
          />
          <SummaryRow
            icon={<ArrowRightLeft size={15} strokeWidth={2} aria-hidden />}
            label={t("dashboard.vendor.moneyOut.exchangeRate")}
            value={formatRateString(summary.exchange_rate)}
          />
          <SummaryRow
            icon={<ArrowRightLeft size={15} strokeWidth={2} aria-hidden />}
            label={t("dashboard.vendor.moneyOut.conversionAmount")}
            value={formatMoneyString(summary.conversion_amount)}
          />
          <SummaryRow
            icon={<Receipt size={15} strokeWidth={2} aria-hidden />}
            label={t("dashboard.vendor.moneyOut.totalCharge")}
            value={formatMoneyString(summary.total_charge)}
          />
          <SummaryRow
            icon={<Banknote size={15} strokeWidth={2} aria-hidden />}
            label={t("dashboard.vendor.moneyOut.willGet")}
            value={formatMoneyString(summary.will_get)}
            tone="ok"
          />
          <SummaryRow
            icon={<Wallet size={15} strokeWidth={2} aria-hidden />}
            label={t("dashboard.vendor.moneyOut.totalPayable")}
            value={formatMoneyString(summary.payable)}
            tone="strong"
          />
        </div>
      </Panel>
    </div>
  );
}
