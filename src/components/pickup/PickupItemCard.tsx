"use client";

import { Controller, useWatch, type Control, type FieldErrors } from "react-hook-form";
import { useLang } from "@/hooks/useLang";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import {
  ERROR_TEXT,
  ItemCard,
  LABEL,
  RequiredMark,
  TextField,
  UnitField,
} from "@/components/forms/itemListForm";
import type { PickupRequest } from "@/schemas/pickup.schema";

/**
 * One product in a pickup request: what it is, how many, what each one weighs.
 *
 * All three are required, so there is no "optional details" rule here — unlike
 * the delivery card, this really is a three-field row and the layout says so.
 * The three sit on one line from `mid:` up, sized by what they hold: the name
 * takes the slack, quantity and weight only as much as their content needs.
 */
export function PickupItemCard({
  index,
  control,
  errors,
  onRemove,
}: {
  index: number;
  control: Control<PickupRequest>;
  errors: FieldErrors<PickupRequest>;
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
      titleFallback={t("pickupPage.item.untitled")}
      removeLabel={t("pickupPage.item.remove")}
      onRemove={onRemove}
    >
      <div className="grid grid-cols-1 gap-4 mid:grid-cols-[minmax(0,1fr)_auto_minmax(0,180px)]">
        <TextField<PickupRequest>
          name={`items.${index}.name`}
          control={control}
          id={`pickup-${index}-name`}
          label={t("pickupPage.item.name")}
          placeholder={t("pickupPage.item.namePlaceholder")}
          required
          error={itemErrors?.name?.message}
        />

        <div className="flex flex-col gap-1.5">
          <label className={LABEL} htmlFor={`pickup-${index}-qty`}>
            {t("pickupPage.item.quantity")}
            <RequiredMark />
          </label>
          <Controller
            name={`items.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <QuantityStepper
                id={`pickup-${index}-qty`}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                invalid={Boolean(itemErrors?.quantity)}
                decreaseLabel={t("pickupPage.item.decrease")}
                increaseLabel={t("pickupPage.item.increase")}
              />
            )}
          />
          {itemErrors?.quantity && (
            <span className={ERROR_TEXT}>{itemErrors.quantity.message}</span>
          )}
        </div>

        <UnitField<PickupRequest>
          name={`items.${index}.weight`}
          control={control}
          id={`pickup-${index}-weight`}
          label={t("pickupPage.item.weight")}
          unit={t("pickupPage.unit")}
          placeholder={t("pickupPage.item.weightPlaceholder")}
          required
          error={itemErrors?.weight?.message}
        />
      </div>

      {/* Weight is per item, not per row — a courier quote depends on which,
          and the summary multiplies by quantity on that basis. */}
      <p className="text-[12.5px] leading-[1.5] font-medium text-muted">
        {t("pickupPage.item.weightHint")}
      </p>
    </ItemCard>
  );
}
