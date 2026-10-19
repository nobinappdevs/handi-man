"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  ImageOff,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell } from "@/components/context/ShellContext";
import { useCatalogue } from "@/hooks/useCatalogue";
import {
  useApplyCoupon,
  useSaveServiceAddress,
  useServiceAddresses,
  useServiceCheckout,
  useServiceSchedule,
} from "@/hooks/useServiceOrder";
import { WALLET } from "@/hooks/useOrderCheckout";
import { serviceCheckoutSchema, type ServiceCheckoutRequest } from "@/schemas/checkout.schema";
import type { CardInfoLine } from "@/services/serviceOrder.service";
import { Eyebrow } from "@/components/share/Eyebrow";
import { AddressDialog } from "@/components/dashboard/page/address/AddressDialog";
import { CARD, ScheduleDialog, StepHead, slotHasPassed } from "@/components/checkout/OrderCheckout";
import { Select, type SelectOption } from "@/components/ui/Select";
import { formatTime12 } from "@/components/ui/TimePicker";
import { ERROR_TEXT, FIELD } from "@/components/forms/itemListForm";
import { cn } from "@/components/ui/cn";
import { money } from "@/lib/money";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/** "16-Oct-2026" → a Date for display. */
function parseDay(value: string) {
  const m = /^(\d{1,2})-([a-z]{3})-(\d{4})$/i.exec(value);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2].toLowerCase());
  return month < 0 ? null : new Date(Number(m[3]), month, Number(m[1]));
}

function Thumb({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <span className="flex h-14 w-14 flex-none items-center justify-center bg-brand/12 text-brand">
        <ImageOff size={16} strokeWidth={1.6} aria-hidden />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
    <img src={src} alt="" onError={() => setBroken(true)} className="h-14 w-14 flex-none object-cover" />
  );
}

/**
 * `/services/checkout` - the cart, booked.
 *
 * The cart is the client's (`ShellContext`), and the checkout sends it whole
 * as `card_info`. Around it: the slot and the booking window and the gateways
 * (`/user/service/date-time`), the saved addresses (`/user/service/address`),
 * an optional coupon, and the payment. The fees are the category's customer
 * charge from the catalogue - a fixed amount plus a percentage per line, as
 * the old web checkout showed them; the backend computes the charge it
 * actually bills.
 */
export function ServiceCheckout() {
  const { t } = useLang();
  const { lines } = useShell();
  const schedule = useServiceSchedule();
  const addresses = useServiceAddresses();
  const catalogue = useCatalogue();

  const loading = schedule.isLoading || addresses.isLoading || catalogue.isLoading;

  return (
    <>
      <section className="bg-page border-b border-border px-[clamp(18px,3vw,44px)] pt-[clamp(28px,3.6vw,52px)] pb-[clamp(24px,3vw,40px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="enter-group flex min-w-0 max-w-[620px] flex-col gap-3">
            <Eyebrow icon={<ShoppingCart size={16} strokeWidth={2.2} aria-hidden />}>
              {t("serviceCheckout.eyebrow")}
            </Eyebrow>
            {/* `enter-rise` — transform only: the LCP element must not fade. */}
            <h1 className="enter-rise text-balance [--enter-delay:0.08s]">{t("serviceCheckout.title")}</h1>
            <p className="max-w-[54ch]">{t("serviceCheckout.lead")}</p>
          </div>
          <Link
            href="/services"
            className="enter-fade inline-flex items-center gap-2 font-display text-[13px] font-bold tracking-[0.12em] text-brand uppercase [--enter-delay:0.2s]"
          >
            <ArrowLeft size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            {t("serviceCheckout.keepBrowsing")}
          </Link>
        </div>
      </section>

      <section className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(30px,4vw,60px)]">
        <div className="mx-auto max-w-[1240px]">
          {lines.length === 0 ? (
            <div className="mx-auto flex max-w-[440px] flex-col items-center gap-3 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center bg-brand/12 text-brand">
                <ShoppingCart size={24} strokeWidth={1.6} aria-hidden />
              </span>
              <h2 className="text-[clamp(20px,2.2vw,26px)] leading-tight">{t("serviceCheckout.empty")}</h2>
              <p className="text-[14px] text-muted">{t("serviceCheckout.emptyHint")}</p>
              <Link
                href="/services"
                className="mt-2 flex h-12 items-center gap-2.5 bg-primary px-6 font-display text-[14px] font-bold tracking-[0.13em] text-white uppercase transition-colors hover:bg-primary-dark"
              >
                {t("serviceCheckout.browse")}
              </Link>
            </div>
          ) : loading || !schedule.data ? (
            <div aria-busy className="grid grid-cols-1 items-start gap-[clamp(20px,2.4vw,32px)] wide:grid-cols-[minmax(0,1fr)_420px]">
              <div className="flex flex-col gap-5">
                {[130, 160].map((h, i) => (
                  <div key={i} className={cn(CARD, "animate-pulse")} style={{ minHeight: h }} />
                ))}
              </div>
              <div className={cn(CARD, "min-h-[480px] animate-pulse")} />
            </div>
          ) : (
            <CheckoutForm
              schedule={schedule.data}
              addresses={addresses.data ?? []}
              feesFor={(serviceId) => {
                const cat = catalogue.data?.categories.find((c) => c.services.some((s) => s.id === serviceId));
                return cat ? { categoryId: cat.id, ...cat.fees } : { categoryId: 0, fixed: 0, percent: 0 };
              }}
              currency={catalogue.data?.currency || t("checkout.currency")}
            />
          )}
        </div>
      </section>
    </>
  );
}

type Schedule = NonNullable<ReturnType<typeof useServiceSchedule>["data"]>;
type Addresses = NonNullable<ReturnType<typeof useServiceAddresses>["data"]>;

function CheckoutForm({
  schedule,
  addresses,
  feesFor,
  currency,
}: {
  schedule: Schedule;
  addresses: Addresses;
  feesFor: (serviceId: number) => { categoryId: number; fixed: number; percent: number };
  currency: string;
}) {
  const { t, lang } = useLang();
  const { lines, clearCart } = useShell();
  const checkout = useServiceCheckout(clearCart);
  const saveAddress = useSaveServiceAddress();
  const coupon = useApplyCoupon();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; amount: number } | null>(null);
  const cash = (v: number) => money(v, currency);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<ServiceCheckoutRequest>({
    resolver: zodResolver(serviceCheckoutSchema),
    defaultValues: {
      schedule_date: "",
      schedule_time: "",
      address: addresses[0] ? String(addresses[0].id) : "",
      payment_type: "",
      currency: "",
    },
  });
  const [date, time, paymentType, currencyValue] = useWatch({
    control,
    name: ["schedule_date", "schedule_time", "payment_type", "currency"],
  });

  /* A newly added address is selected for the customer. */
  const idsBeforeSave = useRef<Set<number> | null>(null);
  useEffect(() => {
    const before = idsBeforeSave.current;
    if (!before) return;
    const added = addresses.filter((a) => !before.has(a.id)).sort((a, b) => b.id - a.id)[0];
    if (added) {
      setValue("address", String(added.id), { shouldValidate: true });
      idsBeforeSave.current = null;
    }
  }, [addresses, setValue]);

  /* ── Money ── */
  const priced = lines.map((l) => {
    const fees = feesFor(l.id);
    const subtotal = l.price * l.qty;
    return { line: l, fees, subtotal, charge: fees.fixed + (subtotal * fees.percent) / 100 };
  });
  const subtotal = priced.reduce((n, p) => n + p.subtotal, 0);
  const charge = priced.reduce((n, p) => n + p.charge, 0);
  const discount = applied ? Math.min(applied.amount, subtotal + charge) : 0;
  const total = subtotal + charge - discount;

  /* ── Options ── */
  const addressOptions: SelectOption[] = addresses.map((a) => ({
    value: String(a.id),
    label: `${a.address_type ? `${a.address_type.charAt(0).toUpperCase()}${a.address_type.slice(1)} · ` : ""}${a.address}`,
    sub: [a.landmark, a.mobile].filter(Boolean).join(" · "),
    keywords: `${a.address} ${a.landmark ?? ""} ${a.mobile}`,
  }));
  const paymentTypes = schedule.paymentTypes.length
    ? schedule.paymentTypes
    : [
        { value: "cash_on_delivery", label: t("serviceCheckout.cash") },
        { value: "online_payment", label: t("serviceCheckout.online") },
      ];
  const gatewayOptions: SelectOption[] = [
    {
      value: WALLET,
      label: t("checkout.payment.wallet"),
      sub: t("checkout.payment.walletSub"),
      icon: <Wallet size={16} strokeWidth={2} aria-hidden className="text-brand" />,
    },
    ...schedule.gateways.map((g) => ({
      value: g.value,
      label: g.label,
      badge: g.code,
      sub: g.code !== currency ? `1 ${currency} = ${g.rate} ${g.code}` : undefined,
      icon: <CreditCard size={16} strokeWidth={2} aria-hidden className="text-muted" />,
    })),
  ];
  const gateway = schedule.gateways.find((g) => g.value === currencyValue);

  const day = parseDay(date);
  const slot = schedule.slots.find((s) => s.value === time);
  const scheduleLabel =
    day && slot
      ? `${day.toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${formatTime12(slot.start)} – ${formatTime12(slot.end)}`
      : "";

  const submit = (v: ServiceCheckoutRequest) => {
    const chosen = schedule.slots.find((s) => s.value === v.schedule_time);
    if (chosen && slotHasPassed(v.schedule_date, chosen.start, new Date())) {
      setError("schedule_time", { message: t("checkout.schedule.slotPassed") });
      setScheduleOpen(true);
      return;
    }
    const cardInfo: CardInfoLine[] = priced.map(({ line, fees, subtotal: lineTotal }) => ({
      rowId: String(line.id),
      id: line.id,
      name: line.name,
      qty: String(line.qty),
      price: line.price,
      options: {
        thumbnail: line.thumbnail,
        item: line.item,
        cat_id: fees.categoryId,
        vendor_id: line.vendorId,
        main_amount: line.price,
      },
      tax: "0.00",
      subtotal: lineTotal.toFixed(2),
    }));
    checkout.mutate({
      payment_type: v.payment_type,
      schedule_date: v.schedule_date,
      schedule_time: v.schedule_time,
      address: v.address,
      /* Required on every checkout. A cash order sends a real gateway alias,
         as the collection's own cash example does; the wallet is only the
         fallback when the admin has no gateway set up at all. */
      currency:
        v.payment_type === "online_payment"
          ? (v.currency ?? "")
          : (schedule.gateways[0]?.value ?? WALLET),
      card_info: cardInfo,
      coupon_amount: discount,
    });
  };

  const applyCoupon = () => {
    if (!code.trim()) return;
    coupon.mutate(code, { onSuccess: ({ code: c, amount }) => setApplied({ code: c, amount }) });
  };

  /* The dialogs sit OUTSIDE the form - React events travel the component
     tree, and the address dialog's own form would submit this one too. */
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
              hint={t("serviceCheckout.scheduleHint")}
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

          {/* ── 2 · Address ── */}
          <div className={CARD}>
            <StepHead
              step={2}
              icon={<MapPin size={18} strokeWidth={2} aria-hidden />}
              title={t("serviceCheckout.addressTitle")}
              hint={t("serviceCheckout.addressHint")}
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
                      placeholder={t(addressOptions.length ? "checkout.myAddress.placeholder" : "checkout.myAddress.none")}
                      disabled={addressOptions.length === 0}
                      searchable={addressOptions.length > 4}
                      leftIcon={<MapPin size={15} strokeWidth={2} aria-hidden className="text-brand" />}
                      aria-label={t("serviceCheckout.addressTitle")}
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
        </div>

        {/* ── Summary, voucher, payment ── */}
        <aside className={cn(CARD, "gap-5 wide:sticky wide:top-[calc(var(--header-offset)+16px)]")}>
          <span className="flex items-center gap-2.5">
            <ShoppingBag size={18} strokeWidth={2} aria-hidden className="text-brand" />
            <h2 className="text-[clamp(17px,1.6vw,19px)] leading-tight font-bold tracking-[-0.015em]">
              {t("checkout.summary.title")}
            </h2>
            <span className="ms-auto bg-brand/10 px-2.25 py-0.75 text-[12px] font-medium text-brand tabular-nums">
              {lines.length}
            </span>
          </span>

          <ol className="scrollbar-thin -me-2 flex max-h-80 flex-col gap-2.5 overflow-y-auto pe-2">
            {priced.map(({ line, subtotal: lineTotal }) => (
              <li key={line.id} className="flex items-center gap-3 border border-border bg-surface p-2.5">
                <Thumb src={line.image} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="line-clamp-2 text-[13.5px] leading-tight font-bold text-heading">{line.name}</span>
                  <span className="text-[12.5px] text-muted tabular-nums">
                    {line.item && `${line.item} · `}× {line.qty}
                  </span>
                </span>
                <span className="flex-none text-[14px] font-bold text-heading tabular-nums">{cash(lineTotal)}</span>
              </li>
            ))}
          </ol>

          <dl className="flex flex-col gap-2.5 border-y border-border py-4">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[14px] font-medium text-body">{t("checkout.summary.subtotal")}</dt>
              <dd className="text-[15px] font-bold text-heading tabular-nums">{cash(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[14px] font-medium text-body">{t("serviceCheckout.fees")}</dt>
              <dd className="text-[15px] font-bold text-heading tabular-nums">{cash(charge)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[14px] font-medium text-body">{t("serviceCheckout.discount")}</dt>
              <dd className={cn("text-[15px] font-bold tabular-nums", discount ? "text-ok" : "text-heading")}>
                {discount ? `− ${cash(discount)}` : cash(0)}
              </dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <dt className="text-[14.5px] font-bold text-heading">{t("checkout.summary.total")}</dt>
              <dd className="text-[clamp(20px,2vw,24px)] leading-none font-black tracking-[-0.02em] text-brand tabular-nums">
                {cash(total)}
              </dd>
            </div>
          </dl>

          {/* ── Voucher ── */}
          <div className="flex flex-col gap-3">
            {applied ? (
              <div className="flex items-center gap-2.5 border border-ok/40 bg-ok/8 px-3 py-2.5">
                <Tag size={15} strokeWidth={2.2} aria-hidden className="flex-none text-ok" />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-heading">
                  {applied.code} · <span className="inline text-ok">− {cash(discount)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setApplied(null);
                    setCode("");
                  }}
                  aria-label={t("serviceCheckout.removeCoupon")}
                  title={t("serviceCheckout.removeCoupon")}
                  className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center text-muted transition-colors hover:text-danger"
                >
                  <X size={14} strokeWidth={2.4} aria-hidden />
                </button>
              </div>
            ) : (
              <>
                <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold text-heading">
                  <input
                    type="checkbox"
                    checked={voucherOpen}
                    onChange={(e) => setVoucherOpen(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-[rgb(var(--primary__color))]"
                  />
                  {t("serviceCheckout.haveVoucher")}
                </label>
                {voucherOpen && (
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyCoupon();
                        }
                      }}
                      placeholder={t("serviceCheckout.couponPlaceholder")}
                      aria-label={t("serviceCheckout.couponPlaceholder")}
                      className={cn(FIELD, "h-11 border-border uppercase placeholder:normal-case")}
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!code.trim() || coupon.isPending}
                      className="flex h-11 flex-none cursor-pointer items-center gap-2 bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {coupon.isPending && <Loader2 size={14} strokeWidth={2.4} aria-hidden className="animate-spin" />}
                      {t("serviceCheckout.apply")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

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
                  {paymentTypes.map((p) => {
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
                          "relative flex h-11 min-w-0 cursor-pointer items-center gap-2 border px-2.5 text-start whitespace-nowrap transition-colors",
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
        preview={{ dates: schedule.dates, slots: schedule.slots }}
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
          idsBeforeSave.current = new Set(addresses.map((a) => a.id));
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
