"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Check } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { cn } from "@/components/ui/cn";
import { Eyebrow } from "@/components/share/Eyebrow";
import {
  CATALOGUE,
  CARD_PHOTOS,
  sectionId,
  type CatalogueCard,
} from "@/components/services/servicesData";

/**
 * One catalogue card — the SAME card as `homepage/CategoryListings`: numbered
 * plum spine with the tag set vertically, art, then title over price and unit.
 * Changing one without the other is how the two pages start to look like two
 * products.
 *
 * The one addition is the art slot. Where `CARD_PHOTOS` has no entry the card
 * shows its own icon on a brand-tinted panel instead of a photo, at the same
 * 1.42 aspect — so a section with no photography yet keeps the grid's rhythm
 * rather than collapsing to a different card height.
 */
function Card({ card, index }: { card: CatalogueCard; index: number }) {
  const { t } = useLang();
  const photo = CARD_PHOTOS[card.key];
  const Icon = card.icon;
  const ns = card.copyNs ?? "servicesPage.items";

  return (
    <Link
      href={`/services?service=${card.key}`}
      className="grid min-w-0 grid-cols-[clamp(34px,3.2vw,42px)_minmax(0,1fr)] border border-border bg-bg transition-[border-color,box-shadow] duration-200 hover:border-primary hover:shadow-[0_30px_56px_-34px_rgba(18,16,15,0.45)]"
    >
      <div className="flex flex-col items-center justify-between bg-primary py-3.5">
        <span className="font-display text-xs font-bold tracking-[0.16em] text-white/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rotate-180 font-display text-[11.5px] font-bold tracking-[0.22em] text-white uppercase [writing-mode:vertical-rl]">
          {card.tag}
        </span>
        <span className="flex h-[22px] w-[22px] items-center justify-center text-white">
          <ArrowRight size={15} strokeWidth={2.6} aria-hidden />
        </span>
      </div>

      <div className="flex min-w-0 flex-col">
        {/* `bg-form` only when a photo covers it. It is the home card's
            placeholder colour and is theme-INVARIANT light by design (form
            fields must not flip) — fine under a photo that always hides it,
            a glaring white block behind an icon on the dark page. */}
        <div className={cn("relative aspect-[1.42] overflow-hidden", photo ? "bg-form" : "bg-surface")}>
          {photo ? (
            <Image
              src={photo}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 700px) 100vw, (max-width: 980px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center bg-brand/12 text-brand">
              <Icon size={40} strokeWidth={1.4} aria-hidden />
            </span>
          )}
          <span className="absolute bottom-0 left-0 bg-[rgba(18,16,15,0.86)] px-[11px] py-1.5 font-display text-[11px] font-bold tracking-[0.15em] text-white uppercase">
            {card.vendor}
          </span>
        </div>

        <div className="flex flex-col gap-3.5 p-[clamp(15px,1.6vw,20px)]">
          <h3 className="text-[clamp(15.5px,1.5vw,17.5px)] leading-[1.26] font-extrabold tracking-[-0.02em] text-pretty">
            {t(`${ns}.${card.key}.title`)}
          </h3>
          <div className="flex items-end justify-between gap-3 pr-[clamp(46px,4.6vw,56px)]">
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
                {t("home.categoryGroups.startsAt")}
              </span>
              <span className="text-[clamp(19px,2vw,24px)] leading-none font-black tracking-[-0.03em] text-brand">
                {card.price}
              </span>
            </span>
            <span className="flex items-center gap-1.5 pb-0.5 font-display text-xs font-bold tracking-[0.12em] text-muted uppercase">
              <Clock size={13} strokeWidth={2.2} aria-hidden />
              {t(`${ns}.${card.key}.unit`)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ServiceCatalogue() {
  const { t } = useLang();
  const scope = useGsapScope();

  return (
    <div ref={scope} className="bg-page px-[clamp(18px,3vw,44px)] pt-[clamp(34px,4vw,60px)] pb-[clamp(48px,6vw,96px)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(48px,6vw,88px)]">
        {CATALOGUE.map((cat) => (
          <section
            key={cat.key}
            /* The rail is 56px of sticky chrome; without this the anchor jump
               parks each heading underneath it. */
            id={sectionId(cat.key)}
            className="flex scroll-mt-[72px] flex-col gap-[clamp(24px,2.8vw,36px)]"
          >
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Eyebrow
                  icon={
                    <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
                      {cat.icon}
                    </span>
                  }
                  data-anim="up"
                >
                  {t("servicesPage.category")}
                </Eyebrow>
                <h2 className="text-[clamp(24px,2.6vw,36px)] leading-[1.06]" data-anim-split>
                  {t(cat.nameKey)}
                </h2>
              </div>
              <Link
                href="/contact"
                className="flex items-center gap-2 font-display text-[13.5px] font-bold tracking-[0.14em] text-brand uppercase"
                data-anim="right"
                data-anim-delay="0.12"
              >
                {t("servicesPage.requestQuote")}
                <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
              </Link>
            </div>

            <div
              className="grid grid-cols-1 gap-[clamp(20px,2.2vw,30px)] mid:grid-cols-2 wide:grid-cols-4"
              data-anim-stagger="rise"
              data-anim-gap="0.09"
            >
              {cat.cards.map((card, i) => (
                <Card key={card.key} card={card} index={i} />
              ))}
            </div>

            {/* ── "All X services" ── the old catalogue's text list under each
                grid: everything in the category, not just the four featured. */}
            <div className="flex flex-col gap-[clamp(12px,1.4vw,16px)]">
              <h4 className="font-display text-[clamp(14px,1.3vw,16px)] font-bold tracking-[0.14em] text-muted uppercase">
                {t("servicesPage.allOf")} {t(cat.nameKey)} {t("servicesPage.services")}
              </h4>
              <ul
                className="grid grid-cols-1 gap-x-[clamp(16px,2vw,28px)] gap-y-2 mid:grid-cols-2 wide:grid-cols-3"
                data-anim-stagger="up"
                data-anim-gap="0.05"
              >
                {cat.list.map((key) => (
                  <li key={key}>
                    <Link
                      href={`/services?service=${key}`}
                      className="flex w-full items-center gap-3 border border-border bg-surface px-4 py-3 text-[clamp(13px,1.3vw,15px)] font-medium text-heading transition-colors hover:border-primary hover:bg-card hover:text-brand"
                    >
                      <span className="flex h-5 w-5 flex-none items-center justify-center bg-brand/14 text-brand">
                        <Check size={12} strokeWidth={3} aria-hidden />
                      </span>
                      <span className="min-w-0 truncate">
                        {t(`servicesPage.lists.${cat.key}.${key}`)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
