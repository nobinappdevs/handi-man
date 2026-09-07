"use client";

import type { ReactNode } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/components/ui/cn";

/**
 * The chrome shared by the two "list what you need, we handle it" request
 * forms — `/delivery` (shop and deliver) and `/pickup` (collect and send).
 *
 * Both are a `useFieldArray` of numbered item cards over an "add another"
 * button, and both had every one of these pieces written twice before this
 * module existed. The screens keep their own field sets and copy; only the
 * furniture lives here.
 */

/* Square, themed fields — these pages use the normal surfaces so dark mode
   comes free. (`bg-field`/`field-line` are the deliberately light-in-both-
   themes tokens for the hero band and the plum contact panel; they would be
   wrong here.) */
export const FIELD =
  "h-12 w-full min-w-0 border bg-surface px-3.5 text-[14.5px] font-medium text-heading outline-none transition-colors placeholder:text-muted focus:border-primary";

export const LABEL =
  "font-display text-[11.5px] font-bold tracking-[0.14em] text-muted uppercase";

export const ERROR_TEXT = "mt-1.5 block text-[12.5px] font-medium text-danger";

/**
 * The `*` beside a required field's label.
 *
 * `inline` is load-bearing: the base layer sets `span { display: block }` (see
 * the note above the `span` rule in `globals.css`), so without it the asterisk
 * drops onto its own line under the label.
 */
export function RequiredMark() {
  return (
    <span aria-hidden className="ms-1 inline text-danger">
      *
    </span>
  );
}

/**
 * One numbered card in the item list.
 *
 * `title` echoes what the user has typed so a long list stays readable once
 * the fields are scrolled past, and falls back to a placeholder while empty.
 * `onRemove` is optional: the last remaining item must not be removable, since
 * an empty order is not a thing either schema allows.
 */
export function ItemCard({
  index,
  title,
  titleFallback,
  removeLabel,
  onRemove,
  children,
}: {
  index: number;
  title?: string;
  titleFallback: string;
  removeLabel: string;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <li className="border border-border bg-card">
      <div className="flex items-center gap-3.5 border-b border-border px-[clamp(16px,2vw,24px)] py-3.5">
        <span className="flex h-8 w-8 flex-none items-center justify-center bg-primary font-display text-[13px] font-bold text-white tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[15px] font-bold tracking-[-0.01em]",
            title ? "text-heading" : "text-muted",
          )}
        >
          {title || titleFallback}
        </span>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={removeLabel}
            className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={16} strokeWidth={2.1} aria-hidden />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5 px-[clamp(16px,2vw,24px)] py-[clamp(18px,2.2vw,26px)]">
        {children}
      </div>
    </li>
  );
}

/**
 * The "add another item" button.
 *
 * It rests in the plum treatment rather than a muted one: on a page of pale
 * cards a grey dashed outline reads as a disabled placeholder, not as the one
 * action that grows the order. Hover deepens the fill so it still answers the
 * pointer.
 *
 * It sits at the END of the list it appends to — the old screens put "Add"
 * top-right, a long way from where the new row actually appears.
 *
 * `brand`, not `primary`: `--brand-ink` flips to the light plum in dark mode
 * while `--color-primary` stays #450C3F, so plum-on-dark text and borders
 * would all but vanish there.
 */
export function AddItemButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 border border-dashed border-brand bg-brand/10 font-display text-[13.5px] font-bold tracking-[0.13em] text-brand uppercase transition-colors hover:bg-brand/20"
    >
      <Plus size={16} strokeWidth={2.6} aria-hidden />
      {children}
    </button>
  );
}

/** A labelled text input bound to one path of the form. */
export function TextField<T extends FieldValues>({
  name,
  control,
  id,
  label,
  placeholder,
  required,
  error,
  inputMode,
}: {
  name: Path<T>;
  control: Control<T>;
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className={LABEL} htmlFor={id}>
        {label}
        {required && <RequiredMark />}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            value={field.value ?? ""}
            id={id}
            type="text"
            inputMode={inputMode}
            autoComplete="off"
            placeholder={placeholder}
            aria-invalid={error ? true : undefined}
            className={cn(FIELD, error ? "border-danger" : "border-border")}
          />
        )}
      />
      {error && <span className={ERROR_TEXT}>{error}</span>}
    </div>
  );
}

/**
 * A text input with a fixed unit welded to its trailing edge — `USD` on a
 * price, `KG` on a weight.
 *
 * The unit is a `<span>`, not a select or a spinner: neither screen offers a
 * choice of unit, and the old pickup design's `type="number"` spinner arrows
 * on the KG box were a scroll-wheel accident waiting to happen.
 */
export function UnitField<T extends FieldValues>({
  name,
  control,
  id,
  label,
  unit,
  placeholder,
  required,
  error,
  inputMode = "decimal",
}: {
  name: Path<T>;
  control: Control<T>;
  id: string;
  label: string;
  unit: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className={LABEL} htmlFor={id}>
        {label}
        {required && <RequiredMark />}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div
            className={cn(
              "flex h-12 items-center border bg-surface transition-colors focus-within:border-primary",
              error ? "border-danger" : "border-border",
            )}
          >
            <input
              {...field}
              value={field.value ?? ""}
              id={id}
              type="text"
              inputMode={inputMode}
              autoComplete="off"
              placeholder={placeholder}
              aria-invalid={error ? true : undefined}
              className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[14.5px] font-medium text-heading outline-none placeholder:text-muted"
            />
            <span className="flex h-full flex-none items-center border-s border-border px-3.5 font-display text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
              {unit}
            </span>
          </div>
        )}
      />
      {error && <span className={ERROR_TEXT}>{error}</span>}
    </div>
  );
}

/** The "Optional details" rule that separates required fields from the rest. */
export function OptionalRule({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className={cn(LABEL, "flex-none")}>{children}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}
