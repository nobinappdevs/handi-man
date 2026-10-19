"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, ImageOff } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { useHomeContent, type HomeService } from "@/hooks/useHomeContent";
import { cn } from "@/components/ui/cn";
import { money } from "@/lib/money";
import { SERVICE_ROUTES } from "@/lib/serviceRoutes";

const TABS = ["recommended", "trending"] as const;
type Tab = (typeof TABS)[number];

/** The card's photo, or a quiet placeholder when the file is missing or fails. */
function Photo({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-brand/10 text-brand">
        <ImageOff size={28} strokeWidth={1.4} aria-hidden />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
    />
  );
}

/**
 * Tabbed "Popular services" grid — no eyebrow/heading in the design, the tabs
 * themselves carry the section title.
 *
 * The cards are the admin's recommended and trending services
 * (`GET /global/index`); the tab names are the site's own copy. The corner
 * badge is the service's category - the payload has no vendor name to show.
 */
export function Listings() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("recommended");
  const { data, isLoading } = useHomeContent();
  const lists: Record<Tab, HomeService[]> = {
    recommended: data?.recommended ?? [],
    trending: data?.trending ?? [],
  };
  const cards = lists[tab];
  const currency = data?.currency ?? "";

  /*
   * Two scopes, because the section has two lifetimes. The header is mounted
   * once and reveals once; the grid is rebuilt on every tab change AND when
   * the data lands, and fresh cards start hidden under the `.anim-ready` rule.
   * The reset key is what re-runs the stagger over them.
   */
  const header = useGsapScope();
  const grid = useGsapScope<HTMLDivElement>(undefined, `${tab}-${isLoading ? "loading" : cards.length}`);

  return (
    <section
      ref={header}
      className="bg-page relative px-[clamp(18px,3vw,44px)] py-[clamp(40px,4.6vw,72px)]"
    >
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(22px,2.6vw,34px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-border">
          <div
            className="flex min-w-0 items-end gap-[clamp(18px,2.4vw,34px)]"
            data-anim-stagger="down"
            data-anim-gap="0.08"
          >
            {TABS.map((key) => {
              const on = key === tab;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-pressed={on}
                  className={cn(
                    "flex cursor-pointer items-baseline gap-2 border-b-2 pb-3.5 transition-colors",
                    on ? "border-primary" : "border-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "text-[clamp(19px,2.1vw,27px)] font-black tracking-[-0.03em]",
                      on ? "text-heading" : "text-muted",
                    )}
                  >
                    {t(`home.listings.tabs.${key}`)}
                  </span>
                  <span
                    className={cn(
                      "font-display text-xs font-bold tracking-[0.12em]",
                      on ? "text-brand" : "text-muted",
                    )}
                  >
                    {isLoading ? "··" : String(lists[key].length).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <Link
            href="/services"
            className="flex items-center gap-2 pb-3.5 font-display text-[13.5px] font-bold uppercase tracking-[0.14em] text-brand"
            data-anim="right"
            data-anim-delay="0.15"
          >
            {t("home.listings.viewAll")}
            <ArrowRight size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
          </Link>
        </div>

        <div
          ref={grid}
          className="grid grid-cols-1 gap-[clamp(18px,2vw,26px)] mid:grid-cols-2 wide:grid-cols-4"
          data-anim-stagger="rise"
          data-anim-gap="0.09"
        >
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} aria-hidden className="flex min-w-0 flex-col border border-border bg-bg">
                  <div className="aspect-[1.34] animate-pulse bg-border" />
                  <div className="flex flex-col gap-3 p-[clamp(15px,1.6vw,20px)]">
                    <span className="h-4 w-4/5 animate-pulse bg-border" />
                    <span className="h-4 w-3/5 animate-pulse bg-border" />
                    <span className="mt-1 flex justify-between border-t border-border pt-3">
                      <span className="h-3 w-16 animate-pulse bg-border" />
                      <span className="h-4 w-14 animate-pulse bg-border" />
                    </span>
                  </div>
                </div>
              ))
            : cards.map((card) => (
                <Link
                  key={card.id}
                  href={SERVICE_ROUTES.details(card.id)}
                  className="group flex min-w-0 flex-col border border-border bg-bg transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-primary"
                >
                  <div className="relative aspect-[1.34] overflow-hidden bg-sunk">
                    <Photo src={card.image} />
                    {card.category && (
                      <span className="absolute top-0 start-0 bg-primary px-[11px] py-1.5 font-display text-[11.5px] font-bold uppercase tracking-[0.14em] text-white">
                        {card.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-[clamp(15px,1.6vw,20px)]">
                    <h3
                      title={card.name}
                      className="line-clamp-2 text-[clamp(15.5px,1.5vw,17.5px)] leading-[1.3] font-extrabold tracking-[-0.02em] text-pretty"
                    >
                      {card.name}
                    </h3>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
                      <span className="flex items-center gap-1.5 font-display text-[12.5px] font-bold uppercase tracking-[0.1em] text-muted">
                        <Clock size={13} strokeWidth={2.2} aria-hidden />
                        {card.item}
                      </span>
                      <span className="text-[clamp(16px,1.6vw,19px)] font-black tracking-[-0.03em] text-brand">
                        {money(card.price, currency)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {!isLoading && cards.length === 0 && (
          <p className="text-center text-[14px] text-muted">{t("home.listings.empty")}</p>
        )}
      </div>
    </section>
  );
}
