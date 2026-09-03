"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { CATALOGUE } from "@/components/services/servicesData";
import { CategoryRail } from "@/components/services/CategoryRail";
import { ServiceCatalogue } from "@/components/services/ServiceCatalogue";

/**
 * The `/services` screen: page head, sticky category rail, then one block per
 * category — featured cards over the full "all services" list, which is the
 * shape of the old catalogue.
 *
 * No GSAP above the fold. The head uses the CSS `enter-*` classes so it paints
 * with the document (blueprint §6.5); the catalogue below the rail is where
 * the scroll reveals start.
 */
export function ServicesScreen() {
  const { t } = useLang();

  const totalServices = CATALOGUE.reduce((n, c) => n + c.cards.length + c.list.length, 0);

  return (
    <>
      <section className="bg-page border-b border-border px-[clamp(18px,3vw,44px)] pt-[clamp(34px,4.5vw,66px)] pb-[clamp(30px,3.6vw,52px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="enter-group flex min-w-0 max-w-[620px] flex-col gap-3">
            <Eyebrow>{t("servicesPage.eyebrow")}</Eyebrow>
            {/* `enter-rise` — transform only. This is the LCP element on the
                page and a fade here costs seconds of it. */}
            <h1 className="enter-rise text-balance [--enter-delay:0.08s]">
              {t("servicesPage.title")}
            </h1>
            <p className="max-w-[54ch]">{t("servicesPage.lead")}</p>
          </div>

          {/* NOT `flex-none`. It refuses to shrink, so on a phone this row keeps
              its full content width and pushes the page sideways past the
              section padding. It already wraps onto its own line below `mid`;
              let it shrink there too. */}
          <div className="enter-fade flex min-w-0 flex-wrap items-center gap-x-8 gap-y-4 [--enter-delay:0.24s]">
            <span className="flex flex-col gap-1">
              <span className="text-[clamp(26px,2.6vw,34px)] leading-none font-black tracking-[-0.03em] text-brand">
                {totalServices}+
              </span>
              <span className="font-display text-[12px] font-bold tracking-[0.14em] text-muted uppercase">
                {t("servicesPage.stats.services")}
              </span>
            </span>
            <span aria-hidden className="hidden h-10 w-px bg-border mid:block" />
            <span className="flex flex-col gap-1">
              <span className="text-[clamp(26px,2.6vw,34px)] leading-none font-black tracking-[-0.03em] text-brand">
                {CATALOGUE.length}
              </span>
              <span className="font-display text-[12px] font-bold tracking-[0.14em] text-muted uppercase">
                {t("servicesPage.stats.categories")}
              </span>
            </span>
            <Link
              href="/contact"
              className="flex h-12 flex-none items-center gap-2.5 bg-primary px-6 font-display text-[14.5px] font-bold tracking-[0.13em] whitespace-nowrap text-white uppercase transition-colors hover:bg-primary-dark"
            >
              {t("servicesPage.cta")}
              <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <CategoryRail />
      <ServiceCatalogue />

      {/* ── Nothing matched ── the old catalogue ended on a contact prompt and
          so does this, rather than the page just stopping. */}
      <section className="bg-page px-[clamp(18px,3vw,44px)] pb-[clamp(48px,6vw,90px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-8 gap-y-5 bg-ink p-[clamp(24px,3vw,44px)]">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="flex items-center gap-2.5 font-display text-[12.5px] font-bold tracking-[0.14em] text-primary-on-dark uppercase">
              <Search size={15} strokeWidth={2.4} aria-hidden />
              {t("servicesPage.missing.eyebrow")}
            </span>
            <span className="text-[clamp(20px,2.2vw,28px)] leading-[1.15] font-bold tracking-[-0.02em] text-white">
              {t("servicesPage.missing.title")}
            </span>
          </div>
          <Link
            href="/contact"
            className="flex h-12 flex-none items-center gap-2.5 bg-white px-6 font-display text-[14px] font-bold tracking-[0.13em] whitespace-nowrap text-ink uppercase transition-colors hover:bg-primary-on-dark"
          >
            {t("servicesPage.missing.cta")}
            <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
