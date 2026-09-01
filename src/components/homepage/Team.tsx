"use client";

import { Users } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { TEAM_MEMBER_KEYS, TEAM_SOCIAL_ICONS } from "@/components/homepage/homeData";

/** Initials for the member's photo slot — no per-vendor headshots exist yet
 *  (the design's own canvas state reused a single generic photo across all
 *  four cards, mismatched for the members it doesn't depict), so each card
 *  falls back to initials per the image-rules convention. */
function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function Team() {
  const { t } = useLang();

  return (
    <section className="brand-wash relative overflow-hidden [--wash-angle:152deg] [--wash-strength:12%] px-[clamp(18px,3vw,44px)] py-[clamp(48px,6vw,90px)]">
      <div className="relative mx-auto max-w-[1240px]">
        <div className="mb-[clamp(30px,3.6vw,46px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="flex min-w-0 max-w-[520px] flex-col gap-2.5">
            <Eyebrow icon={<Users size={16} strokeWidth={2} aria-hidden />}>
              {t("home.team.eyebrow")}
            </Eyebrow>
            <h2 className="text-[clamp(30px,3.6vw,50px)] leading-[1.04] tracking-[-0.03em] text-balance">
              {t("home.team.title")}
            </h2>
          </div>
          <p className="max-w-[380px] text-[14.5px] leading-[1.65] text-body">{t("home.team.lead")}</p>
        </div>

        <div className="grid grid-cols-1 gap-x-[clamp(18px,2vw,26px)] gap-y-[clamp(20px,2.2vw,30px)] mid:grid-cols-2 wide:grid-cols-4">
          {TEAM_MEMBER_KEYS.map((key) => (
            <div key={key} className="group flex flex-col">
              <div className="relative aspect-[0.86] bg-bg">
                <span className="flex h-full w-full items-center justify-center text-[clamp(30px,3.4vw,42px)] font-black tracking-[-0.02em] text-brand/40">
                  {initials(t(`home.team.members.${key}.name`))}
                </span>

                <div className="absolute right-0 -bottom-4.5 flex w-[46px] flex-col items-stretch">
                  <div className="flex translate-y-2 flex-col items-center gap-2.5 bg-white py-3 opacity-0 shadow-[0_18px_36px_-16px_rgba(0,0,0,0.35)] transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                    {TEAM_SOCIAL_ICONS.map((icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="flex h-5 w-5 items-center justify-center text-[#12100f]"
                      >
                        {icon}
                      </a>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="flex h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center border-0 bg-primary text-white transition-colors hover:bg-primary-dark"
                  >
                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 17a7 7 0 0 1 7-7h6" />
                      <path d="M14 6l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-[30px]">
                <div className="text-[17px] font-extrabold tracking-[-0.01em] text-heading">
                  {t(`home.team.members.${key}.name`)}
                </div>
                <div className="font-display text-[13px] font-bold tracking-[0.09em] text-brand uppercase">
                  {t(`home.team.members.${key}.role`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
