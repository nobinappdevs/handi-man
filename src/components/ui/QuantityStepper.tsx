"use client";

import type { Ref } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/components/ui/cn";

/**
 * A whole-number stepper: −, a typeable box, +.
 *
 * The value stays a **string** and is passed straight through, because that is
 * what an `<input>` holds and what the surrounding Zod schemas validate. A
 * number here would turn an empty box into `NaN` and report "expected number,
 * received nan" at the user.
 *
 * The box is deliberately still typeable — a stepper alone makes the jump from
 * 1 to 40 forty clicks — and `inputMode="numeric"` brings up the digit pad
 * without `type="number"`'s spinner and scroll-wheel surprises.
 *
 * Labels come in as props, so this stays app-agnostic per the `ui/` rule.
 */
export function QuantityStepper({
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  id,
  min = 1,
  max = 999,
  invalid,
  decreaseLabel,
  increaseLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  inputRef?: Ref<HTMLInputElement>;
  id?: string;
  min?: number;
  max?: number;
  invalid?: boolean;
  decreaseLabel: string;
  increaseLabel: string;
  className?: string;
}) {
  const current = Number(value);
  const valid = Number.isFinite(current);

  /* An unparseable box (empty, mid-edit, pasted junk) steps from `min` rather
     than refusing to move — pressing + on an empty field should give you
     something, not nothing. */
  const step = (delta: number) => {
    const base = valid && current >= min ? current : min;
    onChange(String(Math.min(max, Math.max(min, base + delta))));
  };

  return (
    <div
      className={cn(
        "flex h-12 items-center border bg-surface transition-colors focus-within:border-primary",
        invalid ? "border-danger" : "border-border",
        className,
      )}
    >
      <StepButton
        onClick={() => step(-1)}
        label={decreaseLabel}
        disabled={valid && current <= min}
      >
        <Minus size={15} strokeWidth={2.4} aria-hidden />
      </StepButton>

      <input
        ref={inputRef}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={invalid || undefined}
        className="h-full w-14 min-w-0 border-x border-border bg-transparent text-center text-[15px] font-bold text-heading outline-none tabular-nums"
      />

      <StepButton onClick={() => step(1)} label={increaseLabel} disabled={valid && current >= max}>
        <Plus size={15} strokeWidth={2.4} aria-hidden />
      </StepButton>
    </div>
  );
}

function StepButton({
  onClick,
  label,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-full w-11 flex-none cursor-pointer items-center justify-center text-heading transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent disabled:hover:text-muted"
    >
      {children}
    </button>
  );
}
