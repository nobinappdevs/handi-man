"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { Blog } from "@/components/homepage/Blog";
import { BLOG_POST_KEYS } from "@/components/homepage/homeData";

/**
 * The `/blog` screen: a short page head, then the post grid the design shares
 * with the home page.
 *
 * `Blog` is imported as-is rather than copied — it takes no props and owns its
 * own GSAP scope. The head exists because that reveal waits for hydration, so
 * it cannot hold the fold (blueprint §6.5); the head takes it with the CSS
 * `enter-*` classes, `enter-rise` on the `h1` since that is the LCP element
 * and must move without fading.
 */
export function BlogScreen() {
  const { t } = useLang();

  return (
    <>
      <section className="bg-page border-b border-border px-[clamp(18px,3vw,44px)] pt-[clamp(34px,4.5vw,66px)] pb-[clamp(30px,3.6vw,52px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="enter-group flex min-w-0 max-w-[620px] flex-col gap-3">
            <Eyebrow>{t("blogPage.eyebrow")}</Eyebrow>
            {/* `enter-rise` — transform only. This is the LCP element and an
                opacity entrance on it costs seconds of it. */}
            <h1 className="enter-rise text-balance [--enter-delay:0.08s]">{t("blogPage.title")}</h1>
            <p className="max-w-[54ch]">{t("blogPage.lead")}</p>
          </div>

          {/* Not `flex-none`: below `mid` this row wraps onto its own line and
              has to be able to shrink, or it pushes the page sideways past the
              section padding. */}
          <div className="enter-fade flex min-w-0 flex-wrap items-center gap-x-8 gap-y-4 [--enter-delay:0.24s]">
            <span className="flex flex-col gap-1">
              <span className="text-[clamp(26px,2.6vw,34px)] leading-none font-black tracking-[-0.03em] text-brand">
                {BLOG_POST_KEYS.length}
              </span>
              <span className="font-display text-[12px] font-bold tracking-[0.14em] text-muted uppercase">
                {t("blogPage.stats.posts")}
              </span>
            </span>
            <Link
              href="/contact"
              className="flex h-12 flex-none items-center gap-2.5 bg-primary px-6 font-display text-[14.5px] font-bold tracking-[0.13em] whitespace-nowrap text-white uppercase transition-colors hover:bg-primary-dark"
            >
              {t("blogPage.cta")}
              <ArrowRight size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      <Blog />
    </>
  );
}
