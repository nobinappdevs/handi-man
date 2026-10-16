import { vendorPrivateApi } from "@/lib/axios";

/**
 * A vendor's service orders - the vendor API root, so the vendor token.
 *
 *   GET  /vendors/order/list             every order, newest first, no paging
 *   POST /vendors/order/view      {id}   one order WITH the customer's details
 *   PUT  /vendors/order/approved  ?id=   pending → processing
 *   POST /vendors/order/rejected  {id, reject_reason}
 *   POST /vendors/order/complete  {id}   processing → completed
 *   GET  /vendors/order/print     ?trx_id=   a link to the PDF, not the PDF
 *
 * `status` is a number, documented on `/vendors/dashboard`:
 * 1 completed, 2 pending, 3 rejected, 4 hold, 5 processing.
 *
 * `approved` takes its id in the QUERY, not the body - the collection's body
 * field is switched off - which is why it alone sends `params`.
 */

/** One service line of an order. */
export interface VendorOrderLine {
  service_name?: string;
  quantity?: string | number;
  item?: string;
  single_price?: number;
}

/** One cart line inside `details` - what `view` adds over `list`. */
export interface VendorOrderCartLine {
  id?: number;
  name?: string;
  qty?: number;
  price?: number;
  subtotal?: number;
  options?: { item?: string };
}

/** The customer and booking details. Only `view` sends these. */
export interface VendorOrderDetails {
  name?: string;
  phone?: string;
  address?: string;
  /** Flat / building / landmark - free text, e.g. "Road: 5, Flat: 3253". */
  landmark?: string | null;
  /** "home" / "work" / … */
  address_type?: string;
  /** A Google Maps link (or null) the customer pasted. */
  google_map?: string | null;
  schedule_date?: string;
  schedule_time?: string;
  payment_type?: string;
  cart_info?: VendorOrderCartLine[];
}

export interface VendorOrderRecord {
  id: number;
  trx_id: string;
  /** The service price, before the platform's charge. */
  request_amount?: number | string;
  total_charge?: number | string;
  discount?: number | string;
  /** What the customer pays: `request_amount + total_charge - discount`. */
  payable?: number | string;
  status: number | string;
  stringStatus?: { class?: string; value?: string };
  reject_reason?: string | null;
  attribute?: string;
  created_at?: string;
  details?: VendorOrderDetails;
  order_details_info?: VendorOrderLine[];
}

export interface VendorOrderListData {
  currency?: string;
  order?: VendorOrderRecord[];
}

export interface RejectOrderPayload {
  id: number;
  reject_reason: string;
}

export const vendorOrderService = {
  /** GET /vendors/order/list */
  async list(): Promise<{ data: VendorOrderListData }> {
    const res = await vendorPrivateApi.get("/vendors/order/list");
    return res.data;
  },

  /** POST /vendors/order/view - answers with a one-element `order` array. */
  async view(id: number): Promise<{ data: VendorOrderListData }> {
    const res = await vendorPrivateApi.post("/vendors/order/view", { id });
    return res.data;
  },

  /** PUT /vendors/order/approved?id= */
  async approve(id: number) {
    const res = await vendorPrivateApi.put("/vendors/order/approved", null, { params: { id } });
    return res.data;
  },

  /** POST /vendors/order/rejected */
  async reject(payload: RejectOrderPayload) {
    const res = await vendorPrivateApi.post("/vendors/order/rejected", payload);
    return res.data;
  },

  /** POST /vendors/order/complete */
  async complete(id: number) {
    const res = await vendorPrivateApi.post("/vendors/order/complete", { id });
    return res.data;
  },

  /** GET /vendors/order/print?trx_id= - `data.download_link` is the PDF. */
  async printLink(trxId: string): Promise<{ data: { download_link?: string } }> {
    const res = await vendorPrivateApi.get("/vendors/order/print", { params: { trx_id: trxId } });
    return res.data;
  },
};

export default vendorOrderService;
