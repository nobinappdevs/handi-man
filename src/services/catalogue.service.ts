import { publicApi } from "@/lib/axios";

/**
 * GET /services - the public catalogue: every category, each with its live
 * services. Public, no auth; `?lang=` rides on the shared interceptor.
 *
 * Image fields are file NAMES; the folders come once at the top
 * (`base_url` + `service_image_path` / `category_image_path`) and the hook
 * joins them.
 */

export interface CatalogueServiceRecord {
  id: number;
  vendor_id?: number;
  category_id?: number;
  service_name: string;
  item?: string;
  price?: string | number;
  thumbnail?: string | null;
  status?: number;
}

export interface CatalogueCategoryRecord {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  status?: number;
  service?: CatalogueServiceRecord[];
  /** What the platform charges the CUSTOMER on this category's services. */
  fees?: { user_fixed_charge?: number | string; user_percent_charge?: number | string };
}

export interface CatalogueData {
  base_url?: string;
  service_image_path?: string;
  category_image_path?: string;
  default_image?: string;
  currency_code?: string;
  categories?: CatalogueCategoryRecord[];
}

export const catalogueService = {
  async getAll(): Promise<{ data: CatalogueData }> {
    const res = await publicApi.get("/services");
    return res.data;
  },
};

export default catalogueService;
