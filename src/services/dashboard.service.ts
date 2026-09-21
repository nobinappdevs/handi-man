import { privateApi, vendorPrivateApi } from "@/lib/axios";

/**
 * Both dashboards.
 *
 *   customer  GET /user/dashboard/cart_count
 *   vendor    GET /vendors/dashboard
 *
 * The customer path is the backend's, odd name and all; it long outgrew
 * counting a cart and now carries the wallet, the counters and a month's chart.
 *
 * They are NOT one shape, so there is no role factory here: the customer sends
 * a wallet object and charts three segments; the vendor sends a wallet string,
 * a currency, different counters and charts only `service`.
 */

/** The five buckets every chart segment is split into, one value per day. */
export interface DashboardStatusSeries {
  pending_data: number[];
  processing_data: number[];
  success_data: number[];
  canceled_data: number[];
  hold_data: number[];
}

export interface DashboardChart {
  /** ISO dates, one per bucket — the current month, so ~28-31 entries. */
  month_day: string[];
  service: DashboardStatusSeries;
  /** Customer only — a vendor has no pickups or deliveries of its own. */
  pickup?: DashboardStatusSeries;
  delivery?: DashboardStatusSeries;
}

export interface DashboardWallet {
  id: number;
  user_id: number;
  currency_id: number;
  balance: number;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserDashboardData {
  user_wallet?: DashboardWallet;
  complete_order: number;
  active_ticket: number;
  pending_ticket: number;
  /**
   * Optional on purpose: this block was added after the API collection was
   * captured, so an older backend answers without it. Every reader treats a
   * missing chart as "no data" rather than assuming it is there.
   */
  chart?: DashboardChart;
}

/** A line of a vendor order — one service within it. */
export interface VendorOrderDetail {
  service_name?: string;
  quantity?: string | number;
  item?: string;
  single_price?: number;
}

/**
 * A row of `order_log`.
 *
 * Typed from `/vendors/order/list`, which returns the same records — the
 * dashboard's own samples are all empty, so there was nothing to read there.
 * Everything is optional: this is the shape of another endpoint's rows, and
 * the screen degrades to a dash rather than assuming a field is present.
 *
 * Note what is NOT here: the customer's name and phone. The payload carries
 * only `user_id`, which is why the table shows the order's own details in
 * that column instead of a person.
 */
export interface VendorOrderRow {
  id?: number;
  trx_id?: string;
  /** 0-3; `stringStatus.value` is the readable form. */
  status?: number | string;
  stringStatus?: { class?: string; value?: string };
  attribute?: string;
  request_amount?: number;
  total_charge?: number;
  discount?: number;
  /** What the vendor is paid for this order. */
  payable?: number;
  reject_reason?: string | null;
  created_at?: string;
  order_details_info?: VendorOrderDetail[];
  [key: string]: unknown;
}

export interface VendorDashboardData {
  /** Wallet currency code, e.g. "USD". The customer payload has no twin. */
  currency: string;
  /** A STRING, and long: "987.80394322". Parse before formatting. */
  vendor_wallet: string | number;
  service_order: number;
  pending_order: number;
  active_ticket: number;
  chart?: DashboardChart;
  /** Recent orders, newest first. `VendorRecentJobs` draws these. */
  order_log?: VendorOrderRow[];
}

export const dashboardService = {
  /** GET /user/dashboard/cart_count — wallet, counters and the month's chart. */
  async getUserDashboard(): Promise<{ data: UserDashboardData }> {
    const res = await privateApi.get("/user/dashboard/cart_count");
    return res.data;
  },

  /** GET /vendors/dashboard — the vendor API root, so the vendor token. */
  async getVendorDashboard(): Promise<{ data: VendorDashboardData }> {
    const res = await vendorPrivateApi.get("/vendors/dashboard");
    return res.data;
  },
};

export default dashboardService;
