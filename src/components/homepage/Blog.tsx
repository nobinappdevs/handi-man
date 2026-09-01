"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { BLOG_POST_KEYS } from "@/components/homepage/homeData";
import { cn } from "@/components/ui/cn";
import servicePhoto from "@public/assets/home/oneinall.webp";

/* Left divider only appears between columns, and which index that is shifts
   with the column count (2-up on tablet, 3-up on desktop) — see each post's
   comment below for why its breakpoint differs. */
const DIVIDER = [
  "border-transparent", // post 1 always starts a row
  "border-transparent mid:border-border", // 2nd of 2 (tablet) and 2nd of 3 (desktop) both need the rule
  "border-transparent wide:border-border", // 2nd of 2 on tablet (row start, no rule); 3rd of 3 on desktop (needs the rule)
];
const TITLE_SIZE = ["text-[clamp(21px,2.3vw,29px)]", "text-[clamp(18px,1.9vw,22px)]", "text-[clamp(18px,1.9vw,22px)]"];
const ASPECT = ["aspect-[1.34]", "aspect-[1.18]", "aspect-[1.18]"];

export function Blog() {
  const { t } = useLang();

  return (
    <section className="brand-wash relative [--wash-angle:332deg] [--wash-strength:5%] px-[clamp(18px,3vw,44px)] py-[clamp(40px,5vw,84px)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(26px,3vw,42px)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <Eyebrow>{t("home.blog.eyebrow")}</Eyebrow>
          <h2 className="text-[clamp(28px,3.4vw,46px)] leading-[1.04] tracking-[-0.035em]">
            {t("home.blog.title")}
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-[1.65] font-medium text-body text-pretty">
            {t("home.blog.lead")}
          </p>
        </div>

        <div className="grid grid-cols-1 border-t border-border mid:grid-cols-2 wide:grid-cols-[1.25fr_1fr_1fr]">
          {BLOG_POST_KEYS.map((key, i) => (
            <a
              key={key}
              href="/blog"
              className={cn(
                "group flex min-w-0 flex-col gap-[clamp(16px,1.8vw,24px)] border-l px-[clamp(18px,2vw,30px)] pt-[clamp(20px,2.2vw,32px)] pb-[clamp(22px,2.4vw,34px)] transition-colors hover:bg-primary/20",
                DIVIDER[i],
              )}
            >
              <div className="flex items-baseline justify-between gap-3.5">
                <span className="font-display text-[clamp(30px,3.4vw,46px)] leading-[0.8] font-bold tracking-[-0.02em] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-right font-display text-[11.5px] font-bold tracking-[0.16em] text-muted uppercase">
                  {t(`home.blog.posts.${key}.cat`)}
                </span>
              </div>

              <h3 className={cn("leading-[1.14] font-black tracking-[-0.032em] text-pretty", TITLE_SIZE[i])}>
                {t(`home.blog.posts.${key}.title`)}
              </h3>

              <div className="flex items-center gap-2.5 pb-1 text-[12.5px] font-semibold text-muted">
                {t("home.blog.author")}
                <span className="h-px w-4 bg-border" />
                {t(`home.blog.posts.${key}.date`)}
                <span className="h-px w-4 bg-border" />
                {t(`home.blog.posts.${key}.read`)}
              </div>

              <div className={cn("relative mt-auto overflow-hidden bg-form", ASPECT[i])}>
                <Image
                  src={servicePhoto}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 700px) 100vw, (max-width: 980px) 50vw, 40vw"
                  className="object-cover"
                />
                <span className="absolute right-0 bottom-0 flex h-[clamp(40px,4vw,50px)] w-[clamp(40px,4vw,50px)] items-center justify-center bg-bg text-heading transition-colors group-hover:bg-primary group-hover:text-white">
                  <ArrowRight size={17} strokeWidth={2.2} aria-hidden />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
