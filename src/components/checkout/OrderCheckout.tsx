"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarClock,
  Check,
  CircleAlert,
  CreditCard,
  Loader2,
  MapPin,
  MapPinned,
  PackageCheck,
  PackageSearch,
  Pencil,
  Plus,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import {
  ORDER_ROUTES,
  useOrderCheckout,
  useOrderPreview,
  useSaveOrderAddress,
  WALLET,
  type OrderPreview,
} from "@/hooks/useOrderCheckout";
import type { OrderKind } from "@/services/orderCheckout.service";
import { orderCheckoutSchema, type OrderCheckoutRequest } from "@/schemas/checkout.schema";
import { Eyebrow } from "@/components/share/Eyebrow";
import { Modal } from "@/components/dashboard/Modal";
import { AddressDialog } from "@/components/dashboard/page/address/AddressDialog";
import { Select, type SelectOption } from "@/components/ui/Select";
import { formatTime12 } from "@/components/ui/TimePicker";
import { ERROR_TEXT, TextField } from "@/components/forms/itemListForm";
import { cn } from "@/components/ui/cn";
import { money } from "@/lib/money";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "16-Oct-2026" (what `useOrderPreview` hands over) or "16-10-2026" → a Date for display. */
function parseDay(value: string) {
  const m = /^(\d{1,2})-([a-z]{3}|\d{1,2})-(\d{4})$/i.exec(value);
  if (!m) return null;
  const month = /^\d+$/.test(m[2]) ? Number(m[2]) - 1 : MONTHS.indexOf(m[2].toLowerCase());
  return month < 0 ? null : new Date(Number(m[3]), month, Number(m[1]));
}

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Whether a slot can no longer be booked on a given date: any day before
 * today, or today once the slot's START has gone by - a rider cannot be sent
 * for an hour that is already under way. Days after today are always open.
 * As on the old web checkout, which greys these out.
 */
export function slotHasPassed(dateValue: string, start: string, now: Date) {
  const day = parseDay(dateValue);
  if (!day) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (day < today) return true;
  if (day > today) return false;
  return minutesOf(start) <= now.getHours() * 60 + now.getMinutes();
}

export const CARD = "flex min-w-0 flex-col gap-4 border border-border bg-card p-[clamp(18px,2vw,24px)]";

/** A numbered section header: the step, its title, and what it is for. */
export function StepHead({
  step,
  icon,
  title,
  hint,
  action,
}: {
  step: number;
  icon: ReactNode;
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="relative flex h-10 w-10 flex-none items-center justify-center bg-brand/12 text-brand">
        {icon}
        <span className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-display text-[10.5px] font-bold text-white">
          {step}
        </span>
      </span>
      <span className="flex min-w-0 flex-auto flex-col gap-0.5">
        <span className="text-[16px] font-bold tracking-[-0.015em] text-heading">{title}</span>
        <span className="text-[13px] leading-normal font-normal text-muted">{hint}</span>
      </span>
      {action}
    </div>
  );
}

/**
 * Step 2 of a delivery or a pickup: `/{kind}/checkout?identifier=DO…|PO…`.
 * One page for both - they differ in their lines (a delivery line is priced,
 * a pickup line weighed), their charge's name and a few words of copy, which
 * come from `checkout.kinds.<kind>`.
 *
 * Everything on it comes from one `GET /user/{kind}/preview` - the saved
 * items, the bookable dates and time slots, the customer's saved addresses,
 * the payment types and the gateways - and it ends in one
 * `POST /user/{kind}/checkout`.
 *
 *  1. **Schedule** - a date and a time slot, picked together in a dialog of
 *     chips rather than a dropdown of "16-Oct-2026" strings.
 *  2. **My address** - one of the saved addresses, or a new one added right
 *     here; a newly saved address is selected for you.
 *  3. **Delivery address** - the address, full address and phone typed in.
 *  4. **Order summary** - the items, subtotal, delivery charge and total, and
 *     the payment: cash, or online through the wallet or a gateway currency.
 *
 * The identifier rides in the query: a static export has no `[id]` routes.
 */
export function OrderCheckout({ kind }: { kind: OrderKind }) {
  const { t } = useLang();
  const identifier = useSearchParams().get("identifier") ?? "";
  const { data: preview, isLoading, isError } = useOrderPreview(kind, identifier);
  const k = (key: string) => t(`checkout.kinds.${kind}.${key}`);
  const HeadIcon = kind === "pickup" ? PackageCheck : ShoppingBag;

  return (
    <>
      <section className="bg-page border-b border-border px-[clamp(18px,3vw,44px)] pt-[clamp(28px,3.6vw,52px)] pb-[clamp(24px,3vw,40px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="enter-group flex min-w-0 max-w-[620px] flex-col gap-3">
            <Eyebrow icon={<HeadIcon size={16} strokeWidth={2.2} aria-hidden />}>{k("eyebrow")}</Eyebrow>
            {/* `enter-rise` — transform only: the LCP element must not fade. */}
            <h1 className="enter-rise text-balance [--enter-delay:0.08s]">{k("title")}</h1>
            <p className="max-w-[54ch]">{k("lead")}</p>
          </div>
          <Link
            href={ORDER_ROUTES[kind].form}
            className="enter-fade inline-flex items-center gap-2 font-display text-[13px] font-bold tracking-[0.12em] text-brand uppercase [--enter-delay:0.2s]"
          >
            <ArrowLeft size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            {t("checkout.editItems")}
          </Link>
        </div>
      </section>

      <section className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(30px,4vw,60px)]">
        <div className="mx-auto max-w-[1240px]">
          {!identifier || isError ? (
            <div className="mx-auto flex max-w-[460px] flex-col items-center gap-3 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center bg-brand/12 text-brand">
                <PackageSearch size={24} strokeWidth={1.6} aria-hidden />
              </span>
              <h2 className="text-[clamp(20px,2.2vw,26px)] leading-tight">{t("checkout.notFound")}</h2>
              <p className="text-[14px] text-muted">{t("checkout.notFoundHint")}</p>
              <Link
                href={ORDER_ROUTES[kind].form}
                className="mt-2 flex h-12 items-center gap-2.5 bg-primary px-6 font-display text-[14px] font-bold tracking-[0.13em] text-white uppercase transition-colors hover:bg-primary-dark"
              >
                {t("checkout.startOver")}
              </Link>
            </div>
          ) : isLoading || !preview ? (
            <CheckoutSkeleton />
          ) : (
            <CheckoutForm kind={kind} identifier={identifier} preview={preview} />
          )}
        </div>
      </section>
    </>
  );
}

function CheckoutSkeleton() {
  return (
    <div aria-busy className="grid grid-cols-1 items-start gap-[clamp(20px,2.4vw,32px)] wide:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex flex-col gap-5">
        {[120, 150, 170].map((h, i) => (
          <div key={i} className={CARD} style={{ minHeight: h }}>
            <span className="flex items-center gap-3.5">
              <span className="h-10 w-10 animate-pulse bg-border" />
              <span className="flex flex-col gap-2">
                <span className="h-4 w-32 animate-pulse bg-border" />
                <span className="h-3 w-52 animate-pulse bg-border" />
              </span>
            </span>
            <span className="h-11 w-full animate-pulse bg-border" />
          </div>
        ))}
      </div>
      <div className={cn(CARD, "min-h-[460px]")}>
        <span className="h-5 w-40 animate-pulse bg-border" />
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="h-3.5 animate-pulse bg-border" style={{ width: `${90 - i * 8}%` }} />
        ))}
        <span className="mt-auto h-12 w-full animate-pulse bg-border" />
      </div>
    </div>
  );
}

function CheckoutForm({ kind, identifier, preview }: { kind: OrderKind; identifier: string; preview: OrderPreview }) {
  const { t, lang } = useLang();
  const k = (key: string) => t(`checkout.kinds.${kind}.${key}`);
  const checkout = useOrderCheckout(kind);
  const saveAddress = useSaveOrderAddress(kind, identifier);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const currencyCode = t("checkout.currency");
  const cash = (v: number) => money(v, currencyCode);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<OrderCheckoutRequest>({
    resolver: zodResolver(orderCheckoutSchema),
    defaultValues: {
      schedule_date: "",
      schedule_time: "",
      address: preview.addresses[0] ? String(preview.addresses[0].id) : "",
      shortaddress: "",
      fulladdress: "",
      phone: "",
      payment_type: "",
      currency: "",
    },
  });

  const [date, time, paymentType, currency] = useWatch({
    control,
    name: ["schedule_date", "schedule_time", "payment_type", "currency"],
  });

  /* A newly added address is selected for the customer: the ids before the
     save are remembered, and the first one that appears after it wins. */
  const idsBeforeSave = useRef<Set<number> | null>(null);
  useEffect(() => {
    const before = idsBeforeSave.current;
    if (!before) return;
    const added = preview.addresses.filter((a) => !before.has(a.id)).sort((a, b) => b.id - a.id)[0];
    if (added) {
      setValue("address", String(added.id), { shouldValidate: true });
      idsBeforeSave.current = null;
    }
  }, [preview.addresses, setValue]);

  const addressOptions: SelectOption[] = preview.addresses.map((a) => ({
    value: String(a.id),
    label: `${a.address_type ? `${a.address_type.charAt(0).toUpperCase()}${a.address_type.slice(1)} · ` : ""}${a.address}`,
    sub: [a.landmark, a.mobile].filter(Boolean).join(" · "),
    keywords: `${a.address} ${a.landmark ?? ""} ${a.mobile}`,
  }));

  const gatewayOptions: SelectOption[] = [
    {
      value: WALLET,
      label: t("checkout.payment.wallet"),
      sub: t("checkout.payment.walletSub"),
      icon: <Wallet size={16} strokeWidth={2} aria-hidden className="text-brand" />,
    },
    ...preview.gateways.map((g) => ({
      value: g.value,
      label: g.label,
      badge: g.code,
      sub:
        g.code !== currencyCode
          ? `1 ${currencyCode} = ${g.rate} ${g.code}`
          : g.percentCharge || g.fixedCharge
            ? `${t("checkout.payment.charge")} ${g.percentCharge}% + ${g.fixedCharge} ${g.code}`
            : undefined,
      icon: <CreditCard size={16} strokeWidth={2} aria-hidden className="text-muted" />,
    })),
  ];
  const gateway = preview.gateways.find((g) => g.value === currency);

  const day = parseDay(date);
  const slot = preview.slots.find((s) => s.value === time);
  const scheduleLabel =
    day && slot
      ? `${day.toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${formatTime12(slot.start)} – ${formatTime12(slot.end)}`
      : "";

  const submit = (v: OrderCheckoutRequest) => {
    /* The page may have sat open: a slot that was fine when it was chosen can
       have started since. Checked again here, against the clock right now. */
    const chosen = preview.slots.find((s) => s.value === v.schedule_time);
    if (chosen && slotHasPassed(v.schedule_date, chosen.start, new Date())) {
      setError("schedule_time", { message: t("checkout.schedule.slotPassed") });
      setScheduleOpen(true);
      return;
    }
    checkout.mutate({
      identifier,
      payment_type: v.payment_type,
      schedule_date: v.schedule_date,
      schedule_time: v.schedule_time,
      address: v.address,
      shortaddress: v.shortaddress.trim(),
      fulladdress: v.fulladdress?.trim() ?? "",
      phone: v.phone.trim(),
      /* The backend requires `currency` on EVERY checkout, cash included ("The
         currency field is required."). A cash order sends a real gateway
         alias, as the collection's own cash example does; the wallet is only
         the fallback when the admin has no gateway set up at all. (The cash
         `payment_type` itself is normalised in `orderCheckout.service`.) */
      currency:
        v.payment_type === "online_payment"
          ? (v.currency ?? "")
          : (preview.gateways[0]?.value ?? WALLET),
    });
  };

  /* The dialogs sit OUTSIDE the form. They portal to <body> in the DOM, but
     React events travel the component tree - the address dialog's own form
     submitting inside this one would also submit the checkout. */
  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        className="grid grid-cols-1 items-start gap-[clamp(20px,2.4vw,32px)] wide:grid-cols-[minmax(0,1fr)_420px]"
      >
        <div className="flex min-w-0 flex-col gap-5">
          {/* ── 1 · Schedule ── */}
          <div className={cn(CARD, (errors.schedule_date || errors.schedule_time) && "border-danger")}>
            <StepHead
              step={1}
              icon={<CalendarClock size={18} strokeWidth={2} aria-hidden />}
              title={t("checkout.schedule.title")}
              hint={k("scheduleHint")}
            />
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className={cn(
                "group flex min-h-12 w-full cursor-pointer items-center gap-3 border bg-surface px-3.5 py-2.5 text-start transition-colors hover:border-primary/50",
                scheduleLabel ? "border-primary/40" : "border-dashed border-border",
              )}
            >
              <CalendarClock size={16} strokeWidth={2} aria-hidden className={scheduleLabel ? "text-brand" : "text-muted"} />
              <span className={cn("min-w-0 flex-1 truncate text-[14.5px]", scheduleLabel ? "font-semibold text-heading" : "font-medium text-muted")}>
                {scheduleLabel || t("checkout.schedule.none")}
              </span>
              <span className="flex flex-none items-center gap-1.5 text-[12.5px] font-bold tracking-[0.08em] text-brand uppercase">
                <Pencil size={13} strokeWidth={2.4} aria-hidden />
                {t(scheduleLabel ? "checkout.schedule.change" : "checkout.schedule.choose")}
              </span>
            </button>
            {(errors.schedule_date || errors.schedule_time) && (
              <span className={ERROR_TEXT}>{(errors.schedule_date ?? errors.schedule_time)?.message}</span>
            )}
          </div>

          {/* ── 2 · My address ── */}
          <div className={CARD}>
            <StepHead
              step={2}
              icon={<MapPin size={18} strokeWidth={2} aria-hidden />}
              title={t("checkout.myAddress.title")}
              hint={k("myAddressHint")}
            />
            <div className="flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-start">
              <div className="min-w-0 flex-1">
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={addressOptions}
                      placeholder={t(
                        addressOptions.length ? "checkout.myAddress.placeholder" : "checkout.myAddress.none",
                      )}
                      disabled={addressOptions.length === 0}
                      searchable={addressOptions.length > 4}
                      leftIcon={<MapPin size={15} strokeWidth={2} aria-hidden className="text-brand" />}
                      aria-label={t("checkout.myAddress.title")}
                      className={errors.address ? "border-danger!" : ""}
                    />
                  )}
                />
                {errors.address && <span className={ERROR_TEXT}>{errors.address.message}</span>}
              </div>
              <button
                type="button"
                onClick={() => setAddressOpen(true)}
                className="flex h-11 flex-none cursor-pointer items-center justify-center gap-2 border border-primary px-4 text-[13.5px] font-semibold text-brand transition-colors hover:bg-primary hover:text-white"
              >
                <Plus size={15} strokeWidth={2.4} aria-hidden />
                {t("checkout.myAddress.add")}
              </button>
            </div>
          </div>

          {/* ── 3 · Delivery address ── */}
          <div className={CARD}>
            <StepHead
              step={3}
              icon={<MapPinned size={18} strokeWidth={2} aria-hidden />}
              title={k("contactTitle")}
              hint={k("contactHint")}
            />
            <div className="grid grid-cols-1 gap-4 mid:grid-cols-2">
              <TextField
                name="shortaddress"
                control={control}
                id="checkout-shortaddress"
                label={t("checkout.deliveryAddress.address")}
                placeholder={t("checkout.deliveryAddress.addressPlaceholder")}
                required
                error={errors.shortaddress?.message}
              />
              <TextField
                name="phone"
                control={control}
                id="checkout-phone"
                label={t("checkout.deliveryAddress.phone")}
                placeholder={t("checkout.deliveryAddress.phonePlaceholder")}
                required
                error={errors.phone?.message}
              />
              <div className="mid:col-span-2">
                <TextField
                  name="fulladdress"
                  control={control}
                  id="checkout-fulladdress"
                  label={t("checkout.deliveryAddress.fullAddress")}
                  placeholder={t("checkout.deliveryAddress.fullAddressPlaceholder")}
                  error={errors.fulladdress?.message}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 · Summary + payment ── */}
        <aside className={cn(CARD, "gap-5 wide:sticky wide:top-[calc(var(--header-offset)+16px)] wide:transition-[top] wide:duration-500")}>
          <span className="flex items-center gap-2.5">
            <ShoppingBag size={18} strokeWidth={2} aria-hidden className="text-brand" />
            <h2 className="text-[clamp(17px,1.6vw,19px)] leading-tight font-bold tracking-[-0.015em]">
              {t("checkout.summary.title")}
            </h2>
            <span className="ms-auto bg-brand/10 px-2.25 py-0.75 text-[12px] font-medium text-brand tabular-nums">
              {preview.lines.length}
            </span>
          </span>

          <ol className="scrollbar-thin -me-2 flex max-h-[320px] flex-col gap-3 overflow-y-auto pe-2">
            {preview.lines.map((line, i) => (
              <li key={i} className="flex flex-col gap-2 border border-border bg-surface p-3.5">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[14.5px] font-bold text-heading">
                    <span className="inline text-muted">{String(i + 1).padStart(2, "0")} · </span>
                    {line.name}
                  </span>
                  <span className="flex-none text-[14.5px] font-bold text-heading tabular-nums">
                    {kind === "pickup"
                      ? `${+(line.kg * line.quantity).toFixed(2)} ${t("checkout.summary.kg")}`
                      : cash(line.price)}
                  </span>
                </span>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12.5px]">
                  {(kind === "pickup"
                    ? [
                        [t("checkout.summary.quantity"), String(line.quantity)],
                        [t("checkout.summary.weightEach"), line.kg ? `${line.kg} ${t("checkout.summary.kg")}` : ""],
                      ]
                    : [
                        [t("checkout.summary.quantity"), String(line.quantity)],
                        [t("checkout.summary.brand"), line.brand],
                        [t("checkout.summary.size"), line.size],
                        [t("checkout.summary.shop"), line.shop],
                        [t("checkout.summary.shopAddress"), line.shopAddress],
                      ]
                  )
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="flex min-w-0 gap-1.5">
                        <dt className="flex-none text-muted">{k}:</dt>
                        <dd className="min-w-0 truncate font-semibold text-heading">{v}</dd>
                      </div>
                    ))}
                </dl>
              </li>
            ))}
          </ol>

          <dl className="flex flex-col gap-2.5 border-y border-border py-4">
            {kind === "delivery" && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[14px] font-medium text-body">{t("checkout.summary.subtotal")}</dt>
                <dd className="text-[15px] font-bold text-heading tabular-nums">{cash(preview.subtotal)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[14px] font-medium text-body">{k("charge")}</dt>
              <dd className="text-[15px] font-bold text-heading tabular-nums">{cash(preview.charge)}</dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <dt className="text-[14.5px] font-bold text-heading">{t("checkout.summary.total")}</dt>
              <dd className="text-[clamp(20px,2vw,24px)] leading-none font-black tracking-[-0.02em] text-brand tabular-nums">
                {cash(preview.total)}
              </dd>
            </div>
          </dl>

          {/* ── Payment ── */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">
              {t("checkout.payment.title")}
            </span>
            <Controller
              name="payment_type"
              control={control}
              render={({ field }) => (
                <div role="radiogroup" aria-label={t("checkout.payment.title")} className="grid grid-cols-2 gap-2.5">
                  {preview.paymentTypes.map((p) => {
                    const on = field.value === p.value;
                    const online = p.value === "online_payment";
                    return (
                      <button
                        key={p.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          field.onChange(p.value);
                          if (!online) setValue("currency", "");
                        }}
                        className={cn(
                          "relative flex h-11 min-w-0 cursor-pointer items-center gap-2 border px-2.5 text-start text-[13px] font-semibold whitespace-nowrap transition-colors",
                          on
                            ? "border-primary bg-primary/8 text-brand"
                            : errors.payment_type
                              ? "border-danger text-heading"
                              : "border-border text-heading hover:border-primary/50",
                        )}
                      >
                        {online ? (
                          <CreditCard size={15} strokeWidth={2} aria-hidden className="flex-none" />
                        ) : (
                          <Banknote size={15} strokeWidth={2} aria-hidden className="flex-none" />
                        )}
                        {/* Its own size: the base layer gives every bare <span> 16px on
                            wide screens, which is what broke the label onto two lines. */}
                        <span title={p.label} className="min-w-0 flex-1 truncate text-[13px] leading-tight font-semibold">
                          {p.label}
                        </span>
                        {on && (
                          <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-primary text-white">
                            <Check size={10} strokeWidth={3} aria-hidden />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.payment_type && <span className={ERROR_TEXT}>{errors.payment_type.message}</span>}

            {paymentType === "online_payment" && (
              <div className="flex flex-col gap-2">
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={gatewayOptions}
                      placeholder={t("checkout.payment.placeholder")}
                      searchable
                      aria-label={t("checkout.payment.placeholder")}
                      className={errors.currency ? "border-danger!" : ""}
                    />
                  )}
                />
                {errors.currency && <span className={ERROR_TEXT}>{errors.currency.message}</span>}
                {gateway && (gateway.percentCharge > 0 || gateway.fixedCharge > 0) && (
                  <p className="flex items-start gap-2 text-[12.5px] leading-normal text-muted">
                    <CircleAlert size={13} strokeWidth={2.2} aria-hidden className="mt-0.5 flex-none" />
                    {t("checkout.payment.chargeNote")} {gateway.percentCharge}% + {gateway.fixedCharge} {gateway.code}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={checkout.isPending}
            aria-busy={checkout.isPending}
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 bg-primary font-display text-[14.5px] font-bold tracking-[0.13em] text-white uppercase transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
          >
            {t("checkout.confirm")}
            {checkout.isPending ? (
              <Loader2 size={15} strokeWidth={2.6} aria-hidden className="animate-spin" />
            ) : (
              <ArrowRight size={15} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            )}
          </button>
        </aside>
      </form>

      <ScheduleDialog
        key={scheduleOpen ? "open" : "closed"}
        open={scheduleOpen}
        preview={preview}
        initialDate={getValues("schedule_date")}
        initialTime={getValues("schedule_time")}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(d, tm) => {
          setValue("schedule_date", d, { shouldValidate: true });
          setValue("schedule_time", tm, { shouldValidate: true });
          setScheduleOpen(false);
        }}
      />

      <AddressDialog
        open={addressOpen}
        editing={null}
        busy={saveAddress.isPending}
        onClose={() => setAddressOpen(false)}
        onSubmit={(values) => {
          idsBeforeSave.current = new Set(preview.addresses.map((a) => a.id));
          saveAddress.mutate(values, {
            onSuccess: () => setAddressOpen(false),
            onError: () => {
              idsBeforeSave.current = null;
            },
          });
        }}
      />
    </>
  );
}

/** Date and time together - one decision, one dialog. Shared by every checkout. */
export function ScheduleDialog({
  open,
  preview,
  initialDate,
  initialTime,
  onClose,
  onConfirm,
}: {
  open: boolean;
  /** The bookable days and the slots - all a schedule needs of a preview. */
  preview: Pick<OrderPreview, "dates" | "slots">;
  initialDate: string;
  initialTime: string;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}) {
  const { t, lang } = useLang();
  /* "Now" is taken once, when the dialog opens (it remounts per open), so the
     slots do not flicker shut while someone is choosing between them. */
  const [now] = useState(() => new Date());
  const passed = (dateValue: string, start: string) => slotHasPassed(dateValue, start, now);
  const openSlotsOn = (dateValue: string) => preview.slots.filter((s) => !passed(dateValue, s.start));

  /* A date with nothing left to book (today, late in the evening) is not
     offered; a previous choice that has since gone by is dropped. */
  const startDate = initialDate && openSlotsOn(initialDate).length > 0 ? initialDate : "";
  const startTime =
    startDate && preview.slots.some((s) => s.value === initialTime && !passed(startDate, s.start)) ? initialTime : "";
  const [date, setDate] = useState(startDate);
  const [time, setTime] = useState(startTime);

  const pickDate = (value: string) => {
    setDate(value);
    const chosen = preview.slots.find((s) => s.value === time);
    if (chosen && passed(value, chosen.start)) setTime("");
  };

  const ready = Boolean(date && time);
  const nothingLeft = Boolean(date) && openSlotsOn(date).length === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      labelledBy="schedule-dialog-title"
      icon={<CalendarClock size={17} strokeWidth={2.2} aria-hidden />}
      title={t("checkout.schedule.dialogTitle")}
    >
      <div className="flex flex-col gap-5 p-[clamp(16px,1.8vw,24px)]">
        <div className="flex flex-col gap-2.5">
          <span className="font-display text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">
            {t("checkout.schedule.date")}
          </span>
          {preview.dates.length === 0 ? (
            <span className="text-[13.5px] text-muted">{t("checkout.schedule.noDates")}</span>
          ) : (
            <div role="radiogroup" aria-label={t("checkout.schedule.date")} className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5">
              {preview.dates.map((value) => {
                const d = parseDay(value);
                const on = value === date;
                const closed = openSlotsOn(value).length === 0;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={closed}
                    title={closed ? t("checkout.schedule.dayFull") : undefined}
                    onClick={() => pickDate(value)}
                    className={cn(
                      "flex w-17 flex-none cursor-pointer flex-col items-center gap-0.5 border py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      on ? "border-primary bg-primary text-white" : "border-border bg-surface text-heading enabled:hover:border-primary/50",
                    )}
                  >
                    <span className={cn("text-[11px] font-semibold uppercase", on ? "text-white/80" : "text-muted")}>
                      {d ? d.toLocaleDateString(lang, { weekday: "short" }) : ""}
                    </span>
                    <span className="text-[20px] leading-none font-bold tabular-nums">{d ? d.getDate() : value}</span>
                    <span className={cn("text-[11px] font-medium", on ? "text-white/80" : "text-muted")}>
                      {d ? d.toLocaleDateString(lang, { month: "short" }) : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="font-display text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase">
            {t("checkout.schedule.time")}
          </span>
          {preview.slots.length === 0 ? (
            <span className="text-[13.5px] text-muted">{t("checkout.schedule.noSlots")}</span>
          ) : (
            <div role="radiogroup" aria-label={t("checkout.schedule.time")} className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">
              {preview.slots.map((s) => {
                const on = s.value === time;
                /* With no date picked yet nothing is shut - the slots open or
                   close once a day says which. */
                const gone = Boolean(date) && passed(date, s.start);
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={gone}
                    title={gone ? t("checkout.schedule.slotPassed") : undefined}
                    onClick={() => setTime(s.value)}
                    className={cn(
                      "h-11 cursor-pointer border px-2 text-[13px] font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted disabled:line-through disabled:opacity-50",
                      on ? "border-primary bg-primary/10 text-brand" : "border-border bg-surface text-heading enabled:hover:border-primary/50",
                    )}
                  >
                    {formatTime12(s.start)} – {formatTime12(s.end)}
                  </button>
                );
              })}
            </div>
          )}
          {nothingLeft && (
            <span className="text-[13px] text-muted">{t("checkout.schedule.dayFull")}</span>
          )}
        </div>

        <div className="flex gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 cursor-pointer border border-border bg-card text-[14px] font-semibold text-heading transition-colors hover:border-primary/50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => onConfirm(date, time)}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 bg-primary text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={15} strokeWidth={2.6} aria-hidden />
            {t("common.confirm")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
