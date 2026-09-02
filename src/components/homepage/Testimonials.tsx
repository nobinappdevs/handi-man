"use client";

import { MessageSquareQuote, Quote, Star } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { Eyebrow } from "@/components/share/Eyebrow";
import { TESTIMONIAL_COLUMNS } from "@/components/homepage/homeData";
import { cn } from "@/components/ui/cn";

const STARS = [0, 1, 2, 3, 4];

/**
 * A monogram rather than a portrait.
 *
 * Eight more face photos would be eight more full-size files on a page that
 * already ships the team grid — `images.unoptimized` sends every byte of each
 * one to every phone (blueprint §14.1) — and initials taken from the
 * translated name follow the copy into every dictionary. Two letters, because
 * the design's tile is square and three start to crowd it.
 */
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/*
 * The quote sits on `bg-bg`, not `bg-card`, and that is deliberate:
 * the dark theme gives `--card` and `--surface` the same triplet, so a
 * `bg-card` card on this `bg-surface` band disappears into it and only the
 * hairline is left to say where one quote ends. Against the band, `bg-bg` reads
 * as white-on-warm-grey in light and as a darker inset in dark.
 *
 * Accents are `text-brand` rather than `text-primary` for the same reason - the
 * base plum is nearly invisible on a near-black page; `--brand-ink` is the
 * shade that flips with the theme.
 */
function TestimonialCard({ id }: { id: string }) {
  const { t } = useLang();
  const name = t(`home.testimonials.items.${id}.name`);

  return (
    <figure
      className="flex flex-col gap-[clamp(13px,1.4vw,18px)] border border-border bg-bg p-[clamp(19px,2vw,26px)] transition-colors duration-300 hover:border-brand/50"
      data-anim="rise"
    >
      {/* Filled rather than stroked — the design's glyph is a solid mark, and
          lucide's outline reads as an icon next to body copy at this size. */}
      <Quote size={24} strokeWidth={0} fill="currentColor" className="text-brand" aria-hidden />

      <blockquote className="text-[14px] leading-[1.72] text-body">
        {t(`home.testimonials.items.${id}.quote`)}
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 border-t border-border/70 pt-[clamp(13px,1.4vw,17px)]">
        <span className="flex h-10 w-10 flex-none items-center justify-center bg-primary/12 font-display text-[14px] font-bold tracking-[0.06em] text-brand">
          {initials(name)}
        </span>
        <span className="min-w-0">
          <span className="truncate text-[15px] font-extrabold tracking-[-0.01em] text-heading">
            {name}
          </span>
          <span className="mt-0.5 truncate font-display text-[12px] font-bold tracking-[0.09em] text-muted uppercase">
            {t(`home.testimonials.items.${id}.role`)}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const { t } = useLang();
  const scope = useGsapScope();

  return (
    /* No `overflow-hidden` here, and none on any wrapper between this and
       <body>: an `overflow` other than `visible` on ANY ancestor silently
       turns the sticky rail below back into a static block. That rules out the
       blurred corner glows the neighbouring sections use, so the band is a
       flat `bg-surface` instead — which is also the band the quote cards
       need to sit apart from (see the note on TestimonialCard above). */
    <section
      ref={scope}
      className="relative bg-surface px-[clamp(18px,3vw,44px)] py-[clamp(48px,6vw,90px)]"
    >
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-x-[clamp(28px,3.4vw,68px)] gap-y-[clamp(30px,4vw,48px)] wide:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        {/* ── The rail ──────────────────────────────────────────────────
            `items-start` on the grid above is what makes this stick: a grid
            item stretched to the row's full height has no slack to travel in.

            The rail rides in the MIDDLE of the viewport, not against its top.
            That is the `top`/`min-h` pair, not `items-center`: a sticky box
            pins by its own top edge, so the only way to centre what is inside
            it is to give the box a height and centre within that -
            18vh + 64vh/2 lands the content on the 50vh line.

            Why 64vh and not `h-screen`: the pin lasts (column height - box
            height), so a full-viewport box would spend half the section
            un-pinned. `min-h` rather than `h` so a longer translation grows
            the box instead of spilling out of it. */}
        <div className="flex flex-col gap-[clamp(13px,1.5vw,19px)] wide:sticky wide:top-[18vh] wide:min-h-[64vh] wide:justify-center">
          <Eyebrow
            icon={<MessageSquareQuote size={16} strokeWidth={2} aria-hidden />}
            data-anim="up"
          >
            {t("home.testimonials.eyebrow")}
          </Eyebrow>

          <h2
            className="text-[clamp(30px,3.6vw,50px)] leading-[1.04] tracking-[-0.03em] text-balance"
            data-anim-split
          >
            {t("home.testimonials.title")}
          </h2>

          <p
            className="max-w-[44ch] text-[14.5px] leading-[1.65] text-body"
            data-anim="up"
            data-anim-delay="0.15"
          >
            {t("home.testimonials.lead")}
          </p>

          <div
            className="mt-[clamp(4px,0.8vw,12px)] flex flex-wrap items-center gap-x-[clamp(20px,2.6vw,36px)] gap-y-4 border-t border-border pt-[clamp(16px,1.8vw,24px)]"
            data-anim-stagger="up"
            data-anim-gap="0.1"
          >
            <div className="flex flex-col gap-2">
              <div
                className="flex gap-1 text-brand"
                aria-label={`${t("home.testimonials.ratingValue")} ${t("home.testimonials.starsLabel")}`}
              >
                {STARS.map((i) => (
                  <Star key={i} size={15} strokeWidth={0} fill="currentColor" aria-hidden />
                ))}
              </div>
              <span className="font-display text-[12.5px] font-bold tracking-[0.12em] text-muted uppercase">
                {t("home.testimonials.ratingLabel")}
              </span>
            </div>

            <span aria-hidden className="hidden h-9 w-px bg-border mid:block" />

            <div className="flex flex-col gap-1.5">
              <span
                className="text-[clamp(21px,2.1vw,27px)] leading-none font-extrabold tracking-[-0.02em] text-heading"
                data-anim-count
              >
                {t("home.testimonials.reviewCount")}
              </span>
              <span className="font-display text-[12.5px] font-bold tracking-[0.12em] text-muted uppercase">
                {t("home.testimonials.reviewLabel")}
              </span>
            </div>
          </div>
        </div>

        {/* ── The wall that scrolls past it ─────────────────────────────
            Two independent columns, not a two-column grid: a grid would lock
            the cards into rows and every quote is a different length. The
            second column starts lower so the two never line up, which is what
            makes the pass-by read as motion rather than as a table. */}
        <div className="grid grid-cols-1 gap-[clamp(16px,1.8vw,24px)] mid:grid-cols-2">
          {TESTIMONIAL_COLUMNS.map((column, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-[clamp(16px,1.8vw,24px)]",
                i === 1 && "mid:mt-[clamp(26px,5vw,64px)]",
              )}
            >
              {column.map((id) => (
                <TestimonialCard key={id} id={id} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
