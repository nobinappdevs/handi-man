"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, FileQuestion, Hash, ImageOff } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import { useHomeContent } from "@/hooks/useHomeContent";
import { Eyebrow } from "@/components/share/Eyebrow";
import { postHref } from "@/components/homepage/Blog";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { formatDate } from "@/lib/money";

/** How many other posts the foot of the page suggests. */
const MORE = 3;

function Cover({ src, className }: { src: string; className: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <span className={`flex items-center justify-center bg-brand/10 text-brand ${className}`}>
        <ImageOff size={30} strokeWidth={1.4} aria-hidden />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
    <img src={src} alt="" onError={() => setBroken(true)} className={`object-cover ${className}`} />
  );
}

/**
 * `/blog/details?slug=…` - one announcement, in full.
 *
 * The slug rides in the query, not the path: a static export cannot prerender
 * an `[slug]` route for posts written after the build. The post comes out of
 * the same `GET /global/index` the home page and `/blog` already load (it
 * carries every announcement with its full text), so arriving from either is
 * instant - it is in the cache.
 *
 * The body is the admin's rich-text HTML, and it goes through `sanitizeHtml`
 * before it touches the page: allowlisted tags, web links only, no scripts,
 * handlers or styles. It is laid out with the editor's own `.rte-content`
 * rules, so it reads the way it was written.
 *
 * Nothing here animates in: it is the page's fold, and the content only exists
 * after the request - a reveal would just delay it further.
 */
export function BlogDetail() {
  const { t } = useLang();
  const isClient = useIsClient();
  const slug = useSearchParams().get("slug") ?? "";
  const { data, isLoading } = useHomeContent();

  const posts = data?.announcements ?? [];
  const post = posts.find((p) => p.slug === slug || String(p.id) === slug);
  const others = posts.filter((p) => p !== post).slice(0, MORE);
  const body = post && isClient ? sanitizeHtml(post.html) : "";

  const back = (
    <Link
      href="/blog"
      className="inline-flex w-fit items-center gap-2 font-display text-[13px] font-bold tracking-[0.12em] text-brand uppercase"
    >
      <ArrowLeft size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
      {t("blogDetail.back")}
    </Link>
  );

  if (isLoading || !isClient) {
    return (
      <section aria-busy className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(34px,4.5vw,66px)]">
        <div aria-hidden className="mx-auto flex max-w-[860px] flex-col gap-5">
          <span className="h-3 w-40 animate-pulse bg-border" />
          <span className="h-10 w-full animate-pulse bg-border" />
          <span className="h-10 w-2/3 animate-pulse bg-border" />
          <span className="h-3 w-56 animate-pulse bg-border" />
          <span className="mt-2 aspect-[16/9] w-full animate-pulse bg-border" />
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="h-3.5 animate-pulse bg-border" style={{ width: `${92 - i * 9}%` }} />
          ))}
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="bg-page px-[clamp(18px,3vw,44px)] py-[clamp(60px,8vw,120px)]">
        <div className="mx-auto flex max-w-[520px] flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center bg-brand/12 text-brand">
            <FileQuestion size={24} strokeWidth={1.6} aria-hidden />
          </span>
          <h1 className="text-[clamp(22px,2.4vw,30px)] leading-tight">{t("blogDetail.notFound")}</h1>
          <p className="text-[14.5px] text-muted">{t("blogDetail.notFoundHint")}</p>
          <div className="mt-2">{back}</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <article className="bg-page px-[clamp(18px,3vw,44px)] pt-[clamp(30px,4vw,56px)] pb-[clamp(40px,5vw,72px)]">
        <div className="mx-auto flex max-w-[860px] flex-col gap-[clamp(18px,2vw,26px)]">
          {back}

          <header className="flex flex-col gap-3.5">
            {post.tag && <Eyebrow>{post.tag}</Eyebrow>}
            <h1 className="text-[clamp(28px,4vw,52px)] leading-[1.06] tracking-[-0.035em] text-balance">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 text-[13px] font-semibold text-muted">
              {t("home.blog.author")}
              <span className="h-px w-4 bg-border" />
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              <span className="h-px w-4 bg-border" />
              {post.minutes} {t("home.blog.minRead")}
            </div>
          </header>

          <Cover src={post.image} className="aspect-[16/9] w-full" />

          {/* Sanitised above - see `sanitizeHtml`. */}
          <div
            className="rte-content rte-article"
            dangerouslySetInnerHTML={{ __html: body }}
          />

          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 border-t border-border pt-5" aria-label={t("blogDetail.tags")}>
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="flex items-center gap-1 border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-heading"
                >
                  <Hash size={12} strokeWidth={2.4} aria-hidden className="text-brand" />
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      {others.length > 0 && (
        <section className="bg-page border-t border-border px-[clamp(18px,3vw,44px)] py-[clamp(36px,4.5vw,64px)]">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-[clamp(20px,2.4vw,30px)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[clamp(22px,2.4vw,32px)] leading-tight tracking-[-0.03em]">{t("blogDetail.more")}</h2>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-display text-[13px] font-bold tracking-[0.12em] text-brand uppercase"
              >
                {t("home.listings.viewAll")}
                <ArrowRight size={14} strokeWidth={2.6} aria-hidden className="rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-[clamp(16px,1.8vw,24px)] mid:grid-cols-2 wide:grid-cols-3">
              {others.map((p) => (
                <Link
                  key={p.id}
                  href={postHref(p)}
                  className="group flex min-w-0 flex-col border border-border bg-bg transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-primary"
                >
                  <span className="relative block aspect-[1.6] overflow-hidden">
                    <Cover src={p.image} className="absolute inset-0 h-full w-full" />
                  </span>
                  <span className="flex flex-1 flex-col gap-2.5 p-[clamp(15px,1.6vw,20px)]">
                    {p.tag && (
                      <span className="font-display text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
                        {p.tag}
                      </span>
                    )}
                    <span className="line-clamp-2 text-[17px] leading-[1.3] font-extrabold tracking-[-0.02em] text-heading">
                      {p.title}
                    </span>
                    <span className="mt-auto text-[12.5px] font-semibold text-muted">
                      {formatDate(p.createdAt)} · {p.minutes} {t("home.blog.minRead")}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
