import { privateApi } from "@/lib/axios";
import type { AddressRequest, SavedAddress } from "@/schemas/address.schema";
import type { PaymentSummary } from "@/lib/pendingPayment";

/**
 * The checkout half of a delivery or a pickup order - the same three
 * requests, one path segment apart (customer API, signed in):
 *
 *   GET  /user/{kind}/preview?identifier=   everything the checkout page needs
 *   POST /user/{kind}/my-address/save       a new address, from the checkout page
 *   POST /user/{kind}/checkout              schedule + address + payment → the order
 *
 * The first half - saving the item list for an `identifier` - differs per kind
 * (a delivery item has a price and a shop, a pickup item a weight), so it lives
 * in `delivery.service` / `pickup.service`.
 *
 * Checkout answers one of three ways: Authorize.net with a transaction for the
 * site's own card form, any other gateway with its page to redirect to, and
 * cash or the wallet by simply succeeding.
 */

export type OrderKind = "delivery" | "pickup";

/** One saved line. Delivery lines carry price/brand/size/shop; pickup lines `kg`. */
export interface OrderLineRecord {
  name?: string;
  quantity?: string | number;
  brand_name?: string;
  size?: string;
  price?: string | number;
  shop?: string;
  shop_address?: string;
  kg?: string | number;
}

interface OrderInfo {
  identifier?: string;
  data?: { details?: string; order?: OrderLineRecord[] };
}

export interface ScheduleTimeRecord {
  id: number;
  start_time: string;
  end_time: string;
}

export interface GatewayCurrencyRecord {
  id: number;
  name: string;
  alias: string;
  currency_code: string;
  currency_symbol?: string;
  rate?: number | string;
  percent_charge?: number | string;
  fixed_charge?: number | string;
  min_limit?: number | string;
  max_limit?: number | string;
}

export interface GatewayRecord {
  id: number;
  alias?: string;
  type?: string;
  image?: string;
  currencies?: GatewayCurrencyRecord[];
}

export interface OrderPreviewData {
  fixed_charge?: number | string;
  /**
   * The order as saved. A pickup preview calls it `pickup_info` - and, per the
   * transaction history, so may a delivery one; `delivery_info` / `order_info`
   * are read too in case the backend settles on its own name.
   */
  delivery_info?: OrderInfo;
  pickup_info?: OrderInfo;
  order_info?: OrderInfo;
  /** "16-10-2026" - day-month-year. The hook rewrites them for checkout. */
  dates?: string[];
  scheduleTime?: ScheduleTimeRecord[];
  address?: SavedAddress[];
  gateways?: GatewayRecord[];
  paymentType?: { value: string; label_name?: string }[];
}

export interface OrderCheckoutPayload {
  identifier: string;
  payment_type: string;
  /** "16-Oct-2026". */
  schedule_date: string;
  /** "8:00 PM - 9:00 PM". */
  schedule_time: string;
  /** A saved address's id. */
  address: string;
  shortaddress: string;
  fulladdress: string;
  phone: string;
  /** A gateway currency alias, or "my_wallet". Required on every checkout -
   *  a cash order sends "my_wallet", as the old web form did. */
  currency: string;
}

export interface CheckoutResult {
  /** A redirect gateway's page - or, for Authorize, the API endpoint the
   *  card details are posted to. */
  url?: string;
  method?: string;
  /** "stripe", "paypal", … "authorize" - which kind of gateway answered. */
  identify?: string;
  alias?: string;
  payment_informations?: PaymentSummary & { trx?: string };
}

export const orderCheckoutService = {
  /** GET /user/{kind}/preview?identifier= */
  async preview(kind: OrderKind, identifier: string): Promise<{ data: OrderPreviewData }> {
    const res = await privateApi.get(`/user/${kind}/preview`, { params: { identifier } });
    return res.data;
  },

  /** POST /user/{kind}/my-address/save */
  async saveAddress(kind: OrderKind, payload: AddressRequest) {
    const res = await privateApi.post(`/user/${kind}/my-address/save`, payload);
    return res.data;
  },

  /**
   * POST /user/{kind}/checkout. `source` is WEB, and the gateway sends the
   * customer back to the two URLs passed here.
   *
   * `payment_type` is normalised to the two values the checkout accepts. The
   * pickup PREVIEW offers its cash option as `cash_on_pickup` ("Cash On
   * Pickup"), but the checkout only knows `cash_on_delivery` / `online_payment`
   * - sent as-is, `cash_on_pickup` answers "Order Place Successfully" and
   * saves nothing. So every non-online choice goes out as `cash_on_delivery`.
   */
  async checkout(
    kind: OrderKind,
    payload: OrderCheckoutPayload,
    returnUrls: { success_url: string; cancel_url: string },
  ): Promise<{ data?: CheckoutResult }> {
    const payment_type = payload.payment_type === "online_payment" ? "online_payment" : "cash_on_delivery";
    const res = await privateApi.post(`/user/${kind}/checkout`, {
      ...payload,
      payment_type,
      source: "WEB",
      ...returnUrls,
    });
    return res.data;
  },
};

export default orderCheckoutService;
