import { vendorPrivateApi } from "@/lib/axios";

/**
 * A vendor's service listings - the vendor API root, so the vendor token.
 *
 *   GET  /vendors/service/list            every listing, no paging
 *   GET  /vendors/service/preview         the form's options: states, cities, categories
 *   GET  /vendors/service/edit    ?id=    one listing, to fill the edit form
 *   POST /vendors/service/store           multipart - create (thumbnail required)
 *   POST /vendors/service/update          multipart - `target` + the same fields
 *   POST /vendors/service/delete  ?target=
 *
 * The listing's image is NOT a URL: the response carries `base_url` and
 * `service_image_path` once, and each row only its file name. The hook joins
 * them; a row without a thumbnail falls back to `default_image`.
 *
 * `details` arrives as HTML from the old rich-text editor. Nothing here renders
 * it as markup - the hook strips it to text for the card and the edit form.
 */

export interface ServiceStatusTag {
  /** A Bootstrap badge class: "badge badge--info", "badge--warning", … */
  class?: string;
  value?: string;
}

export interface VendorServiceRecord {
  id: number;
  category_id?: number | string;
  /** The category's name - list only. */
  category?: string;
  state_id?: number | string;
  city_id?: number | string;
  service_name: string;
  item?: string;
  price?: string | number;
  details?: string;
  thumbnail?: string | null;
  status?: number | string;
  rejected_reason?: string | null;
  /** `list` spells it with an underscore… */
  string_status?: ServiceStatusTag;
  /** …and `edit` in camelCase. */
  stringStatus?: ServiceStatusTag;
}

interface ImagePaths {
  base_url?: string;
  default_image?: string;
  service_image_path?: string;
}

export interface VendorServiceListData extends ImagePaths {
  services?: VendorServiceRecord[];
}

export interface VendorServiceEditData extends ImagePaths {
  service?: VendorServiceRecord;
}

export interface ServiceOptionState {
  id: number;
  name: string;
}

export interface ServiceOptionCity {
  id: number;
  state_id: number;
  name: string;
}

export interface ServiceOptionCategory {
  id: number;
  name: string;
}

export interface ServiceFormOptionsData {
  state?: ServiceOptionState[];
  city?: ServiceOptionCity[];
  category?: ServiceOptionCategory[];
}

/** The fields `store` and `update` share, in the API's own names. */
export interface ServicePayload {
  state_id: string;
  city_id: string;
  category_id: string;
  service_name: string;
  item: string;
  price: string;
  details: string;
  /** Required to create; on update, omitted keeps the current image. */
  thumbnail?: File;
}

function toForm(payload: ServicePayload & { target?: number }) {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    form.append(key, value instanceof File ? value : String(value));
  }
  return form;
}

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const vendorServiceService = {
  /** GET /vendors/service/list */
  async list(): Promise<{ data: VendorServiceListData }> {
    const res = await vendorPrivateApi.get("/vendors/service/list");
    return res.data;
  },

  /** GET /vendors/service/preview */
  async formOptions(): Promise<{ data: ServiceFormOptionsData }> {
    const res = await vendorPrivateApi.get("/vendors/service/preview");
    return res.data;
  },

  /** GET /vendors/service/edit?id= */
  async get(id: number): Promise<{ data: VendorServiceEditData }> {
    const res = await vendorPrivateApi.get("/vendors/service/edit", { params: { id } });
    return res.data;
  },

  /** POST /vendors/service/store */
  async create(payload: ServicePayload) {
    const res = await vendorPrivateApi.post("/vendors/service/store", toForm(payload), multipart);
    return res.data;
  },

  /** POST /vendors/service/update */
  async update(id: number, payload: ServicePayload) {
    const res = await vendorPrivateApi.post(
      "/vendors/service/update",
      toForm({ ...payload, target: id }),
      multipart,
    );
    return res.data;
  },

  /** POST /vendors/service/delete?target= */
  async remove(id: number) {
    const res = await vendorPrivateApi.post("/vendors/service/delete", null, { params: { target: id } });
    return res.data;
  },
};

export default vendorServiceService;
