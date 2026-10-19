"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ImageOff,
  Loader2,
  MessageSquareText,
  Minus,
  Monitor,
  Plus,
  SearchX,
  Send,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserRound,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import { useAddReview, useServiceDetails, type ServiceDetails, type ServiceReview } from "@/hooks/useServiceOrder";
import { useShell, MAX_QTY } from "@/components/context/ShellContext";
import { readToken } from "@/lib/authState";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { formatDate, money } from "@/lib/money";
import { reviewSchema, type ReviewRequest } from "@/schemas/review.schema";
import { ERROR_TEXT, LABEL } from "@/components/forms/itemListForm";
import { cn } from "@/components/ui/cn";

const CARD = "border border-border bg-card";

function Cover({ src, className }: { src: string; className: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <span className={cn("flex items-center justify-center bg-brand/10 text-brand", className)}>
        <ImageOff size={34} strokeWidth={1.4} aria-hidden />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
    <img src={src} alt="" onError={() => setBroken(true)} className={cn("object-cover", className)} />
  );
}

/**
 * `/services/details?id=…` - one service: what it is (Overview), what people
 * said (Reviews), and the order card that puts it in the cart.
 *
 * The id rides in the query (no `[id]` routes in a static export). The
 * description is the vendor's rich text and goes through `sanitizeHtml`.
 */
export function ServiceDetail() {
  const { t } = useLang();
  const raw = useSearchParams().get("id");
  const id = raw && /^\d+$/.test(raw) ? Number(raw) : 0;
  const { data: service, isLoading, isError } = useServiceDetails(id);

  if (isLoading && id > 0) return <DetailSkeleton />;

  if (!service || isError) {
    return (
      <section className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(60px,8vw,120px)]">
        <div className="mx-auto flex max-w-[480px] flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center bg-brand/12 text-brand">
            <SearchX size={24} strokeWidth={1.6} aria-hidden />
          </span>
          <h1 className="text-[clamp(22px,2.4vw,30px)] leading-tight">{t("serviceDetail.notFound")}</h1>
          <p className="text-[14.5px] text-muted">{t("serviceDetail.notFoundHint")}</p>
          <Link
            href="/services"
            className="mt-2 inline-flex items-center gap-2 font-display text-[13px] font-bold tracking-[0.12em] text-brand uppercase"
          >
            <ArrowLeft size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            {t("serviceDetail.back")}
          </Link>
        </div>
      </section>
    );
  }

  return <DetailBody service={service} />;
}

function DetailSkeleton() {
  return (
    <section aria-busy className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(30px,4vw,56px)]">
      <div aria-hidden className="mx-auto grid max-w-[1240px] grid-cols-1 gap-[clamp(20px,2.4vw,32px)] wide:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-5">
          <span className="h-3 w-40 animate-pulse bg-border" />
          <span className="h-10 w-3/4 animate-pulse bg-border" />
          <span className="aspect-[16/9] w-full animate-pulse bg-border" />
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="h-3.5 animate-pulse bg-border" style={{ width: `${94 - i * 8}%` }} />
          ))}
        </div>
        <div className={cn(CARD, "h-[360px] animate-pulse")} />
      </div>
    </section>
  );
}

function DetailBody({ service }: { service: ServiceDetails }) {
  const { t } = useLang();
  const isClient = useIsClient();
  const [tab, setTab] = useState<"overview" | "reviews">("overview");
  const body = isClient ? sanitizeHtml(service.html) : "";

  return (
    <>
      {/* ── Head ── */}
      <section className="bg-page border-b border-border px-[clamp(18px,3vw,44px)] pt-[clamp(26px,3.4vw,48px)] pb-[clamp(22px,2.8vw,36px)]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3.5">
          <Link
            href="/services"
            className="enter-fade inline-flex w-fit items-center gap-2 font-display text-[12.5px] font-bold tracking-[0.12em] text-brand uppercase"
          >
            <ArrowLeft size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            {t("serviceDetail.back")}
          </Link>
          {/* `enter-rise` — transform only: the LCP element must not fade. */}
          <h1 className="enter-rise max-w-[24ch] text-[clamp(28px,3.6vw,48px)] leading-[1.06] tracking-[-0.03em] text-balance">
            {service.name}
          </h1>
          <div className="enter-fade flex flex-wrap items-center gap-2.5 [--enter-delay:0.15s]">
            {service.vendor && (
              <span className="flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5 text-[13px] font-semibold text-heading">
                <Store size={14} strokeWidth={2} aria-hidden className="text-brand" />
                {service.vendor}
              </span>
            )}
            {service.item && (
              <span className="flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5 text-[13px] font-semibold text-heading">
                <Clock size={14} strokeWidth={2} aria-hidden className="text-brand" />
                {service.item}
              </span>
            )}
            <span className="bg-primary px-3 py-1.5 text-[13px] font-bold text-white tabular-nums">
              {money(service.price, service.currency)}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(28px,3.6vw,56px)]">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-[clamp(20px,2.4vw,32px)] wide:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            {/* ── Tabs ── */}
            <div role="tablist" aria-label={service.name} className="flex w-fit border border-border bg-card p-1">
              {(
                [
                  ["overview", Monitor, t("serviceDetail.overview")],
                  ["reviews", MessageSquareText, `${t("serviceDetail.reviews")} (${service.reviews.length})`],
                ] as const
              ).map(([key, Icon, label]) => {
                const on = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setTab(key)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-4 py-2.25 text-[13.5px] font-semibold transition-colors",
                      on ? "bg-primary text-white" : "text-body hover:text-heading",
                    )}
                  >
                    <Icon size={15} strokeWidth={2} aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>

            {tab === "overview" ? (
              <div role="tabpanel" className="flex flex-col gap-5">
                <Cover src={service.image} className="aspect-[16/9] w-full" />
                {/* Sanitised above - see `sanitizeHtml`. */}
                <div className="rte-content rte-article" dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            ) : (
              <div role="tabpanel">
                <Reviews service={service} />
              </div>
            )}
          </div>

          <OrderCard service={service} />
        </div>
      </section>
    </>
  );
}

/** The sticky card that puts the service in the cart. */
function OrderCard({ service }: { service: ServiceDetails }) {
  const { t } = useLang();
  const { addToCart, openCart, lines } = useShell();
  const [qty, setQty] = useState(1);
  const inCart = lines.find((l) => l.id === service.id);
  const total = service.price * qty;

  return (
    <aside className={cn(CARD, "flex flex-col gap-5 p-[clamp(18px,2vw,24px)] wide:sticky wide:top-[calc(var(--header-offset)+16px)]")}>
      <span className="flex items-center gap-2.5">
        <ShoppingBag size={18} strokeWidth={2} aria-hidden className="text-brand" />
        <h2 className="text-[clamp(17px,1.6vw,19px)] leading-tight font-bold tracking-[-0.015em]">
          {t("serviceDetail.orderTitle")}
        </h2>
      </span>

      <div className="flex items-start justify-between gap-4">
        <span className="flex min-w-0 flex-col gap-1">
          <span className="line-clamp-2 text-[14.5px] font-semibold text-heading">{service.name}</span>
          <span className="text-[13px] text-muted">
            {service.item && `${service.item} · `}
            <span className="inline font-semibold text-brand tabular-nums">{money(service.price, service.currency)}</span>{" "}
            {t("serviceDetail.perUnit")}
          </span>
        </span>
        <div className="flex h-9 flex-none items-center border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label={t("cart.decrease")}
            className="flex h-full w-8 cursor-pointer items-center justify-center text-heading transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={14} strokeWidth={2.4} aria-hidden />
          </button>
          <span className="w-9 text-center text-[14px] font-bold text-heading tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
            disabled={qty >= MAX_QTY}
            aria-label={t("cart.increase")}
            className="flex h-full w-8 cursor-pointer items-center justify-center text-heading transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} strokeWidth={2.4} aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 border-y border-border py-4">
        <span className="text-[14.5px] font-bold text-heading">{t("serviceDetail.total")}</span>
        <span className="text-[clamp(22px,2.2vw,26px)] leading-none font-black tracking-[-0.02em] text-brand tabular-nums">
          {money(total, service.currency)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          addToCart(
            {
              id: service.id,
              name: service.name,
              item: service.item,
              price: service.price,
              image: service.image,
              thumbnail: service.thumbnail,
              vendorId: service.vendorId,
            },
            qty,
          );
          openCart();
        }}
        className="flex h-13 w-full cursor-pointer items-center justify-center gap-2.5 bg-primary font-display text-[14px] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-primary-dark"
      >
        <ShoppingCart size={16} strokeWidth={2.2} aria-hidden />
        {t("serviceDetail.addToCart")}
      </button>

      {inCart && (
        <p className="text-center text-[12.5px] text-muted">
          {t("serviceDetail.inCart")} <span className="inline font-bold text-heading tabular-nums">{inCart.qty}</span>
        </p>
      )}
    </aside>
  );
}

function Reviews({ service }: { service: ServiceDetails }) {
  const { t } = useLang();
  const isClient = useIsClient();
  const signedIn = isClient && Boolean(readToken("user"));
  const add = useAddReview(service.id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewRequest>({ resolver: zodResolver(reviewSchema), defaultValues: { review: "" } });

  return (
    <div className="flex flex-col gap-5">
      {service.reviews.length === 0 ? (
        <p className={cn(CARD, "px-5 py-6 text-[14px] text-muted")}>{t("serviceDetail.noReviews")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {service.reviews.map((r: ServiceReview) => (
            <li key={r.id} className={cn(CARD, "flex gap-3.5 p-[clamp(14px,1.6vw,20px)]")}>
              <span className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-full bg-brand/12 text-brand">
                {r.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
                  <img src={r.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound size={18} strokeWidth={1.8} aria-hidden />
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="text-[14.5px] font-bold text-heading">{r.author || t("serviceDetail.customer")}</span>
                  {r.createdAt && <span className="text-[12px] text-muted">{formatDate(r.createdAt)}</span>}
                </span>
                <span className="text-[14px] leading-[1.6] font-normal text-body whitespace-pre-line">{r.text}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {signedIn ? (
        <form
          noValidate
          onSubmit={handleSubmit((v) => add.mutate(v.review.trim(), { onSuccess: () => reset() }))}
          className={cn(CARD, "flex flex-col gap-3 p-[clamp(16px,1.8vw,22px)]")}
        >
          <label htmlFor="review-text" className={LABEL}>
            {t("serviceDetail.writeReview")}
          </label>
          <Controller
            name="review"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="review-text"
                rows={4}
                placeholder={t("serviceDetail.reviewPlaceholder")}
                aria-invalid={errors.review ? true : undefined}
                className={cn(
                  "w-full resize-y border bg-surface px-3.5 py-3 text-[14.5px] leading-[1.6] font-medium text-heading outline-none transition-colors placeholder:text-muted focus:border-primary",
                  errors.review ? "border-danger" : "border-border",
                )}
              />
            )}
          />
          {errors.review && <span className={ERROR_TEXT}>{errors.review.message}</span>}
          <button
            type="submit"
            disabled={add.isPending}
            className="flex h-11 w-fit cursor-pointer items-center gap-2 bg-primary px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
          >
            {add.isPending ? (
              <Loader2 size={15} strokeWidth={2.4} aria-hidden className="animate-spin" />
            ) : (
              <Send size={15} strokeWidth={2.2} aria-hidden />
            )}
            {t("serviceDetail.sendReview")}
          </button>
        </form>
      ) : (
        isClient && (
          <Link
            href="/login"
            className={cn(CARD, "flex items-center justify-between gap-3 px-5 py-4 text-[14px] font-semibold text-heading transition-colors hover:border-primary hover:text-brand")}
          >
            {t("serviceDetail.signInToReview")}
            <ArrowRight size={15} strokeWidth={2.4} aria-hidden className="rtl:rotate-180" />
          </Link>
        )
      )}
    </div>
  );
}
