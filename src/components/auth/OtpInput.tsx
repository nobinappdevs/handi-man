"use client";

import { useRef } from "react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { OTP_LENGTH } from "@/components/auth/authData";

/**
 * The boxed code entry, shared by the email OTP screen and the authenticator
 * screen.
 *
 * Controlled by a single string rather than an array of six, because that is
 * what every caller actually needs — `value.length === length` is the whole
 * "is it complete" test, and there is no second source of truth to keep in
 * step. The consequence is deliberate: the code is one left-aligned string, so
 * clicking box 4 of an empty field and typing writes digit 1, it does not leave
 * three holes behind. Backspace splices rather than blanks, for the same
 * reason.
 *
 * `autoComplete="one-time-code"` goes on every box, not just the first — that
 * is what iOS wants before it will offer the code from Messages.
 */
export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const { t } = useLang();
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  const focus = (i: number) => boxes.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  /** Writes `digits` from `start`, clamped to the end of what is typed so far. */
  const fill = (start: number, digits: string) => {
    const chars = value.split("");
    const at = Math.min(start, chars.length);
    for (let k = 0; k < digits.length && at + k < length; k++) chars[at + k] = digits[k];
    onChange(chars.join("").slice(0, length));
    focus(at + digits.length);
  };

  const handleChange = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    // Non-digit keystroke, or a box cleared by something other than Backspace.
    if (!digits) return;
    // A one-box input can still receive several characters: password managers
    // and Android keyboards both paste through `change` rather than `paste`.
    fill(i, digits.length > 1 ? digits : digits.slice(-1));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const chars = value.split("");
      const at = chars[i] ? i : i - 1;
      if (at < 0) return;
      chars.splice(at, 1);
      onChange(chars.join(""));
      focus(at);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focus(i - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focus(i + 1);
    }
  };

  const handlePaste = (i: number, e: React.ClipboardEvent) => {
    e.preventDefault();
    fill(i, e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length));
  };

  return (
    <div>
      <div className="flex gap-[clamp(6px,1.4vw,10px)]">
        {Array.from({ length }, (_, i) => {
          const digit = value[i] ?? "";
          return (
            <input
              key={i}
              ref={(el) => {
                boxes.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={disabled}
              autoFocus={autoFocus && i === 0}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => e.target.select()}
              aria-label={t("auth.digitLabel") + " " + (i + 1)}
              className={cn(
                "h-[clamp(48px,5vw,56px)] min-w-0 flex-1 rounded-xl border text-center text-[clamp(18px,2vw,22px)] font-bold outline-none transition focus:ring-2",
                digit
                  ? "border-brand bg-brand/8 text-brand"
                  : "border-border bg-surface text-heading",
                "focus:border-primary focus:ring-primary/20",
                disabled && "opacity-50",
              )}
            />
          );
        })}
      </div>

      {/* Fill progress. Cheap, and it is the one bit of feedback that survives
          on a screen where every box looks the same until it is typed into. */}
      <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-border" aria-hidden>
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: (value.length / length) * 100 + "%" }}
        />
      </div>
    </div>
  );
}
