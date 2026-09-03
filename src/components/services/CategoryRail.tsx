"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/components/ui/cn";
import { CATALOGUE, sectionId } from "@/components/services/servicesData";

/**
 * The catalogue's jump bar — the filter rail from the old design, rebuilt as
 * anchors rather than a JS filter.
 *
 * Anchors because the page is one long catalogue: a filter would hide eight
 * sections to show one, lose the reader's place, and leave nothing to link to.
 * Anchors keep every section in the document, work with no JS at all, and give
 * each category a shareable URL.
 *
 * The bar is sticky at `top-0` with no offset because the site header is NOT
 * sticky — check `share/Navbar.tsx` before adding one here.
 */
export function CategoryRail() {
  const { t } = useLang();
  const [active, setActive] = useState(CATALOGUE[0].key);

  /* Scroll-spy. `rootMargin` pins the trip-wire to a band just under the rail
     rather than the whole viewport, so the highlighted chip is the section
     whose heading you are actually reading — not whichever one happens to
     overlap the most, which on a page of tall sections is the previous one. */
  useEffect(() => {
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const hit = CATALOGUE.find((c) => seen.get(sectionId(c.key)));
        if (hit) setActive(hit.key);
      },
      { rootMargin: "-72px 0px -70% 0px", threshold: 0 },
    );
    for (const c of CATALOGUE) {
      const el = document.getElementById(sectionId(c.key));
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label={t("servicesPage.rail.label")}
      className="sticky top-0 z-30 border-y border-border bg-bg/95 backdrop-blur"
    >
      {/* `no-scrollbar` because this track scrolls sideways on a phone and a
          visible bar under nine chips is louder than the chips. */}
      <div className="no-scrollbar mx-auto flex max-w-[1240px] gap-2 overflow-x-auto px-[clamp(14px,3vw,44px)] py-3">
        {CATALOGUE.map(({ key, nameKey, icon }) => {
          const on = key === active;
          return (
            <a
              key={key}
              href={`#${sectionId(key)}`}
              aria-current={on ? "true" : undefined}
              className={cn(
                "flex flex-none items-center gap-2 border px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors",
                on
                  ? "border-primary bg-primary text-white hover:text-white"
                  : "border-border bg-surface text-heading hover:border-primary hover:text-brand",
              )}
            >
              <span className="flex h-4 w-4 flex-none items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
                {icon}
              </span>
              {t(nameKey)}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
