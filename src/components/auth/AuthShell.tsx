"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { Logo } from "@/components/share/Logo";
import { ThemeToggle } from "@/components/share/ThemeToggle";
import {
  AUTH_PANEL_STATS,
  AUTH_QUOTE_INTERVAL,
  AUTH_QUOTE_KEYS,
} from "@/components/auth/authData";
import authPhoto from "@public/assets/home/contact-photo.webp";

/**
 * Shared chrome for every auth screen — login, register, forgot, OTP, reset,
 * 2FA. Two columns: a quiet form column, and a brand panel that carries the
 * argument for signing up at all.
 *
 * ── The panel is sticky, not stretched ──
 * The register form is roughly twice the height of the login form, so on a
 * laptop the page scrolls. A panel that simply stretched with the column would
 * drag its quote card and stats below the fold on exactly the screen where they
 * do the most work. `sticky` + `self-start` + an explicit viewport height keeps
 * the panel composed however tall the form beside it grows.
 *
 * ── The notch ──
 * The photo card fills the panel, but its top-left is bitten out by a circle so
 * the back button nests into the card with an even channel around it — a
 * CONCAVE corner, which is why it is a mask (`.photo-notch` in globals.css) and
 * not a `border-radius`. Button and bite are both sized off `--back`, so they
 * cannot drift apart as the button scales.
 *
 * ── The scrim ──
 * Not decoration. Everything on the panel is white, and white on a photograph
 * is a contrast bug somewhere in every photograph. The plum ramp is
 * bottom-heavy: the quote card and stats sit on near-solid brand while the top
 * of the frame still reads as a photo.
 *
 * ── Below 980px ──
 * The panel is `wide:` only; the form takes the whole width, which is the only
 * sane reading of a layout whose right half is decorative. The logo is the way
 * home there — the notched back button belongs to the panel and goes with it.
 *
 * Entrances are the CSS `enter-*` classes, never GSAP: this is above the fold on
 * every one of these screens, and a GSAP reveal waits for hydration.
 */
export function AuthShell({
  icon,
  title,
  subtitle,
  step,
  children,
  footer,
}: {
  /** Small brand-tinted badge above the title — gives each step its own face. */
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Progress through the forgot → code → new password flow. */
  step?: { current: number; total: number };
  /** The form. */
  children: ReactNode;
  /** Link row pinned to the foot of the form column. */
  footer?: ReactNode;
}) {
  const { t } = useLang();

  return (
    <main className="flex min-h-svh bg-bg p-[var(--pad)] [--pad:clamp(10px,1.2vw,18px)]">
      <div className="relative flex min-w-0 flex-1 flex-col px-[clamp(16px,2.6vw,40px)] py-[clamp(18px,2vw,28px)] wide:flex-[0_0_46%]">
        <header className="flex flex-none items-center justify-between gap-3">
          <Link href="/" aria-label={t("auth.aside.back")} className="min-w-0">
            <Logo />
          </Link>
          <ThemeToggle size={40} />
        </header>

        <div className="flex flex-1 items-center justify-center py-[clamp(28px,4vw,56px)]">
          <div className="w-full max-w-[404px]">
            <div className="enter-up flex flex-col">
              {step && <StepMeter {...step} />}

              {icon && (
                <span className="mb-[clamp(16px,1.8vw,22px)] grid h-12 w-12 flex-none place-items-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/15">
                  {icon}
                </span>
              )}

              {/* Deliberately off the base `h1` ramp: that one is tuned for a
                  full-bleed marketing headline and reaches 55px, which in a
                  404px column wraps "Create your account" onto three lines. */}
              <h1 className="text-[clamp(24px,2.2vw,31px)] leading-[1.15] tracking-[-0.03em]">
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-[15px] leading-[1.5] text-muted">{subtitle}</p>}
            </div>

            <div className="enter-up mt-[clamp(24px,2.6vw,34px)] [--enter-delay:0.09s]">
              {children}
            </div>
          </div>
        </div>

        {footer && <div className="enter-fade flex-none [--enter-delay:0.18s]">{footer}</div>}
      </div>

      <BrandPanel />
    </main>
  );
}

/* ─────────────────────────── Form column pieces ─────────────────────────── */

/** Segments plus a count, for the three-screen password reset. */
function StepMeter({ current, total }: { current: number; total: number }) {
  const { t } = useLang();

  return (
    <div className="mb-[clamp(18px,2vw,26px)] flex items-center gap-3">
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < current ? "bg-brand" : "bg-border",
            )}
          />
        ))}
      </div>
      <span className="flex-none text-[12px] font-semibold tracking-wide text-muted tabular-nums">
        {t("auth.step")} {current}/{total}
      </span>
    </div>
  );
}

/* ─────────────────────────── Brand panel ─────────────────────────── */

function BrandPanel() {
  const { t } = useLang();
  const [quote, setQuote] = useState(0);
  const [paused, setPaused] = useState(false);

  const step = (dir: 1 | -1) =>
    setQuote((i) => (i + dir + AUTH_QUOTE_KEYS.length) % AUTH_QUOTE_KEYS.length);

  // `quote` is a dependency on purpose: stepping by hand restarts the dwell
  // rather than leaving the next auto-advance a few hundred ms away.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => step(1), AUTH_QUOTE_INTERVAL);
    return () => clearTimeout(id);
  }, [paused, quote]);

  const active = AUTH_QUOTE_KEYS[quote];

  return (
    <section
      aria-label={t("auth.aside.label")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="sticky top-[var(--pad)] hidden h-[calc(100svh_-_var(--pad)_*_2)] min-w-0 flex-1 self-start [--back:clamp(56px,5.4vw,76px)] [--notch-gap:10px] wide:block"
    >
      <div className="photo-notch absolute inset-0 overflow-hidden rounded-[clamp(24px,2.4vw,34px)] bg-surface">
        <Image
          src={authPhoto}
          alt=""
          aria-hidden
          fill
          priority
          sizes="55vw"
          className="object-cover object-[36%_center]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-primary/95 via-primary/50 to-primary/10"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-linear-to-br from-ink/50 via-transparent to-transparent"
        />
      </div>

      {/* Sits in the bite, so it reads against the page rather than the photo —
          hence `bg-surface` and not a glass fill. */}
      <Link
        href="/"
        aria-label={t("auth.aside.back")}
        className="group absolute top-0 left-0 flex h-[var(--back)] w-[var(--back)] items-center justify-center rounded-full bg-surface text-heading transition-colors hover:bg-primary hover:text-white"
      >
        <ArrowLeft
          size={20}
          strokeWidth={2.2}
          aria-hidden
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </Link>

      {/* Balances the notch across the top of the frame. */}
      <div className="absolute top-[clamp(16px,1.8vw,26px)] right-[clamp(16px,1.8vw,26px)] flex items-center gap-2 rounded-full border border-white/25 bg-white/15 py-2 pr-4 pl-3 backdrop-blur-lg">
        <ShieldCheck size={15} strokeWidth={2.4} className="flex-none text-white" aria-hidden />
        <span className="inline text-[12.5px] font-semibold text-white">
          {t("auth.aside.badge")}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col p-[clamp(16px,1.8vw,26px)]">
        <h2 className="max-w-[19ch] text-[clamp(22px,2.25vw,32px)] leading-[1.12] tracking-[-0.03em] text-white">
          {t("auth.aside.claim")}
        </h2>

        {/* `items-stretch` + `justify-between` spreads the two arrows to the
            quote card's own top and bottom edges — a fixed gap would leave them
            clustered in the middle. */}
        <div className="mt-[clamp(16px,1.8vw,24px)] flex items-stretch gap-3">
          {/* Keyed on the quote so the fade replays on every change: the
              re-mount IS the animation — no library, no transition state. */}
          <figure
            key={active}
            className="enter-fade min-w-0 flex-1 rounded-2xl border border-white/25 bg-white/15 p-[clamp(14px,1.5vw,18px)] backdrop-blur-lg"
          >
            <blockquote className="text-[clamp(13px,1.15vw,15px)] leading-[1.5] text-white">
              {t("auth.aside.quotes." + active + ".quote")}
            </blockquote>
            <figcaption className="mt-3 min-w-0">
              <span className="truncate text-[14px] leading-tight font-bold text-white">
                {t("auth.aside.quotes." + active + ".name")}
              </span>
              <span className="mt-0.5 truncate text-[12.5px] leading-snug text-white/70">
                {t("auth.aside.quotes." + active + ".role")}
              </span>
            </figcaption>
          </figure>

          <div className="flex flex-none flex-col justify-between">
            <QuoteButton onClick={() => step(1)} label={t("auth.aside.next")}>
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
            </QuoteButton>
            <QuoteButton onClick={() => step(-1)} label={t("auth.aside.prev")}>
              <ArrowLeft size={16} strokeWidth={2.2} aria-hidden />
            </QuoteButton>
          </div>
        </div>

        <div className="mt-[clamp(14px,1.5vw,18px)] flex items-center gap-1.5">
          {AUTH_QUOTE_KEYS.map((key, i) => (
            <button
              key={key}
              type="button"
              onClick={() => setQuote(i)}
              aria-label={t("auth.aside.showQuote") + " " + (i + 1)}
              aria-current={i === quote || undefined}
              className={cn(
                "h-1.5 cursor-pointer rounded-full transition-all duration-300",
                i === quote ? "w-7 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>

        <div className="mt-[clamp(16px,1.8vw,22px)] flex flex-wrap items-start gap-x-[clamp(18px,2.2vw,34px)] gap-y-3 border-t border-white/20 pt-[clamp(14px,1.5vw,20px)]">
          {AUTH_PANEL_STATS.map((stat) => (
            <div key={stat.labelKey} className="min-w-0">
              <span className="text-[clamp(17px,1.6vw,21px)] leading-none font-black text-white">
                {stat.value}
              </span>
              <span className="mt-1.5 text-[12px] leading-none text-white/65">
                {t(stat.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Glass circle on the photo — the panel's own prev/next. */
function QuoteButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/18 text-white backdrop-blur-lg transition-colors hover:bg-white/35"
    >
      {children}
    </button>
  );
}
