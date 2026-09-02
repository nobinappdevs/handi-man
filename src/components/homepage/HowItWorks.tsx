"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { Eyebrow } from "@/components/share/Eyebrow";
import { HOW_IT_WORKS_STEPS } from "@/components/homepage/homeData";
import { cn } from "@/components/ui/cn";

/** Dark stat panel + step list; hovering or clicking a row previews it in the
 *  panel, matching the design's mouse-driven "walkthrough" behaviour. */
export function HowItWorks() {
  const { t } = useLang();
  const scope = useGsapScope();
  const [active, setActive] = useState(0);
  const step = HOW_IT_WORKS_STEPS[active];
  const total = HOW_IT_WORKS_STEPS.length;

  return (
    <section
      ref={scope}
      className="brand-wash relative border-t border-border [--wash-angle:152deg] [--wash-strength:13%] px-[clamp(18px,3vw,44px)] pt-[clamp(40px,4.6vw,74px)] pb-[clamp(48px,5.6vw,88px)]"
    >
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(28px,3.2vw,46px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="flex min-w-0 max-w-[600px] flex-col gap-3">
            <Eyebrow data-anim="up">{t("home.howItWorks.eyebrow")}</Eyebrow>
            <h2
              className="text-[clamp(28px,3.4vw,46px)] leading-[1.04] tracking-[-0.035em]"
              data-anim-split
            >
              {t("home.howItWorks.title")}
            </h2>
          </div>
          <p
            className="min-w-0 max-w-[40ch] text-[14.5px] leading-[1.65] font-medium text-body text-pretty"
            data-anim="up"
            data-anim-delay="0.15"
          >
            {t("home.howItWorks.lead")}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-[clamp(18px,2vw,28px)] wide:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)]">
          {/* Active-step panel */}
          <div
            className="relative flex min-h-[clamp(300px,30vw,392px)] min-w-0 flex-col justify-between gap-[clamp(24px,3vw,40px)] overflow-hidden bg-ink p-[clamp(26px,3vw,44px)] text-white"
            data-anim="left"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[4%] right-[clamp(14px,2vw,30px)] font-display text-[clamp(150px,17vw,250px)] leading-[0.72] font-bold tracking-[-0.05em] text-white/[0.08] select-none"
            >
              {String(active + 1).padStart(2, "0")}
            </span>

            <div className="relative flex flex-col gap-[clamp(16px,1.8vw,22px)]">
              <span className="flex h-[clamp(48px,4.4vw,58px)] w-[clamp(48px,4.4vw,58px)] flex-none items-center justify-center rounded-full bg-primary text-white">
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {step.icon}
                </svg>
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="text-[clamp(22px,2.6vw,34px)] leading-[1.06] font-black tracking-[-0.035em] text-white">
                  {t(`home.howItWorks.steps.${step.key}.title`)}
                </h3>
                <p className="max-w-[42ch] text-[clamp(14.5px,1.4vw,16.5px)] leading-[1.6] font-medium text-white/72 text-pretty">
                  {t(`home.howItWorks.steps.${step.key}.body`)}
                </p>
              </div>
            </div>

            <div className="relative flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-4 font-display text-xs font-bold tracking-[0.16em] text-white/60 uppercase">
                <span>
                  {t("home.howItWorks.timing")} — {t(`home.howItWorks.steps.${step.key}.meta`)}
                </span>
                <span>
                  {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
              <div className="h-0.5 bg-white/[0.16]">
                <div
                  className="h-full bg-primary-on-dark transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.round(((active + 1) / total) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step list */}
          <div
            className="flex min-w-0 flex-col border-t border-border"
            data-anim-stagger="right"
            data-anim-gap="0.075"
          >
            {HOW_IT_WORKS_STEPS.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[clamp(12px,1.4vw,18px)] border-b border-border p-[clamp(11px,1.2vw,15px)] px-[clamp(12px,1.4vw,20px)] text-left transition-colors",
                    on && "bg-primary/20",
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-[13px] font-bold tracking-[0.12em]",
                      on ? "text-brand" : "text-muted",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={cn("h-[18px] w-[18px] flex-none", on ? "text-brand" : "text-muted")}>
                      <svg
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        {s.icon}
                      </svg>
                    </span>
                    <span
                      className={cn(
                        "min-w-0 overflow-hidden text-[clamp(14.5px,1.5vw,17px)] tracking-[-0.02em] whitespace-nowrap overflow-ellipsis",
                        on ? "font-extrabold text-brand" : "font-semibold text-heading",
                      )}
                    >
                      {t(`home.howItWorks.steps.${s.key}.title`)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex h-[26px] w-[26px] flex-none items-center justify-center",
                      on ? "text-brand" : "text-transparent",
                    )}
                  >
                    <ArrowRight size={15} strokeWidth={2.4} aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
