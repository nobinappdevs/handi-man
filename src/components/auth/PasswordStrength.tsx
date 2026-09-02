"use client";

import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";

/**
 * 0–4, one point per independent property. Four *kinds* of check rather than
 * length alone, so a long lowercase word cannot score "strong".
 *
 * Advisory only — the rule that actually gates submission is
 * `registerRequestSchema`. This meter never blocks anyone.
 */
export function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const LABEL_KEYS = [
  "",
  "auth.strengthWeak",
  "auth.strengthFair",
  "auth.strengthGood",
  "auth.strengthStrong",
];

/* Not tokens on purpose: these are a traffic light, not brand surfaces, and the
   same four hues have to keep meaning the same thing in both themes. */
const BAR_COLORS = ["", "bg-red-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];

export function PasswordStrength({ value }: { value: string }) {
  const { t } = useLang();

  // Nothing typed yet — an empty meter would only read as a failure.
  if (!value) return null;

  const score = scorePassword(value);

  return (
    <div className="mt-2 flex items-center gap-2.5">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              n <= score ? BAR_COLORS[score] : "bg-border",
            )}
          />
        ))}
      </div>
      <span aria-live="polite" className="flex-none text-[12px] text-muted">
        {t(LABEL_KEYS[score])}
      </span>
    </div>
  );
}
