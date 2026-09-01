"use client";

import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { SERVICE_GROUPS } from "@/components/homepage/homeData";
import servicePhoto from "@public/assets/home/oneinall.webp";

/** Category-grouped listing rails (Cleaning, Mechanics…), each card carrying
 *  a numbered plum spine with the card's tag running vertically. */
export function CategoryListings() {
  const { t } = useLang();

  return (
    <section className="brand-wash relative [--wash-angle:332deg] [--wash-strength:5%] px-[clamp(18px,3vw,44px)] pt-[clamp(14px,2vw,26px)] pb-[clamp(46px,5.4vw,84px)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(42px,5vw,74px)]">
        {SERVICE_GROUPS.map((group) => (
          <div key={group.key} className="flex flex-col gap-[clamp(26px,2.8vw,38px)]">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Eyebrow>{t(`home.categoryGroups.groups.${group.key}.eyebrow`)}</Eyebrow>
                <h2 className="text-[clamp(24px,2.6vw,36px)] leading-[1.06]">
                  {t(`home.categoryGroups.groups.${group.key}.name`)}
                </h2>
              </div>
              <a
                href="/services"
                className="flex items-center gap-2 font-display text-[13.5px] font-bold uppercase tracking-[0.14em] text-brand"
              >
                {t("home.categoryGroups.allOf")} {t(`home.categoryGroups.groups.${group.key}.name`)}
                <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-[clamp(20px,2.2vw,30px)] mid:grid-cols-2 wide:grid-cols-4">
              {group.cards.map((card, i) => (
                <a
                  key={card.key}
                  href="/services"
                  className="grid min-w-0 grid-cols-[clamp(34px,3.2vw,42px)_minmax(0,1fr)] border border-border bg-bg transition-[border-color,box-shadow] duration-200 hover:border-primary hover:shadow-[0_30px_56px_-34px_rgba(18,16,15,0.45)]"
                >
                  <div className="flex flex-col items-center justify-between bg-primary py-3.5">
                    <span className="font-display text-xs font-bold tracking-[0.16em] text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="[writing-mode:vertical-rl] rotate-180 font-display text-[11.5px] font-bold tracking-[0.22em] text-white uppercase">
                      {card.tag}
                    </span>
                    <span className="flex h-[22px] w-[22px] items-center justify-center text-white">
                      <ArrowRight size={15} strokeWidth={2.6} aria-hidden />
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <div className="relative aspect-[1.42] overflow-hidden bg-form">
                      <Image
                        src={servicePhoto}
                        alt=""
                        aria-hidden
                        fill
                        sizes="(max-width: 700px) 100vw, (max-width: 980px) 50vw, 25vw"
                        className="object-cover"
                      />
                      <span className="absolute bottom-0 left-0 bg-[rgba(18,16,15,0.86)] px-[11px] py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                        {card.vendor}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3.5 p-[clamp(15px,1.6vw,20px)]">
                      <h3 className="text-[clamp(15.5px,1.5vw,17.5px)] leading-[1.26] font-extrabold tracking-[-0.02em] text-pretty">
                        {t(`home.categoryGroups.items.${card.key}.title`)}
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
                          {t(`home.categoryGroups.items.${card.key}.unit`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
