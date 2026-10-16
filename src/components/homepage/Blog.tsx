"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ImageOff } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useGsapScope } from "@/hooks/useGsap";
import { useHomeContent, type HomeAnnouncement } from "@/hooks/useHomeContent";
import { Eyebrow } from "@/components/share/Eyebrow";
import { cn } from "@/components/ui/cn";
import { formatDate } from "@/lib/money";

/** Where one post opens - a query param, as every detail page in a static export. */
export const postHref = (post: Pick<HomeAnnouncement, "slug" | "id">) =>
  `/blog/details?slug=${encodeURIComponent(post.slug || String(post.id))}`;

/*
 * The grid repeats a three-column pattern: the first post of each row is the
 * wide one (`1.25fr`). The leading rule (`border-s`, so it follows the reading
 * direction) sits between columns, never at a row's start, and every row after
 * the first gets a top rule. Which index starts a row depends on the column
 * count - 1 on phones, 2 from `mid`, 3 from `wide` - so both are worked out
 * per breakpoint from the index.
 */
function cellRules(i: number) {
  return cn(
    "border-s border-s-transparent border-t-border",
    i % 2 !== 0 && "mid:border-s-border",
    i % 3 !== 0 ? "wide:border-s-border" : "wide:border-s-transparent",
    i >= 1 ? "border-t" : "border-t-0",
    i >= 2 ? "mid:border-t" : "mid:border-t-0",
    i >= 3 ? "wide:border-t" : "wide:border-t-0",
  );
}
const TITLE_SIZE = ["text-[clamp(21px,2.3vw,29px)]", "text-[clamp(18px,1.9vw,22px)]", "text-[clamp(18px,1.9vw,22px)]"];
const ASPECT = ["aspect-[1.34]", "aspect-[1.18]", "aspect-[1.18]"];
const CELL = "flex min-w-0 flex-col gap-[clamp(16px,1.8vw,24px)] px-[clamp(18px,2vw,30px)] pt-[clamp(20px,2.2vw,32px)] pb-[clamp(22px,2.4vw,34px)]";

/** The home page shows a row of three, then "Load more" to the full list. */
const HOME_POSTS = 3;

/** The post's photo, or a quiet placeholder when the file is missing or fails. */
function Cover({ src }: { src: string }) {
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
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  );
}

/**
 * The announcements, from `GET /global/index`. The eyebrow, heading and lead
 * are the site's own copy; each post's title, tag, date, photo and reading
 * time are the API's. There is no author in the payload, so the byline stays
 * the site's "Super Admin".
 *
 * `all` is the `/blog` page: every post, no "Load more". On the home page it
 * is the newest three and a way through to the rest.
 *
 * A card is not one big link: it holds several (title, "Read more", photo),
 * and links cannot nest. All three open the post; "Read more" is the explicit
 * control, and the photo's link is hidden from the keyboard so a tab through
 * the grid does not stop three times per card.
 */
export function Blog({ all = false }: { all?: boolean }) {
  const { t } = useLang();
  const scope = useGsapScope();
  const { data, isLoading } = useHomeContent();
  const everything = data?.announcements ?? [];
  const posts = all ? everything : everything.slice(0, HOME_POSTS);
  /* Its own scope, re-run when the posts land - the cards mounted then would
     otherwise stay hidden under `.anim-ready`. */
  const grid = useGsapScope<HTMLDivElement>(undefined, isLoading ? "loading" : posts.length);

  return (
    <section
      ref={scope}
      className="bg-page relative px-[clamp(18px,3vw,44px)] py-[clamp(40px,5vw,84px)]"
    >
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(26px,3vw,42px)]">
        <div
          className="flex flex-col items-center gap-3 text-center"
          data-anim-stagger="up"
          data-anim-gap="0.1"
        >
          <Eyebrow>{t("home.blog.eyebrow")}</Eyebrow>
          <h2 className="text-[clamp(28px,3.4vw,46px)] leading-[1.04] tracking-[-0.035em]">
            {t("home.blog.title")}
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-[1.65] font-medium text-body text-pretty">
            {t("home.blog.lead")}
          </p>
        </div>

        <div
          ref={grid}
          className="grid grid-cols-1 border-t border-border mid:grid-cols-2 wide:grid-cols-[1.25fr_1fr_1fr]"
          data-anim-stagger="clip"
          data-anim-gap="0.13"
        >
          {isLoading
            ? Array.from({ length: HOME_POSTS }, (_, i) => (
                <div key={i} aria-hidden className={cn(CELL, cellRules(i))}>
                  <span className="flex items-baseline justify-between">
                    <span className="h-9 w-14 animate-pulse bg-border" />
                    <span className="h-3 w-24 animate-pulse bg-border" />
                  </span>
                  <span className="h-6 w-full animate-pulse bg-border" />
                  <span className="h-6 w-3/4 animate-pulse bg-border" />
                  <span className="h-3 w-2/3 animate-pulse bg-border" />
                  <span className={cn("mt-auto animate-pulse bg-border", ASPECT[i % 3])} />
                </div>
              ))
            : posts.map((post, i) => (
                <article key={post.id} className={cn(CELL, cellRules(i), "group transition-colors hover:bg-primary/10")}>
                  <div className="flex items-baseline justify-between gap-3.5">
                    <span className="font-display text-[clamp(30px,3.4vw,46px)] leading-[0.8] font-bold tracking-[-0.02em] text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {post.tag && (
                      <span className="text-right font-display text-[11.5px] font-bold tracking-[0.16em] text-muted uppercase">
                        {post.tag}
                      </span>
                    )}
                  </div>

                  <h3 className={cn("leading-[1.14] font-black tracking-[-0.032em] text-pretty", TITLE_SIZE[i % 3])}>
                    <Link href={postHref(post)} className="transition-colors hover:text-brand">
                      {post.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-2.5 text-[12.5px] font-semibold text-muted">
                    {t("home.blog.author")}
                    <span className="h-px w-4 bg-border" />
                    {formatDate(post.createdAt)}
                    <span className="h-px w-4 bg-border" />
                    {post.minutes} {t("home.blog.minRead")}
                  </div>

                  <Link
                    href={postHref(post)}
                    className="inline-flex w-fit items-center gap-2 font-display text-[13px] font-bold tracking-[0.12em] text-brand uppercase"
                  >
                    {t("home.blog.readMore")}
                    <ArrowRight
                      size={14}
                      strokeWidth={2.6}
                      aria-hidden
                      className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    />
                  </Link>

                  <Link
                    href={postHref(post)}
                    tabIndex={-1}
                    aria-hidden
                    className={cn("relative mt-auto block overflow-hidden bg-form", ASPECT[i % 3])}
                  >
                    <Cover src={post.image} />
                    <span className="absolute end-0 bottom-0 flex h-[clamp(40px,4vw,50px)] w-[clamp(40px,4vw,50px)] items-center justify-center bg-bg text-heading transition-colors group-hover:bg-primary group-hover:text-white">
                      <ArrowRight size={17} strokeWidth={2.2} aria-hidden className="rtl:rotate-180" />
                    </span>
                  </Link>
                </article>
              ))}
        </div>

        {!isLoading && posts.length === 0 && (
          <p className="text-center text-[14px] text-muted">{t("home.blog.empty")}</p>
        )}

        {!all && !isLoading && everything.length > HOME_POSTS && (
          <div className="flex justify-center">
            <Link
              href="/blog"
              className="flex h-12 items-center gap-2.5 bg-primary px-7 font-display text-[14px] font-bold tracking-[0.13em] whitespace-nowrap text-white uppercase transition-colors hover:bg-primary-dark"
            >
              {t("home.blog.loadMore")}
              <ArrowRight size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
