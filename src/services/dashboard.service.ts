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

/**
 * A row of `order_log` - the latest five service orders, newest first, as
 * the endpoint's own description documents them.
 *
 * Nothing on screen reads these: the overview's recent jobs come from
 * `/vendors/order/list`, whose rows also carry the service name, charge and
 * payable that these do not. Typed anyway so the shape is on record.
 */
export interface VendorOrderLogRow {
  id: number;
  trx_id: string;
  request_amount?: string | number;
  /** 1 completed, 2 pending, 3 rejected, 4 hold, 5 processing. */
  status: number;
  status_label?: string;
  /** True while pending. */
  can_accept?: boolean;
  can_reject?: boolean;
  /** True while processing. */
  can_complete?: boolean;
  created_at?: string;
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
  /** The latest five orders. See `VendorOrderLogRow`. */
  order_log?: VendorOrderLogRow[];
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
