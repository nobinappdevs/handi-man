"use client";

import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { Logo } from "@/components/share/Logo";
import { ThemeToggle } from "@/components/share/ThemeToggle";
import { AUTH_CARD_FACES, AUTH_WEEK } from "@/components/auth/authData";
import authPhoto from "@public/assets/home/aboutus-photo.webp";

/**
 * Shared chrome for every auth screen — login, register, forgot, OTP, reset,
 * 2FA. Two columns: a quiet form column, and a photo panel.
 *
 * ── The two halves follow different rules, on purpose ──
 * The form column is the project's own language: square, token-coloured, flat.
 * Nothing in this file changes that. The panel is built to a supplied
 * reference — an inset rounded photo card with floating furniture on it — so
 * radius lives there and only there. The seam between them is the gutter.
 *
 * ── The panel is sticky, not stretched ──
 * The register form is roughly twice the height of the login form, so on a
 * laptop the page scrolls. A panel that simply stretched with the column would
 * drag its card below the fold on exactly the screen where it does the most
 * work. `sticky` + `self-start` + an explicit viewport height keeps the panel
 * composed however tall the form beside it grows.
 *
 * ── Below 980px ──
 * The panel is `wide:` only; the form takes the whole width, which is the only
 * sane reading of a layout whose right half is decorative. The logo in the
 * form header is the way home there — the panel's close button goes with it.
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
    <main className="flex min-h-svh bg-bg">
      <div className="relative flex min-w-0 flex-1 flex-col px-[clamp(16px,2.8vw,44px)] py-[clamp(18px,2vw,28px)] wide:flex-[0_0_46%]">
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

              {/* Square, like every other flat surface in the form column —
                  the tint and the ring are what make it a badge, not a
                  corner. */}
              {icon && (
                <span className="mb-[clamp(16px,1.8vw,22px)] grid h-12 w-12 flex-none place-items-center bg-brand/10 text-brand ring-1 ring-brand/15">
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
              "h-1 flex-1 transition-colors duration-300",
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

/**
 * The right half, built to the supplied reference: an inset photo card with
 * the product's own furniture floating on it — a booking card at the top, a
 * cluster of faces, a week strip, a second booking card at the foot, and a
 * close button in the corner.
 *
 * ── The furniture is decoration, not UI ──
 * None of it is interactive and none of it claims to be live. The dates are
 * fixed (`AUTH_WEEK` carries the hydration reason), every card is
 * `aria-hidden` so a screen reader is never read a booking that does not
 * exist, and the one real control is the close button, which goes home.
 *
 * ── Contrast ──
 * Every piece of white type sits on its own filled card, never straight on the
 * photograph — except the week strip, which is given a wash of its own for
 * exactly that reason. The photo itself gets only a light top-and-tail
 * gradient to seat the furniture; it is not scrimmed.
 *
 * ── Sizing ──
 * The panel is between roughly 480px and 800px wide in practice, so every
 * piece is a percentage of the card with a `clamp()` floor and ceiling in
 * pixels. Fixed positions alone would collide at the narrow end; percentages
 * alone would make the cards absurd at the wide end.
 */
function BrandPanel() {
  const { t } = useLang();

  return (
    <section
      aria-label={t("auth.aside.label")}
      className="sticky top-0 hidden h-svh min-w-0 flex-1 self-start p-[var(--pad)] [--back:clamp(40px,3.6vw,50px)] [--notch-gap:9px] [--pad:clamp(12px,1.4vw,22px)] wide:block"
    >
      <div className="photo-notch relative h-full w-full overflow-hidden rounded-[clamp(18px,2vw,28px)] bg-surface">
        <Image
          src={authPhoto}
          alt=""
          aria-hidden
          fill
          priority
          sizes="55vw"
          className="object-cover object-center"
        />

        {/* Seats the furniture top and bottom. The cards carry their own
            contrast, so this is a wash, not a scrim. */}
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,15,0.24)_0%,transparent_26%,transparent_60%,rgba(18,16,15,0.32)_100%)]"
        />

        {/* Upper booking card, with a second card peeking out below it — the
            reference's stacked pair. The one behind comes FIRST in the DOM and
            is absolutely placed, so it paints under without a z-index. */}
        <div
          aria-hidden
          className="enter-up absolute start-[7%] top-[6%] w-[clamp(164px,46%,250px)] [--enter-delay:0.14s]"
        >
          <div className="absolute inset-x-[7%] top-[56%] rounded-xl bg-ink/45 px-3 pt-7 pb-2 text-[11px] leading-none font-medium text-white/85 backdrop-blur-sm">
            {t("auth.aside.cards.upcoming.time")}
          </div>
          <div className="relative rounded-xl bg-primary px-3.5 py-3 shadow-[0_18px_36px_-18px_rgba(18,16,15,0.65)]">
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 text-[12.5px] leading-tight font-semibold text-white">
                {t("auth.aside.cards.upcoming.title")}
              </span>
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-primary-on-dark" />
            </div>
            <span className="mt-1.5 block text-[11px] leading-none font-medium text-white/75">
              {t("auth.aside.cards.upcoming.time")}
            </span>
          </div>
        </div>

        {/* The face cluster. Scattered inside a box rather than set in a row:
            a row of circles reads as a stat chip, which is not what the
            reference does with them. */}
        <div
          aria-hidden
          className="enter-fade absolute end-[9%] top-[33%] h-[clamp(96px,16%,136px)] w-[clamp(96px,28%,136px)] [--enter-delay:0.26s]"
        >
          <ClusterFace face={AUTH_CARD_FACES[0]} className="start-0 top-0 h-[48%] w-[48%]" />
          <ClusterFace face={AUTH_CARD_FACES[1]} className="end-0 top-[18%] h-[44%] w-[44%]" />
          <ClusterFace face={AUTH_CARD_FACES[2]} className="start-[10%] bottom-[4%] h-[44%] w-[44%]" />
        </div>

        {/* Week strip, with the reference's hatch block behind its end — the
            one piece of this panel that is pure texture. */}
        <div aria-hidden className="enter-up absolute inset-x-0 top-[53%] [--enter-delay:0.2s]">
          {/* Hatch beyond the last date, not under it: the strip reserves the
              end quarter with `pe-[24%]` so the two never overlap. */}
          <div className="absolute inset-y-[-18%] end-[4%] w-[19%] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.34)_0_1.5px,transparent_1.5px_7px)]" />
          {/* No band. The reference sets these straight on the photograph, so
              legibility comes from weight and a shadow on the glyphs — a
              filled strip across the middle of the image read as a grey bar
              stuck over the picture. */}
          <div className="relative flex items-end justify-between gap-1 ps-[8%] pe-[24%] drop-shadow-[0_2px_6px_rgba(18,16,15,0.75)]">
            {AUTH_WEEK.map((day) => (
              <span key={day.key} className="flex min-w-0 flex-col items-center gap-1.5">
                <span className="truncate text-[10.5px] leading-none font-semibold tracking-[0.04em] text-white/80">
                  {t(day.key)}
                </span>
                <span className="text-[clamp(14px,1.4vw,19px)] leading-none font-bold text-white tabular-nums">
                  {day.date}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Lower booking card: white where the upper one is brand, which is
            the reference's pairing and keeps the foot of the panel light
            against the darker bottom of the photograph. */}
        <div
          aria-hidden
          className="enter-up absolute start-[7%] bottom-[9%] w-[clamp(196px,52%,280px)] rounded-2xl bg-white p-4 shadow-[0_26px_52px_-24px_rgba(18,16,15,0.7)] [--enter-delay:0.32s]"
        >
          <span className="block text-[13px] leading-tight font-bold text-ink">
            {t("auth.aside.cards.today.title")}
          </span>
          <span className="mt-1 block text-[11.5px] leading-none font-medium text-ink/55">
            {t("auth.aside.cards.today.time")}
          </span>
          <div className="mt-3 flex">
            {AUTH_CARD_FACES.map((face, i) => (
              <span
                key={i}
                className="relative -ms-2 h-[26px] w-[26px] overflow-hidden rounded-full ring-2 ring-white first:ms-0"
              >
                <Image src={face} alt="" fill sizes="26px" className="object-cover" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/*
        The close button sits OUTSIDE the card, in the bite taken out of its
        top-end corner — the reference's corner detail, and the reason
        `.photo-notch` exists. Inside the card it would be masked away with
        the corner it stands in, and it would be a button floating on a
        photograph rather than one nested into the page.

        It shares `--back` with the mask, so the bite and the button cannot
        drift apart at any viewport width, and both are anchored to the same
        `--pad` as the card.
      */}
      <Link
        href="/"
        aria-label={t("auth.aside.back")}
        className="enter-fade group absolute end-[var(--pad)] top-[var(--pad)] grid h-[var(--back)] w-[var(--back)] place-items-center rounded-full bg-bg text-heading transition-colors hover:bg-primary hover:text-white"
      >
        <X
          size={18}
          strokeWidth={2.4}
          aria-hidden
          className="transition-transform duration-200 group-hover:rotate-90"
        />
      </Link>
    </section>
  );
}

/** One face in the scattered cluster — a circle with the reference's white ring. */
function ClusterFace({ face, className }: { face: StaticImageData; className: string }) {
  return (
    <span
      className={cn(
        "absolute overflow-hidden rounded-full shadow-[0_10px_22px_-10px_rgba(18,16,15,0.8)] ring-[3px] ring-white/90",
        className,
      )}
    >
      <Image src={face} alt="" fill sizes="64px" className="object-cover" />
    </span>
  );
}
