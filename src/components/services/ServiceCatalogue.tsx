"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, ImageOff } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { categoryAnchor, type Catalogue, type CatalogueService } from "@/hooks/useCatalogue";
import { Eyebrow } from "@/components/share/Eyebrow";
import { money } from "@/lib/money";
import { SERVICE_ROUTES } from "@/lib/serviceRoutes";

/** How many services a category shows as cards before the full list. */
const FEATURED = 4;

function Photo({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-brand/12 text-brand">
        <ImageOff size={34} strokeWidth={1.4} aria-hidden />
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
 * One catalogue card - the home page's category-rail card: a numbered plum
 * spine with the category set vertically, the photo, then the name over the
 * price and the unit.
 */
function Card({
  service,
  index,
  tag,
  currency,
}: {
  service: CatalogueService;
  index: number;
  tag: string;
  currency: string;
}) {
  const { t } = useLang();
  return (
    <Link
      href={SERVICE_ROUTES.details(service.id)}
      className="group grid min-w-0 grid-cols-[clamp(34px,3.2vw,42px)_minmax(0,1fr)] border border-border bg-bg transition-[border-color,box-shadow] duration-200 hover:border-primary hover:shadow-[0_30px_56px_-34px_rgba(18,16,15,0.45)]"
    >
      <div className="flex flex-col items-center justify-between bg-primary py-3.5">
        <span className="font-display text-xs font-bold tracking-[0.16em] text-white/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="max-h-[120px] truncate rotate-180 font-display text-[11.5px] font-bold tracking-[0.22em] text-white uppercase [writing-mode:vertical-rl]">
          {tag}
        </span>
        <span className="flex h-[22px] w-[22px] items-center justify-center text-white">
          <ArrowRight size={15} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
        </span>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="relative aspect-[1.42] overflow-hidden bg-surface">
          <Photo src={service.image} />
          {service.vendorId > 0 && (
            <span className="absolute bottom-0 start-0 bg-[rgba(18,16,15,0.86)] px-[11px] py-1.5 font-display text-[11px] font-bold tracking-[0.15em] text-white uppercase">
              {t("servicesPage.vendor")} {service.vendorId}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3.5 p-[clamp(15px,1.6vw,20px)]">
          <h3
            title={service.name}
            className="line-clamp-2 text-[clamp(15.5px,1.5vw,17.5px)] leading-[1.26] font-extrabold tracking-[-0.02em] text-pretty"
          >
            {service.name}
          </h3>
          <div className="mt-auto flex items-end justify-between gap-3">
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-display text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
                {t("home.categoryGroups.startsAt")}
              </span>
              <span className="text-[clamp(19px,2vw,24px)] leading-none font-black tracking-[-0.03em] whitespace-nowrap text-brand">
                {money(service.price, currency)}
              </span>
            </span>
            {service.item && (
              <span className="flex min-w-0 items-center gap-1.5 pb-0.5 font-display text-xs font-bold tracking-[0.12em] whitespace-nowrap text-muted uppercase">
                <Clock size={13} strokeWidth={2.2} aria-hidden className="shrink-0" />
                <span className="inline truncate">{service.item}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/** The catalogue's outline while `/services` loads. */
export function CatalogueSkeleton() {
  return (
    <div aria-hidden className="bg-page px-[clamp(18px,3vw,44px)] pt-[clamp(34px,4vw,60px)] pb-[clamp(48px,6vw,96px)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(48px,6vw,88px)]">
        {[0, 1].map((s) => (
          <div key={s} className="flex flex-col gap-[clamp(24px,2.8vw,36px)]">
            <span className="flex flex-col gap-2">
              <span className="h-3 w-24 animate-pulse bg-border" />
              <span className="h-8 w-48 animate-pulse bg-border" />
            </span>
            <div className="grid grid-cols-1 gap-[clamp(20px,2.2vw,30px)] mid:grid-cols-2 wide:grid-cols-4">
              {Array.from({ length: FEATURED }, (_, i) => (
                <div key={i} className="grid grid-cols-[clamp(34px,3.2vw,42px)_minmax(0,1fr)] border border-border bg-bg">
                  <span className="animate-pulse bg-border" />
                  <span className="flex flex-col">
                    <span className="aspect-[1.42] animate-pulse bg-border/70" />
                    <span className="flex flex-col gap-3 p-[clamp(15px,1.6vw,20px)]">
                      <span className="h-4 w-4/5 animate-pulse bg-border" />
                      <span className="h-6 w-1/2 animate-pulse bg-border" />
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Every category from `GET /services`: its first four services as cards over
 * the full "All X services" list - the shape of the old catalogue. Each
 * section carries `#cat-<slug>`, which the rail jumps to.
 */
export function ServiceCatalogue({ catalogue }: { catalogue: Catalogue }) {
  const { t } = useLang();
  /* Reset on the data: the sections mount once it has landed, and the scope
     must run over them or they stay hidden under `.anim-ready`. */
  const scope = useGsapScope(undefined, catalogue.serviceCount);

  return (
    <div ref={scope} className="bg-page px-[clamp(18px,3vw,44px)] pt-[clamp(34px,4vw,60px)] pb-[clamp(48px,6vw,96px)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(48px,6vw,88px)]">
        {catalogue.categories.map((cat) => (
          <section
            key={cat.id}
            /* The rail is 56px of sticky chrome; without this the anchor jump
               parks each heading underneath it. */
            id={categoryAnchor(cat.slug)}
            className="flex scroll-mt-[72px] flex-col gap-[clamp(24px,2.8vw,36px)]"
          >
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Eyebrow data-anim="up">{t("servicesPage.category")}</Eyebrow>
                <h2 className="text-[clamp(24px,2.6vw,36px)] leading-[1.06]" data-anim-split>
                  {cat.name}
                </h2>
              </div>
              <Link
                href="/contact"
                className="flex items-center gap-2 font-display text-[13.5px] font-bold tracking-[0.14em] text-brand uppercase"
                data-anim="right"
                data-anim-delay="0.12"
              >
                {t("servicesPage.requestQuote")}
                <ArrowRight size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
              </Link>
            </div>

            <div
              className="grid grid-cols-1 gap-[clamp(20px,2.2vw,30px)] mid:grid-cols-2 wide:grid-cols-4"
              data-anim-stagger="rise"
              data-anim-gap="0.09"
            >
              {cat.services.slice(0, FEATURED).map((service, i) => (
                <Card key={service.id} service={service} index={i} tag={cat.name} currency={catalogue.currency} />
              ))}
            </div>

            {/* ── "All X services" ── everything in the category, the four
                featured included, as the old catalogue listed it. */}
            <div className="flex flex-col gap-[clamp(12px,1.4vw,16px)]">
              <h4 className="font-display text-[clamp(14px,1.3vw,16px)] font-bold tracking-[0.14em] text-muted uppercase">
                {t("servicesPage.allOf")} {cat.name} {t("servicesPage.services")}
              </h4>
              <ul
                className="grid grid-cols-1 gap-x-[clamp(16px,2vw,28px)] gap-y-2 mid:grid-cols-2 wide:grid-cols-3"
                data-anim-stagger="up"
                data-anim-gap="0.05"
              >
                {cat.services.map((service) => (
                  <li key={service.id}>
                    <Link
                      href={SERVICE_ROUTES.details(service.id)}
                      className="flex w-full items-center gap-3 border border-border bg-surface px-4 py-3 text-[clamp(13px,1.3vw,15px)] font-medium text-heading transition-colors hover:border-primary hover:bg-card hover:text-brand"
                    >
                    <span className="flex h-5 w-5 flex-none items-center justify-center bg-brand/14 text-brand">
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 truncate" title={service.name}>
                      {service.name}
                    </span>
                    <span className="flex-none text-[13px] font-bold text-brand tabular-nums">
                      {money(service.price, catalogue.currency)}
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
