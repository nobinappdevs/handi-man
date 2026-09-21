import { privateApi } from "@/lib/axios";
import { addressRequestSchema, type AddressRequest, type SavedAddress } from "@/schemas/address.schema";

/**
 * Saved addresses — `…/api/v1/user/address*`.
 *
 * Customer-only: the collection documents no vendor equivalent, and a vendor
 * has a business address on its profile rather than a delivery book. No role
 * factory for that reason.
 *
 * This file used to be a `localStorage` stand-in, written so that only IT would
 * change when the endpoint landed. That held — the hooks and the screen kept
 * their shape; what moved is the field names, which are the API's now.
 *
 * ── How the API identifies a row ──
 * Every write takes the id as `target`, in the BODY, never in the path. The
 * list is the only GET.
 *
 * `target` must be a STRING. The list returns `id` as a number, and JSON
 * serialises it as one, which the backend rejects with "The target must be a
 * string." - the collection sends these as form-data, where everything is
 * text, so the rule is invisible there. `String(id)` at every call site.
 */
export const addressService = {
  /** GET /user/address — every saved address, full records. */
  async list(): Promise<{ data: SavedAddress[] }> {
    const res = await privateApi.get("/user/address");
    return res.data;
  },

  /**
   * GET /user/address/edit?target=<id> — one row.
   *
   * Wired for completeness; the screen does not call it. `list` already returns
   * every field the edit form needs, so opening the dialog costs no request,
   * and this endpoint has no documented response shape to rely on. Reach for it
   * only if the backend starts returning something here the list does not.
   */
  async edit(id: number | string) {
    const res = await privateApi.get("/user/address/edit", { params: { target: id } });
    return res.data;
  },

  /** POST /user/address/store */
  async create(payload: AddressRequest) {
    const body = addressRequestSchema.parse(payload);
    const res = await privateApi.post("/user/address/store", body);
    return res.data;
  },

  /** POST /user/address/update — the id rides along as `target`. */
  async update(id: number | string, payload: AddressRequest) {
    const body = addressRequestSchema.parse(payload);
    const res = await privateApi.post("/user/address/update", { ...body, target: String(id) });
    return res.data;
  },

  /** POST /user/address/delete */
  async remove(id: number | string) {
    const res = await privateApi.post("/user/address/delete", { target: String(id) });
    return res.data;
  },
};

export default addressService;
