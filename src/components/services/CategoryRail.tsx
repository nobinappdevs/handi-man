"use client";

import { useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { categoryAnchor, type CatalogueCategory } from "@/hooks/useCatalogue";
import { cn } from "@/components/ui/cn";

/** The category's own image, or a neutral glyph when it has none or it fails. */
function RailIcon({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <LayoutGrid size={16} strokeWidth={2} aria-hidden />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
    <img src={src} alt="" aria-hidden onError={() => setBroken(true)} className="h-4 w-4 object-contain" />
  );
}

/**
 * The catalogue's jump bar - one chip per category from `GET /services`, as
 * anchors rather than a JS filter.
 *
 * Anchors because the page is one long catalogue: a filter would hide every
 * section but one, lose the reader's place, and leave nothing to link to.
 *
 * Sticky UNDER the site header, which is itself sticky; the offset is
 * `--header-offset` from `globals.css`, so the rail rides up with the header
 * as it hides and comes back down with it.
 */
export function CategoryRail({ categories }: { categories: CatalogueCategory[] }) {
  const { t } = useLang();
  const [active, setActive] = useState(categories[0]?.slug ?? "");

  /* Scroll-spy. The trip-wire is a band just under the header and the rail,
     so the lit chip is the section whose heading you are actually reading. */
  useEffect(() => {
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const hit = categories.find((c) => seen.get(categoryAnchor(c.slug)));
        if (hit) setActive(hit.slug);
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 },
    );
    for (const c of categories) {
      const el = document.getElementById(categoryAnchor(c.slug));
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [categories]);

  return (
    <nav
      aria-label={t("servicesPage.rail.label")}
      className="sticky top-[var(--header-offset)] z-30 border-y border-border bg-bg/95 backdrop-blur transition-[top] duration-500 ease-out motion-reduce:transition-none"
    >
      {/* `no-scrollbar`: this track scrolls sideways on a phone, and a visible
          bar under a row of chips is louder than the chips. */}
      <div className="no-scrollbar mx-auto flex max-w-[1240px] gap-2 overflow-x-auto px-[clamp(14px,3vw,44px)] py-3">
        {categories.map(({ id, slug, name, image }) => {
          const on = slug === active;
          return (
            <a
              key={id}
              href={`#${categoryAnchor(slug)}`}
              aria-current={on ? "true" : undefined}
              className={cn(
                "flex flex-none items-center gap-2 border px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors",
                on
                  ? "border-primary bg-primary text-white hover:text-white"
                  : "border-border bg-surface text-heading hover:border-primary hover:text-brand",
              )}
            >
              <span className="flex h-4 w-4 flex-none items-center justify-center">
                <RailIcon src={image} />
              </span>
              {name}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/** The rail's outline while `/services` loads. */
export function CategoryRailSkeleton() {
  return (
    <div aria-hidden className="border-y border-border bg-bg">
      <div className="no-scrollbar mx-auto flex max-w-[1240px] gap-2 overflow-hidden px-[clamp(14px,3vw,44px)] py-3">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="h-[38px] w-28 flex-none animate-pulse bg-border" />
        ))}
      </div>
    </div>
  );
}
