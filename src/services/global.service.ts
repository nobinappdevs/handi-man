import { publicApi } from "@/lib/axios";

/**
 * GET /global/index - the public home page's content, in one call.
 *
 * Every item comes with its file NAME only; the folder it lives in arrives
 * once, at the top (`base_url` + `category_image_path` / `service_image_path` /
 * `blog_image_path` / `site-section`), and the hook joins them.
 *
 * Copy written in the admin panel arrives in EVERY language at once, under
 * `language.<code>` - `?lang=` does not narrow it - so the hook picks the
 * visitor's and falls back to English.
 *
 * The section copy (`teams.value.language.*.title|heading|sub_heading`, the
 * banner's heading) is deliberately not typed here: the site's own section
 * titles are fixed design copy in `i18n/*.json`, and only the ITEMS come from
 * the API.
 */

/** `{ en: {...}, es: {...}, … }` */
export type Localized<T> = Partial<Record<string, T>>;

export interface GlobalCategory {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  status?: number;
  home?: number;
}

export interface GlobalService {
  id: number;
  vendor_id?: number;
  category_id?: number;
  service_name: string;
  item?: string;
  price?: string | number;
  thumbnail?: string | null;
  status?: number;
}

export interface GlobalTeamMember {
  id: string;
  image?: string | null;
  language?: Localized<{ name?: string; team_title?: string }>;
  /** `icon` is a Font Awesome class: "fab fa-instagram". */
  social_links?: { icon?: string; link?: string }[];
}

export interface GlobalAnnouncement {
  id: number;
  slug?: string;
  name?: { language?: Localized<{ name?: string }> };
  details?: { language?: Localized<{ details?: string }> };
  tags?: string[];
  image?: string | null;
  created_at?: string;
}

export interface GlobalIndexData {
  base_url?: string;
  "site-section"?: string;
  service_image_path?: string;
  category_image_path?: string;
  blog_image_path?: string;
  default_image?: string;
  currency_code?: string;
  categories?: GlobalCategory[];
  recommended_service?: GlobalService[];
  trending_service?: GlobalService[];
  teams?: { value?: { items?: Record<string, GlobalTeamMember> } };
  announcements?: GlobalAnnouncement[];
}

export const globalService = {
  /** GET /global/index - public, no auth. `lang` rides on the shared interceptor. */
  async getHome(): Promise<{ data: GlobalIndexData }> {
    const res = await publicApi.get("/global/index");
    return res.data;
  },
};

export default globalService;
