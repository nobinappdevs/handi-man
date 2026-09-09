"use client";

import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Clock, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { PickupItemCard } from "@/components/pickup/PickupItemCard";
import { AddItemButton, LABEL } from "@/components/forms/itemListForm";
import {
  EMPTY_PICKUP_ITEM,
  pickupRequestSchema,
  type PickupRequest,
} from "@/schemas/pickup.schema";
import { cn } from "@/components/ui/cn";

/** The three reassurances in the page head — what the old screen never said. */
const PROMISES = [
  { key: "sameDay", icon: Clock },
  { key: "verified", icon: ShieldCheck },
  { key: "tracked", icon: Truck },
] as const;

/**
 * The `/pickup` screen: a rider comes to your door, collects the parcels you
 * list, and sends them on.
 *
 * ── What the redesign changes, and why ──
 *
 *  1. The old screen showed one bare "Products" row and gave no clue that the
 *     list could grow at all — "Add" sat top-right, detached from it. Items
 *     are numbered cards now, and the add button closes the list.
 *  2. `KG` was a `type="number"` box with spinner arrows, so a scroll over the
 *     field silently changed the weight. It is a plain input with the unit
 *     welded on (`UnitField`), no spinner and no scroll trap.
 *  3. The red delete block was the loudest thing on an empty form. It is now a
 *     quiet icon that reddens on hover, and it is absent entirely while there
 *     is only one product to delete.
 *  4. "Proceed" had nothing to proceed *from*. It now ends a summary that
 *     counts the parcels and totals their weight — the number a courier price
 *     actually depends on.
 *  5. Nothing here is animated with GSAP. A scroll reveal waits for hydration
 *     and a form that fades in is a form you cannot yet type into; only the
 *     head uses the CSS `enter-*` classes, which paint with the document.
 *
 * Validation is local (Zod + RHF); on submit the button switches to its sent
 * label. Wire the mutation in when the pickup endpoint exists — the toast, the
 * navigation and `invalidateQueries` belong in that hook, not here.
 */
export function PickupScreen() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PickupRequest>({
    resolver: zodResolver(pickupRequestSchema),
    defaultValues: { items: [{ ...EMPTY_PICKUP_ITEM }], note: "" },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  /* `useWatch`, not `watch()` — the React Compiler is on. This drives the
     running totals in the summary. */
  const items = useWatch({ control, name: "items" });

  const units = (items ?? []).reduce((sum, item) => {
    const qty = Number(item?.quantity);
    return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0);
  }, 0);

  /* Weight is per unit, so a row of 3 × 2kg is 6kg — the figure a courier
     quote is actually built on. */
  const totalWeight = (items ?? []).reduce((sum, item) => {
    const weight = Number(item?.weight);
    const qty = Number(item?.quantity);
    if (!Number.isFinite(weight) || !Number.isFinite(qty) || qty <= 0) return sum;
    return sum + weight * qty;
  }, 0);

  return (
    <>
      {/* ── Page head ── */}
      <section className="bg-page border-b border-border px-[clamp(18px,3vw,44px)] pt-[clamp(34px,4.5vw,66px)] pb-[clamp(30px,3.6vw,52px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-7">
          <div className="enter-group flex min-w-0 max-w-[620px] flex-col gap-3">
            <Eyebrow icon={<PackageCheck size={16} strokeWidth={2.2} aria-hidden />}>
              {t("pickupPage.eyebrow")}
            </Eyebrow>
            {/* `enter-rise` — transform only. This is the LCP element and an
                opacity entrance on it costs seconds of it. */}
            <h1 className="enter-rise text-balance [--enter-delay:0.08s]">
              {t("pickupPage.title")}
            </h1>
            <p className="max-w-[54ch]">{t("pickupPage.lead")}</p>
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
                  {t(`pickupPage.promises.${key}`)}
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
                <PickupItemCard
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
                append({ ...EMPTY_PICKUP_ITEM });
                setSent(false);
              }}
            >
              {t("pickupPage.addItem")}
            </AddItemButton>

            {/* ── Additional note ── */}
            <div className="flex flex-col gap-1.5 border border-border bg-card p-[clamp(16px,2vw,24px)]">
              <label htmlFor="pickup-note" className={LABEL}>
                {t("pickupPage.note")}
              </label>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    value={field.value ?? ""}
                    id="pickup-note"
                    rows={4}
                    placeholder={t("pickupPage.notePlaceholder")}
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
              {t("pickupPage.summary.title")}
            </span>

            <dl className="flex flex-col gap-3 border-b border-border pb-4">
              <SummaryRow label={t("pickupPage.summary.products")} value={String(fields.length)} />
              <SummaryRow label={t("pickupPage.summary.units")} value={String(units)} />
            </dl>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[14px] font-semibold text-body">
                  {t("pickupPage.summary.weight")}
                </span>
                <span className="font-display text-[clamp(20px,2vw,26px)] leading-none font-black tracking-[-0.02em] text-brand tabular-nums">
                  {totalWeight.toFixed(2)}{" "}
                  {/* `inline` — the base layer makes a bare span `display:block`,
                      which would drop the unit onto its own line. */}
                  <span className="inline text-[13px] font-bold tracking-[0.1em]">
                    {t("pickupPage.unit")}
                  </span>
                </span>
              </div>
              {/* Says what the number is built from, so it cannot be mistaken
                  for a price. */}
              <p className="text-[12.5px] leading-[1.5] font-medium text-muted">
                {totalWeight === 0
                  ? t("pickupPage.summary.noWeight")
                  : t("pickupPage.summary.weightNote")}
              </p>
            </div>

            <button
              type="submit"
              className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 bg-primary font-display text-[14.5px] font-bold tracking-[0.13em] text-white uppercase transition-colors hover:bg-primary-dark"
            >
              {t(sent ? "pickupPage.sent" : "pickupPage.submit")}
              <ArrowRight size={15} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            </button>

            {/* The array-level error (an empty list) has nowhere else to
                surface — no single field owns it. */}
            {errors.items?.root && (
              <span className="text-[12.5px] font-medium text-danger">
                {errors.items.root.message}
              </span>
            )}

            <p className="text-[12.5px] leading-[1.5] font-medium text-muted">
              {t("pickupPage.summary.footnote")}
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
