"use client";

import { useState } from "react";
import { Globe, UserRound, Users } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { useHomeContent, type HomeTeamMember } from "@/hooks/useHomeContent";
import { Eyebrow } from "@/components/share/Eyebrow";
import { SOCIAL_ICONS } from "@/components/homepage/homeData";

/** The member's photo, or a silhouette when the file is missing or fails. */
function Portrait({ member }: { member: HomeTeamMember }) {
  const [broken, setBroken] = useState(false);
  if (!member.image || broken) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-brand/10 text-brand">
        <UserRound size={44} strokeWidth={1.2} aria-hidden />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
    <img
      src={member.image}
      alt={member.name}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
    />
  );
}

/**
 * The team, from `teams.value.items` on `GET /global/index` - names, roles and
 * photos in the visitor's language. The eyebrow, heading and lead above them
 * are the site's own copy, not the API's section text.
 *
 * Social links open in a new tab and only when the admin gave a real web URL;
 * a member with none shows no social panel at all rather than dead icons.
 */
export function Team() {
  const { t } = useLang();
  const scope = useGsapScope();
  const { data, isLoading } = useHomeContent();
  const team = data?.team ?? [];
  /* Its own scope, re-run when the members land - the cards mounted then
     would otherwise stay hidden under `.anim-ready`. */
  const grid = useGsapScope<HTMLDivElement>(undefined, isLoading ? "loading" : team.length);

  return (
    <section
      ref={scope}
      className="bg-page relative overflow-hidden px-[clamp(18px,3vw,44px)] py-[clamp(48px,6vw,90px)]"
    >
      <div className="relative mx-auto max-w-[1240px]">
        <div className="mb-[clamp(30px,3.6vw,46px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="flex min-w-0 max-w-[520px] flex-col gap-2.5">
            <Eyebrow icon={<Users size={16} strokeWidth={2} aria-hidden />} data-anim="up">
              {t("home.team.eyebrow")}
            </Eyebrow>
            <h2
              className="text-[clamp(30px,3.6vw,50px)] leading-[1.04] tracking-[-0.03em] text-balance"
              data-anim-split
            >
              {t("home.team.title")}
            </h2>
          </div>
          <p
            className="max-w-[380px] text-[14.5px] leading-[1.65] text-body"
            data-anim="up"
            data-anim-delay="0.15"
          >
            {t("home.team.lead")}
          </p>
        </div>

        <div
          ref={grid}
          className="grid grid-cols-1 gap-x-[clamp(18px,2vw,26px)] gap-y-[clamp(20px,2.2vw,30px)] mid:grid-cols-2 wide:grid-cols-4"
          data-anim-stagger="rise"
          data-anim-gap="0.1"
        >
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} aria-hidden className="flex flex-col">
                  <div className="aspect-[0.86] animate-pulse bg-border" />
                  <div className="flex flex-col gap-2 bg-bg p-3.5">
                    <span className="h-4 w-2/3 animate-pulse bg-border" />
                    <span className="h-3 w-1/3 animate-pulse bg-border" />
                  </div>
                </div>
              ))
            : team.map((member) => (
                <div key={member.id} className="group flex flex-col">
                  {/* `overflow-hidden` is on an inner box, not this one — the
                      social panel below hangs past the bottom edge and must
                      not be cut. */}
                  <div className="relative aspect-[0.86] bg-bg">
                    <div className="absolute inset-0 overflow-hidden">
                      <Portrait member={member} />
                    </div>

                    {member.social.length > 0 && (
                      <div className="absolute end-0 -bottom-4.5 flex w-[46px] flex-col items-stretch">
                        <div className="flex translate-y-2 flex-col items-center gap-2.5 bg-white py-3 opacity-0 shadow-[0_18px_36px_-16px_rgba(0,0,0,0.35)] transition-[opacity,transform] duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
                          {member.social.map((link, i) => (
                            <a
                              key={`${link.network}-${i}`}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${member.name} · ${link.network}`}
                              className="flex h-5 w-5 items-center justify-center text-[#12100f] transition-colors hover:text-primary"
                            >
                              {SOCIAL_ICONS[link.network] ?? <Globe size={13} strokeWidth={2} aria-hidden />}
                            </a>
                          ))}
                        </div>
                        <span
                          aria-hidden
                          className="flex h-[46px] w-[46px] flex-none items-center justify-center bg-primary text-white transition-colors group-hover:bg-primary-dark"
                        >
                          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="rtl:-scale-x-100">
                            <path d="M4 17a7 7 0 0 1 7-7h6" />
                            <path d="M14 6l4 4-4 4" />
                          </svg>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-center bg-bg p-3.5 dark:bg-linear-to-br dark:from-primary-dark dark:to-primary">
                    <div className="text-[17px] font-extrabold tracking-[-0.01em] text-heading">{member.name}</div>
                    <div className="font-display text-[13px] font-bold tracking-[0.09em] text-brand uppercase">
                      {member.role}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
