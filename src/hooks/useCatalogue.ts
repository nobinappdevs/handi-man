"use client";

import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/hooks/useLang";
import { catalogueService, type CatalogueData } from "@/services/catalogue.service";

export interface CatalogueService {
  id: number;
  name: string;
  item: string;
  price: number;
  image: string;
  /** The vendor's id - the payload carries no vendor name, so the card says
   *  "Vendor 1", as the old catalogue did. 0 when absent. */
  vendorId: number;
  categoryId: number;
}

/** The customer-side charge on a category: a fixed amount plus a percentage. */
export interface CategoryFees {
  fixed: number;
  percent: number;
}

export interface CatalogueCategory {
  id: number;
  name: string;
  /** The section's anchor: `#cat-<slug>`. */
  slug: string;
  image: string;
  services: CatalogueService[];
  fees: CategoryFees;
}

export interface Catalogue {
  currency: string;
  /** Only categories with at least one live service - an empty section is a
   *  heading over nothing. */
  categories: CatalogueCategory[];
  serviceCount: number;
}

/** The anchor a category's section carries, for the rail and for deep links. */
export const categoryAnchor = (slug: string) => `cat-${slug}`;

function joinUrl(base?: string, folder?: string, file?: string | null) {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  return [base?.replace(/\/+$/, ""), folder?.replace(/^\/+|\/+$/g, ""), file.replace(/^\/+/, "")]
    .filter(Boolean)
    .join("/");
}

function toCatalogue(d: CatalogueData): Catalogue {
  const fallback = joinUrl(d.base_url, "", d.default_image);
  const categories = (d.categories ?? [])
    .filter((c) => c.status === undefined || Number(c.status) === 1)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || String(c.id),
      image: joinUrl(d.base_url, d.category_image_path, c.image),
      fees: {
        fixed: Number(c.fees?.user_fixed_charge) || 0,
        percent: Number(c.fees?.user_percent_charge) || 0,
      },
      services: (c.service ?? [])
        .filter((s) => s.status === undefined || Number(s.status) === 1)
        .map((s) => ({
          id: s.id,
          name: s.service_name,
          item: s.item ?? "",
          price: Number(s.price) || 0,
          image: joinUrl(d.base_url, d.service_image_path, s.thumbnail) || fallback,
          vendorId: Number(s.vendor_id) || 0,
          categoryId: c.id,
        })),
    }))
    .filter((c) => c.services.length > 0);

  return {
    currency: d.currency_code ?? "",
    categories,
    serviceCount: categories.reduce((n, c) => n + c.services.length, 0),
  };
}

/** GET /services - keyed by language, as the request carries `?lang=`. */
export function useCatalogue() {
  const { lang } = useLang();
  return useQuery({
    queryKey: ["catalogue", lang],
    queryFn: () => catalogueService.getAll(),
    select: (res) => toCatalogue(res.data ?? {}),
    staleTime: 5 * 60 * 1000,
  });
}
