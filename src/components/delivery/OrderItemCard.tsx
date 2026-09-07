"use client";

import { Controller, useWatch, type Control, type FieldErrors } from "react-hook-form";
import { useLang } from "@/hooks/useLang";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import {
  ERROR_TEXT,
  ItemCard,
  LABEL,
  OptionalRule,
  RequiredMark,
  TextField,
  UnitField,
} from "@/components/forms/itemListForm";
import type { DeliveryRequest } from "@/schemas/delivery.schema";

/**
 * One item in a shop-and-deliver order.
 *
 * The old screen put all seven inputs in two undifferentiated rows, so "Item
 * Name" and "Possible Price" carried the same visual weight even though one is
 * required and the other is a guess. Here the two required fields sit alone at
 * the top and the five optional ones live under a labelled rule — the shape of
 * the card tells you what you actually have to fill in.
 *
 * No `data-anim` anywhere: a GSAP reveal waits for hydration, and a form field
 * that fades in is a form field you cannot type into yet.
 */
export function OrderItemCard({
  index,
  control,
  errors,
  onRemove,
}: {
  index: number;
  control: Control<DeliveryRequest>;
  errors: FieldErrors<DeliveryRequest>;
  onRemove?: () => void;
}) {
  const { t } = useLang();

  const itemErrors = errors.items?.[index];

  /* `useWatch`, not `watch()` — the React Compiler is on. This is only for the
     card's own heading. */
  const name = useWatch({ control, name: `items.${index}.name` });

  return (
    <ItemCard
      index={index}
      title={name}
      titleFallback={t("deliveryPage.item.untitled")}
      removeLabel={t("deliveryPage.item.remove")}
      onRemove={onRemove}
    >
      {/* ── Required ── */}
      <div className="grid grid-cols-1 gap-4 mid:grid-cols-[minmax(0,1fr)_auto]">
        <TextField<DeliveryRequest>
          name={`items.${index}.name`}
          control={control}
          id={`item-${index}-name`}
          label={t("deliveryPage.item.name")}
          placeholder={t("deliveryPage.item.namePlaceholder")}
          required
          error={itemErrors?.name?.message}
        />

        {/* A stepper rather than a bare box. Quantity is the one field people
            adjust by one repeatedly, and a keyboard is a poor way to do that
            on a phone — the input stays typeable for the jump from 1 to 40. */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL} htmlFor={`item-${index}-qty`}>
            {t("deliveryPage.item.quantity")}
            <RequiredMark />
          </label>
          <Controller
            name={`items.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <QuantityStepper
                id={`item-${index}-qty`}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                invalid={Boolean(itemErrors?.quantity)}
                decreaseLabel={t("deliveryPage.item.decrease")}
                increaseLabel={t("deliveryPage.item.increase")}
              />
            )}
          />
          {itemErrors?.quantity && (
            <span className={ERROR_TEXT}>{itemErrors.quantity.message}</span>
          )}
        </div>
      </div>

      {/* ── Optional ──
          A labelled rule instead of the old screen's "(If Any)" suffixes: it
          says the same thing once rather than three times, and it says it
          about the whole group. */}
      <OptionalRule>{t("deliveryPage.item.optional")}</OptionalRule>

      <div className="grid grid-cols-1 gap-4 mid:grid-cols-3">
        <TextField<DeliveryRequest>
          name={`items.${index}.brand`}
          control={control}
          id={`item-${index}-brand`}
          label={t("deliveryPage.item.brand")}
          placeholder={t("deliveryPage.item.brandPlaceholder")}
        />
        <TextField<DeliveryRequest>
          name={`items.${index}.size`}
          control={control}
          id={`item-${index}-size`}
          label={t("deliveryPage.item.size")}
          placeholder={t("deliveryPage.item.sizePlaceholder")}
        />
        <UnitField<DeliveryRequest>
          name={`items.${index}.price`}
          control={control}
          id={`item-${index}-price`}
          label={t("deliveryPage.item.price")}
          unit={t("deliveryPage.currency")}
          placeholder={t("deliveryPage.item.pricePlaceholder")}
          error={itemErrors?.price?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 mid:grid-cols-2">
        <TextField<DeliveryRequest>
          name={`items.${index}.shop`}
          control={control}
          id={`item-${index}-shop`}
          label={t("deliveryPage.item.shop")}
          placeholder={t("deliveryPage.item.shopPlaceholder")}
        />
        <TextField<DeliveryRequest>
          name={`items.${index}.shop_address`}
          control={control}
          id={`item-${index}-shop-address`}
          label={t("deliveryPage.item.shopAddress")}
          placeholder={t("deliveryPage.item.shopAddressPlaceholder")}
        />
      </div>
    </ItemCard>
  );
}
