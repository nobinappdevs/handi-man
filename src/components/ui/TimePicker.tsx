"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";

/**
 * A time field whose WHOLE box opens the picker - the native `<input
 * type="time">` only opens from its little clock glyph, and draws a
 * different widget in every browser.
 *
 * The menu is three quiet columns - hour, minute, AM/PM - and nothing else:
 * the trigger already shows the time being built. Picking in any column
 * applies at once; a click outside, or Escape, closes it. Same shell as `Select`: a portal to <body>,
 * placed under the trigger and flipped above it when there is no room.
 *
 * The value is "HH:mm", 24-hour - what the API and the schemas speak - and ""
 * when unset. Minutes step by 5, but a stored odd minute ("10:31") is kept in
 * the list so an old slot opens showing its own time.
 */

const MENU_H = 360;
const MINUTE_STEP = 5;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1 … 12

type Parts = { h12: number; minute: number; pm: boolean };

function parse(value: string): Parts | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!m) return null;
  const h = Number(m[1]);
  const minute = Number(m[2]);
  if (h > 23 || minute > 59) return null;
  return { h12: h % 12 || 12, minute, pm: h >= 12 };
}

function format({ h12, minute, pm }: Parts) {
  const h = (h12 % 12) + (pm ? 12 : 0);
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const pad = (n: number) => String(n).padStart(2, "0");
export const formatTime12 = (value: string) => {
  const p = parse(value);
  return p ? `${p.h12}:${pad(p.minute)} ${p.pm ? "PM" : "AM"}` : "";
};

/** One scrollable column of choices. */
function Column({
  label,
  items,
  selected,
  render,
  onPick,
}: {
  label: string;
  items: number[];
  selected: number | null;
  render: (n: number) => string;
  onPick: (n: number) => void;
}) {
  const list = useRef<HTMLDivElement>(null);

  /* Open with the current choice centred. Set on the column itself, not with
     `scrollIntoView`, which would also scroll the dialog and the page behind
     this fixed menu. */
  useEffect(() => {
    const box = list.current;
    const el = box?.querySelector<HTMLElement>("[aria-selected='true']");
    if (box && el) box.scrollTop = el.offsetTop - box.clientHeight / 2 + el.offsetHeight / 2;
  }, []);

  return (
    <div
      ref={list}
      role="listbox"
      aria-label={label}
      className="no-scrollbar relative flex h-52 min-w-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-1.5 py-1.5"
    >
      {items.map((n) => {
        const on = n === selected;
        return (
          <button
            key={n}
            type="button"
            role="option"
            aria-selected={on}
            onClick={() => onPick(n)}
            className={cn(
              "h-9 flex-none cursor-pointer text-[14px] tabular-nums transition-colors",
              on ? "bg-primary/10 font-bold text-brand" : "font-medium text-body hover:bg-sunk hover:text-heading",
            )}
          >
            {render(n)}
          </button>
        );
      })}
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  error,
  required,
  disabled,
  id,
}: {
  /** "HH:mm" (24-hour), or "". */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}) {
  const { t } = useLang();
  const autoId = useId();
  const fieldId = id ?? autoId;
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; bottom: number; left: number; width: number; dropUp: boolean } | null>(
    null,
  );

  const parts = parse(value);
  const invalid = Boolean(error);

  /* The minute column: every 5, plus the stored minute if it is not one of them. */
  const minutes = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);
  if (parts && !minutes.includes(parts.minute)) {
    minutes.push(parts.minute);
    minutes.sort((a, b) => a - b);
  }

  const place = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom;
    setRect({
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      width: r.width,
      dropUp: below < MENU_H + 16 && r.top > below,
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!btnRef.current?.contains(target) && !popRef.current?.contains(target)) close();
    };
    /* Capture phase, and stopped there: inside a `Modal`, Escape should close
       this menu, not the dialog under it - the dialog listens on the same
       document, in the bubble phase. */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
        btnRef.current?.focus();
      }
    };
    const rep = () => place();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", rep);
    window.addEventListener("scroll", rep, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", rep);
      window.removeEventListener("scroll", rep, true);
    };
  }, [open, place, close]);

  /* Picking in one column before the others have a value fills them with a
     sensible start - 9:00 AM - rather than leaving a half-made time. */
  const pick = (patch: Partial<Parts>) =>
    onChange(format({ ...(parts ?? { h12: 9, minute: 0, pm: false }), ...patch }));

  const width = Math.max(rect?.width ?? 0, 220);

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className={cn("text-sm font-medium", invalid ? "text-danger" : "text-heading")}>
          {label}
          {required && <span aria-hidden className="ms-1 inline text-danger">*</span>}
        </label>
      )}

      <button
        ref={btnRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (open) return close();
          place();
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            place();
            setOpen(true);
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-required={required}
        aria-describedby={error ? `${fieldId}-desc` : undefined}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center gap-2.5 border bg-surface px-3 text-start transition outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
          invalid
            ? "border-danger focus-visible:ring-danger/20"
            : open
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-primary/50 focus-visible:border-primary focus-visible:ring-primary/20",
        )}
      >
        <Clock size={16} strokeWidth={2} aria-hidden className={cn("flex-none", open ? "text-brand" : "text-muted")} />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-semibold tabular-nums",
            parts ? "text-heading" : "font-medium text-muted",
          )}
        >
          {parts ? formatTime12(value) : (placeholder ?? t("timePicker.placeholder"))}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden
          className={cn("flex-none text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {error && (
        <p id={`${fieldId}-desc`} className="text-xs text-danger">
          {error}
        </p>
      )}

      {open &&
        rect &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label={label ?? t("timePicker.placeholder")}
            style={{
              position: "fixed",
              left: Math.min(rect.left, window.innerWidth - width - 12),
              width,
              ...(rect.dropUp ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }),
            }}
            className="z-100 max-w-[calc(100vw-1.5rem)] border border-border bg-card shadow-lg shadow-black/8 dark:shadow-black/40"
          >
            <div className="flex divide-x divide-border rtl:divide-x-reverse">
              <Column
                label={t("timePicker.hour")}
                items={HOURS}
                selected={parts?.h12 ?? null}
                render={(n) => String(n)}
                onPick={(h12) => pick({ h12 })}
              />
              <Column
                label={t("timePicker.minute")}
                items={minutes}
                selected={parts?.minute ?? null}
                render={pad}
                onPick={(minute) => pick({ minute })}
              />
              <div role="radiogroup" aria-label={t("timePicker.period")} className="flex w-16 flex-none flex-col gap-0.5 p-1.5">
                {[false, true].map((pm) => {
                  const on = parts ? parts.pm === pm : false;
                  return (
                    <button
                      key={String(pm)}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => pick({ pm })}
                      className={cn(
                        "h-9 cursor-pointer text-[13px] transition-colors",
                        on ? "bg-primary/10 font-bold text-brand" : "font-medium text-body hover:bg-sunk hover:text-heading",
                      )}
                    >
                      {pm ? "PM" : "AM"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default TimePicker;
