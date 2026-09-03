"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { Eyebrow } from "@/components/share/Eyebrow";
import { FAQ_KEYS } from "@/components/homepage/homeData";
import { cn } from "@/components/ui/cn";

export function Faq() {
  const { t } = useLang();
  const scope = useGsapScope();
  const [open, setOpen] = useState(0);

  return (
    <section
      ref={scope}
      className="bg-page relative px-[clamp(18px,3vw,44px)] py-[clamp(48px,6vw,96px)]"
    >
      <div className="mx-auto flex max-w-[900px] flex-col gap-[clamp(28px,3.4vw,44px)]">
        <div
          className="flex flex-col items-center gap-3.5 text-center"
          data-anim-stagger="up"
          data-anim-gap="0.1"
        >
          <Eyebrow data-anim="up">{t("home.faq.eyebrow")}</Eyebrow>
          <h2 className="text-[clamp(30px,3.8vw,54px)] leading-[1.02] tracking-[-0.038em] text-balance">
            {t("home.faq.title")}
          </h2>
          <p className="max-w-[560px] text-[clamp(14.5px,1.3vw,16.5px)] leading-[1.65] text-body text-pretty">
            {t("home.faq.lead")}
          </p>
        </div>

        <div className="flex flex-col gap-3" data-anim-stagger="up" data-anim-gap="0.07">
          {FAQ_KEYS.map((key, i) => {
            const isOpen = open === i;
            return (
              <div
                key={key}
                onClick={() => setOpen(isOpen ? -1 : i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(isOpen ? -1 : i);
                  }
                }}
                className={cn(
                  "cursor-pointer border p-[clamp(16px,1.8vw,22px)] px-[clamp(16px,2vw,26px)] transition-colors",
                  isOpen ? "border-primary bg-bg shadow-[0_26px_54px_-34px_rgba(0,0,0,0.45)]" : "border-border bg-surface",
                )}
              >
                <div className="flex items-center gap-[clamp(12px,1.4vw,18px)]">
                  <span className="w-[22px] flex-none font-display text-[13px] font-bold tracking-[0.1em] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 min-w-0 text-[clamp(15.5px,1.5vw,18px)] leading-[1.35] font-bold tracking-[-0.02em] text-heading">
                    {t(`home.faq.items.${key}.q`)}
                  </span>
                  <span
                    className={cn(
                      "flex h-10 w-10 flex-none items-center justify-center border transition-colors",
                      isOpen ? "border-border bg-transparent text-heading" : "border-primary bg-primary text-white",
                    )}
                  >
                    {isOpen ? <Minus size={15} strokeWidth={2.6} aria-hidden /> : <Plus size={15} strokeWidth={2.6} aria-hidden />}
                  </span>
                </div>

                <div
                  className={cn(
                    "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                    isOpen ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <p
                    className="mt-3.5 mb-0.5 max-w-[660px] pl-[calc(22px+clamp(12px,1.4vw,18px))] text-[clamp(14px,1.3vw,15.5px)] leading-[1.75] text-body text-pretty"
                  >
                    {t(`home.faq.items.${key}.a`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
