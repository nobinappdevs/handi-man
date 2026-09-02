"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { LISTING_TABS } from "@/components/homepage/homeData";
import { cn } from "@/components/ui/cn";
import servicePhoto from "@public/assets/home/oneinall.webp";

/**
 * Tabbed "Popular services" grid — no eyebrow/heading in the design, the tabs
 * themselves carry the section title.
 */
export function Listings() {
  const { t } = useLang();
  const [tab, setTab] = useState(LISTING_TABS[0].key);

  /*
   * Two scopes, because the section has two lifetimes. The header is mounted
   * once and reveals once; the grid is thrown away and rebuilt on every tab
   * change, and its fresh cards start hidden under the `.anim-ready` rule. The
   * `tab` reset key is what re-runs the stagger over them - without it the
   * second tab you click would be a blank grid.
   */
  const header = useGsapScope();
  const grid = useGsapScope<HTMLDivElement>(undefined, tab);
  const active = LISTING_TABS.find((group) => group.key === tab) ?? LISTING_TABS[0];

  return (
    <section
      ref={header}
      className="brand-wash relative [--wash-angle:152deg] [--wash-strength:13%] px-[clamp(18px,3vw,44px)] py-[clamp(40px,4.6vw,72px)]"
    >
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(22px,2.6vw,34px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-border">
          <div
            className="flex min-w-0 items-end gap-[clamp(18px,2.4vw,34px)]"
            data-anim-stagger="down"
            data-anim-gap="0.08"
          >
            {LISTING_TABS.map((group) => {
              const on = group.key === tab;
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setTab(group.key)}
                  className={cn(
                    "flex items-baseline gap-2 border-b-2 pb-3.5 transition-colors",
                    on ? "border-primary" : "border-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "text-[clamp(19px,2.1vw,27px)] font-black tracking-[-0.03em]",
                      on ? "text-heading" : "text-muted",
                    )}
                  >
                    {t(`home.listings.tabs.${group.key}`)}
                  </span>
                  <span
                    className={cn(
                      "font-display text-xs font-bold tracking-[0.12em]",
                      on ? "text-brand" : "text-muted",
                    )}
                  >
                    {String(group.cards.length).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <a
            href="/services"
            className="flex items-center gap-2 pb-3.5 font-display text-[13.5px] font-bold uppercase tracking-[0.14em] text-brand"
            data-anim="right"
            data-anim-delay="0.15"
          >
            {t("home.listings.viewAll")}
            <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
          </a>
        </div>

        <div
          ref={grid}
          className="grid grid-cols-1 gap-[clamp(18px,2vw,26px)] mid:grid-cols-2 wide:grid-cols-4"
          data-anim-stagger="rise"
          data-anim-gap="0.09"
        >
          {active.cards.map((card) => (
            <a
              key={card.key}
              href="/services"
              className="flex min-w-0 flex-col border border-border bg-bg transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-primary"
            >
              <div className="relative aspect-[1.34]">
                <Image
                  src={servicePhoto}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 700px) 100vw, (max-width: 980px) 50vw, 25vw"
                  className="object-cover"
                />
                <span className="absolute top-0 left-0 bg-primary px-[11px] py-1.5 font-display text-[11.5px] font-bold uppercase tracking-[0.14em] text-white">
                  {card.vendor}
                </span>
              </div>

              <div className="flex flex-col gap-3 p-[clamp(15px,1.6vw,20px)]">
                <h3 className="text-[clamp(15.5px,1.5vw,17.5px)] leading-[1.3] font-extrabold tracking-[-0.02em] text-pretty">
                  {t(`home.listings.items.${card.key}.title`)}
                </h3>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="flex items-center gap-1.5 font-display text-[12.5px] font-bold uppercase tracking-[0.1em] text-muted">
                    <Clock size={13} strokeWidth={2.2} aria-hidden />
                    {t(`home.listings.items.${card.key}.unit`)}
                  </span>
                  <span className="text-[clamp(16px,1.6vw,19px)] font-black tracking-[-0.03em] text-brand">
                    {card.price}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
