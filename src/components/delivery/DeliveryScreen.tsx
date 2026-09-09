"use client";

import { useState } from "react";
import { useFieldArray, useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, PackagePlus, Receipt, ShieldCheck, Truck } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { OrderItemCard } from "@/components/delivery/OrderItemCard";
import { AddItemButton, LABEL } from "@/components/forms/itemListForm";
import {
  deliveryRequestSchema,
  EMPTY_ORDER_ITEM,
  type DeliveryRequest,
} from "@/schemas/delivery.schema";
import { cn } from "@/components/ui/cn";

/** The three reassurances in the page head — what the old screen never said. */
const PROMISES = [
  { key: "verified", icon: ShieldCheck },
  { key: "tracked", icon: Truck },
  { key: "payAfter", icon: Receipt },
] as const;

/**
 * The `/delivery` screen: a shop-and-deliver request. You list what you want
 * bought, a verified rider buys it and brings it over.
 *
 * ── What the redesign changes, and why ──
 *
 *  1. The old page was a single grey slab of seven equal-weight inputs. Here
 *     the two fields that are actually required lead each item card and the
 *     rest sit under an "optional" rule (see `OrderItemCard`).
 *  2. "Add" used to sit top-right, far from the end of the list where a new
 *     item appears. It is now a full-width button at the bottom of the list —
 *     next to the thing it does, and a big target on a phone.
 *  3. "Proceed" used to be a bare bar under the note with nothing to proceed
 *     *from*. It now lives in a summary that counts the items and totals the
 *     estimates, so the button is the end of a sentence rather than a leap.
 *  4. Nothing here is animated with GSAP. A scroll reveal waits for hydration
 *     and a form that fades in is a form you cannot yet type into; only the
 *     head uses the CSS `enter-*` classes, which paint with the document.
 *
 * Validation is local (Zod + RHF); on submit the button switches to its sent
 * label. Wire the mutation in when the delivery endpoint exists — the toast,
 * the navigation and `invalidateQueries` belong in that hook, not here.
 */
export function DeliveryScreen() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryRequest>({
    resolver: zodResolver(deliveryRequestSchema),
    defaultValues: { items: [{ ...EMPTY_ORDER_ITEM }], note: "" },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  /* `useWatch`, not `watch()` — the React Compiler is on. This drives the
     running total in the summary. */
  const items = useWatch({ control, name: "items" });

  /* Only the items that carry a price estimate count towards the total, and
     the label below says so — a total that silently ignores half the order
     would be worse than no total at all. */
  const priced = (items ?? []).filter((item) => item?.price);
  const estimate = priced.reduce((sum, item) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(qty)) return sum;
    return sum + price * qty;
  }, 0);

  const units = (items ?? []).reduce((sum, item) => {
    const qty = Number(item?.quantity);
    return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0);
  }, 0);

  return (
    <>
      {/* ── Page head ── */}
      <section className="bg-page border-b border-border px-[clamp(18px,3vw,44px)] pt-[clamp(34px,4.5vw,66px)] pb-[clamp(30px,3.6vw,52px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-7">
          <div className="enter-group flex min-w-0 max-w-[620px] flex-col gap-3">
            <Eyebrow icon={<PackagePlus size={16} strokeWidth={2.2} aria-hidden />}>
              {t("deliveryPage.eyebrow")}
            </Eyebrow>
            {/* `enter-rise` — transform only. This is the LCP element and an
                opacity entrance on it costs seconds of it. */}
            <h1 className="enter-rise text-balance [--enter-delay:0.08s]">
              {t("deliveryPage.title")}
            </h1>
            <p className="max-w-[54ch]">{t("deliveryPage.lead")}</p>
          </div>

          {/* Not `flex-none`: below `mid` this column wraps onto its own line
              and has to be able to shrink, or it pushes the page sideways past
              the section padding. */}
          <div className="enter-fade flex min-w-0 flex-col gap-3 [--enter-delay:0.24s]">
            {PROMISES.map(({ key, icon: Icon }) => (
              <span key={key} className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Icon size={16} strokeWidth={2.2} aria-hidden />
                </span>
                <span className="text-[14px] font-semibold text-body">
                  {t(`deliveryPage.promises.${key}`)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── The request ── */}
      <section className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(34px,4.5vw,72px)]">
        <form
          noValidate
          onSubmit={handleSubmit(() => setSent(true))}
          className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-[clamp(24px,3vw,40px)] wide:grid-cols-[minmax(0,1fr)_340px]"
        >
          <div className="flex min-w-0 flex-col gap-[clamp(20px,2.4vw,32px)]">
            <ol className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <OrderItemCard
                  key={field.id}
                  index={index}
                  control={control}
                  errors={errors}
                  onRemove={
                    fields.length > 1
                      ? () => {
                          remove(index);
                          setSent(false);
                        }
                      : undefined
                  }
                />
              ))}
            </ol>

            <AddItemButton
              onClick={() => {
                append({ ...EMPTY_ORDER_ITEM });
                setSent(false);
              }}
            >
              {t("deliveryPage.addItem")}
            </AddItemButton>

            {/* ── Additional note ── */}
            <div className="flex flex-col gap-1.5 border border-border bg-card p-[clamp(16px,2vw,24px)]">
              <label htmlFor="delivery-note" className={LABEL}>
                {t("deliveryPage.note")}
              </label>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    value={field.value ?? ""}
                    id="delivery-note"
                    rows={4}
                    placeholder={t("deliveryPage.notePlaceholder")}
                    aria-invalid={errors.note ? true : undefined}
                    onChange={(e) => {
                      field.onChange(e);
                      setSent(false);
                    }}
                    className={cn(
                      "w-full resize-y border bg-surface px-3.5 py-3 text-[14.5px] leading-[1.6] font-medium text-heading outline-none transition-colors placeholder:text-muted focus:border-primary",
                      errors.note ? "border-danger" : "border-border",
                    )}
                  />
                )}
              />
              {errors.note && (
                <span className="text-[12.5px] font-medium text-danger">{errors.note.message}</span>
              )}
            </div>
          </div>

          {/* ── Summary ──
              `sticky` only from `wide:`, where the column exists at all. Below
              that it is simply the last block in the flow.

              The offset clears the sticky site header via `--header-offset`,
              which drops to 0 while that header is hidden — so this rides up
              with it instead of hanging under nothing. */}
          <aside className="flex min-w-0 flex-col gap-4 border border-border bg-card p-[clamp(20px,2.2vw,26px)] wide:sticky wide:top-[calc(var(--header-offset)+16px)] wide:transition-[top] wide:duration-500 wide:ease-out">
            <span className="font-display text-[12px] font-bold tracking-[0.14em] text-muted uppercase">
              {t("deliveryPage.summary.title")}
            </span>

            <dl className="flex flex-col gap-3 border-b border-border pb-4">
              <SummaryRow label={t("deliveryPage.summary.items")} value={String(fields.length)} />
              <SummaryRow label={t("deliveryPage.summary.units")} value={String(units)} />
            </dl>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[14px] font-semibold text-body">
                  {t("deliveryPage.summary.estimate")}
                </span>
                <span className="font-display text-[clamp(20px,2vw,26px)] leading-none font-black tracking-[-0.02em] text-brand tabular-nums">
                  {estimate.toFixed(2)}{" "}
                  {/* `inline` — the base layer makes a bare span `display:block`,
                      which would drop the unit onto its own line. */}
                  <span className="inline text-[13px] font-bold tracking-[0.1em]">
                    {t("deliveryPage.currency")}
                  </span>
                </span>
              </div>
              {/* Says exactly what the number does and does not cover, so the
                  figure cannot be mistaken for a quote. */}
              <p className="text-[12.5px] leading-[1.5] font-medium text-muted">
                {priced.length === 0
                  ? t("deliveryPage.summary.noEstimate")
                  : t("deliveryPage.summary.estimateNote")}
              </p>
            </div>

            <button
              type="submit"
              className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 bg-primary font-display text-[14.5px] font-bold tracking-[0.13em] text-white uppercase transition-colors hover:bg-primary-dark"
            >
              {t(sent ? "deliveryPage.sent" : "deliveryPage.submit")}
              <ArrowRight size={15} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            </button>

            {/* The array-level error (an empty order) has nowhere else to
                surface — no single field owns it. */}
            {errors.items?.root && (
              <span className="text-[12.5px] font-medium text-danger">
                {errors.items.root.message}
              </span>
            )}

            <p className="text-[12.5px] leading-[1.5] font-medium text-muted">
              {t("deliveryPage.summary.footnote")}
            </p>
          </aside>
        </form>
      </section>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[14px] font-semibold text-body">{label}</dt>
      <dd className="text-[15px] font-bold text-heading tabular-nums">{value}</dd>
    </div>
  );
}
