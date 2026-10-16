"use client";

import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/hooks/useLang";
import {
  globalService,
  type GlobalIndexData,
  type GlobalService,
  type Localized,
} from "@/services/global.service";

/**
 * The home page's live items, from `GET /global/index`, shaped for the
 * sections: image URLs resolved, admin copy in the visitor's language, prices
 * parsed. One request feeds Categories, Listings, Team and Blog - React Query
 * shares it between them.
 *
 * Section titles are NOT here: they are design copy and stay in `i18n`.
 */

export interface HomeCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface HomeService {
  id: number;
  name: string;
  item: string;
  price: number;
  image: string;
  /** The category's name - the payload carries no vendor name to show. */
  category: string;
}

export interface HomeTeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  social: { network: string; href: string }[];
}

export interface HomeAnnouncement {
  id: number;
  slug: string;
  title: string;
  /** The first tag, spaced out: "HandimanCommunity" → "Handiman Community". */
  tag: string;
  /** Every tag, spaced out the same way. */
  tags: string[];
  /** The full post as the admin wrote it - HTML, UNSANITISED. Render it only
   *  through `sanitizeHtml`. */
  html: string;
  image: string;
  createdAt: string;
  /** Reading time at ~200 words a minute, never under 1. */
  minutes: number;
}

export interface HomeContent {
  currency: string;
  categories: HomeCategory[];
  recommended: HomeService[];
  trending: HomeService[];
  team: HomeTeamMember[];
  announcements: HomeAnnouncement[];
}

function joinUrl(base?: string, folder?: string, file?: string | null) {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  return [base?.replace(/\/+$/, ""), folder?.replace(/^\/+|\/+$/g, ""), file.replace(/^\/+/, "")]
    .filter(Boolean)
    .join("/");
}

/** The visitor's language, then English, then whatever there is. */
function pick<T>(langs: Localized<T> | undefined, lang: string): T | undefined {
  if (!langs) return undefined;
  return langs[lang] ?? langs.en ?? Object.values(langs)[0];
}

/** Only real web links leave the site - never `javascript:` from an admin field. */
const safeHref = (raw?: string) => (raw && /^https?:\/\//i.test(raw.trim()) ? raw.trim() : "");

/** "fab fa-facebook-f" → "facebook". */
function networkOf(icon = "") {
  const name = icon.replace(/\b(fab|fas|far|fa)\b/g, "").replace(/fa-/g, "").trim().split(/\s+/)[0] ?? "";
  return name.replace(/-(f|square|alt)$/, "");
}

const spaceOut = (tag = "") => tag.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").trim();

function readingMinutes(html = "") {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function toContent(d: GlobalIndexData, lang: string): HomeContent {
  const base = d.base_url;
  const categoryName = new Map((d.categories ?? []).map((c) => [c.id, c.name]));

  const service = (s: GlobalService): HomeService => ({
    id: s.id,
    name: s.service_name,
    item: s.item ?? "",
    price: Number(s.price) || 0,
    image: joinUrl(base, d.service_image_path, s.thumbnail) || joinUrl(base, "", d.default_image),
    category: (s.category_id !== undefined && categoryName.get(s.category_id)) || "",
  });

  return {
    currency: d.currency_code ?? "",
    categories: (d.categories ?? [])
      .filter((c) => c.status === undefined || Number(c.status) === 1)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug ?? "",
        image: joinUrl(base, d.category_image_path, c.image),
      })),
    recommended: (d.recommended_service ?? []).map(service),
    trending: (d.trending_service ?? []).map(service),
    team: Object.values(d.teams?.value?.items ?? {}).map((m) => {
      const copy = pick(m.language, lang);
      return {
        id: m.id,
        name: copy?.name ?? "",
        role: copy?.team_title ?? "",
        image: joinUrl(base, d["site-section"], m.image),
        social: (m.social_links ?? [])
          .map((s) => ({ network: networkOf(s.icon), href: safeHref(s.link) }))
          .filter((s) => s.href),
      };
    }),
    announcements: (d.announcements ?? []).map((a) => ({
      id: a.id,
      slug: a.slug ?? "",
      title: pick(a.name?.language, lang)?.name ?? "",
      tag: spaceOut(a.tags?.[0]),
      tags: (a.tags ?? []).map(spaceOut).filter(Boolean),
      html: pick(a.details?.language, lang)?.details ?? "",
      image: joinUrl(base, d.blog_image_path, a.image),
      createdAt: a.created_at ?? "",
      minutes: readingMinutes(pick(a.details?.language, lang)?.details),
    })),
  };
}

/**
 * GET /global/index. Keyed by language: the admin copy is picked per language
 * in `select`, and the request itself carries `?lang=`, so a language switch
 * should not reuse the other language's answer.
 */
export function useHomeContent() {
  const { lang } = useLang();
  return useQuery({
    queryKey: ["home-content", lang],
    queryFn: () => globalService.getHome(),
    select: (res) => toContent(res.data ?? {}, lang),
    staleTime: 5 * 60 * 1000,
  });
}
