import { privateApi, publicApi } from "@/lib/axios";
import type { AddressRequest, SavedAddress } from "@/schemas/address.schema";
import type { CheckoutResult, GatewayRecord, ScheduleTimeRecord } from "@/services/orderCheckout.service";

/**
 * Booking a service: browse one, review it, cart it, check out.
 *
 *   GET  /service/details?id=          public - the service, its vendor, its reviews
 *   POST /service/review               signed in - { service_id, review }
 *   GET  /user/service/date-time       the slots, the booking window, the gateways
 *   GET  /user/service/address         the customer's saved addresses
 *   POST /user/service/address/save    a new one, from the checkout
 *   POST /user/service/coupon/apply    { coupon } → its amount
 *   POST /user/service/checkout        the whole cart as `card_info`
 *
 * There is no server cart: `card_info` is the client's cart, JSON-encoded, in
 * the shape the old web form sent (see `CardInfoLine`).
 */

export interface ServiceReviewRecord {
  id?: number;
  review?: string;
  comment?: string;
  created_at?: string;
  user?: { first_name?: string; last_name?: string; username?: string; image?: string | null };
  [key: string]: unknown;
}

export interface ServiceDetailsData {
  base_url?: string;
  service_image_path?: string;
  currency_code?: string;
  default_image?: string;
  user_image?: string;
  serviceDetails?: {
    id: number;
    vendor_id?: number;
    image?: string | null;
    /** The vendor's display name - "Vendor 1". */
    vendor?: string;
    service_name: string;
    item?: string;
    price?: string | number;
    details?: string;
  };
  reviews?: ServiceReviewRecord[];
}

export interface ServiceDateTimeData {
  scheduleTime?: ScheduleTimeRecord[];
  /** The booking window, as a count of days from today. */
  dates?: { count_date?: string | number }[];
  gateways?: GatewayRecord[];
  paymentType?: { value: string; label_name?: string }[];
}

/** One cart line as `card_info` carries it - the old web form's shape. */
export interface CardInfoLine {
  rowId: string;
  id: number;
  name: string;
  qty: string;
  price: number;
  options: {
    thumbnail: string;
    item: string;
    cat_id: number;
    vendor_id: number;
    main_amount: number;
  };
  tax: string;
  subtotal: string;
}

export interface ServiceCheckoutPayload {
  payment_type: string;
  schedule_date: string;
  schedule_time: string;
  address: string;
  /** Gateway currency alias, or "my_wallet" - required even for cash. */
  currency: string;
  card_info: CardInfoLine[];
  coupon_amount: number;
}

export const serviceOrderService = {
  async details(id: number): Promise<{ data: ServiceDetailsData }> {
    const res = await publicApi.get("/service/details", { params: { id } });
    return res.data;
  },

  async review(serviceId: number, review: string) {
    const res = await privateApi.post("/service/review", { service_id: serviceId, review });
    return res.data;
  },

  async dateTime(): Promise<{ data: ServiceDateTimeData }> {
    const res = await privateApi.get("/user/service/date-time");
    return res.data;
  },

  async addresses(): Promise<{ data: { address?: SavedAddress[] } }> {
    const res = await privateApi.get("/user/service/address");
    return res.data;
  },

  async saveAddress(payload: AddressRequest) {
    const res = await privateApi.post("/user/service/address/save", payload);
    return res.data;
  },

  async applyCoupon(coupon: string): Promise<{ data?: { coupon?: { code?: string; amount?: number | string } } }> {
    const res = await privateApi.post("/user/service/coupon/apply", { coupon });
    return res.data;
  },

  /**
   * POST /user/service/checkout. `payment_type` is normalised to the two values
   * the checkout accepts, as `orderCheckout.service` does: the pickup preview
   * already offers a cash value (`cash_on_pickup`) its checkout silently
   * ignores, so a preview label is never trusted as the wire value.
   */
  async checkout(
    payload: ServiceCheckoutPayload,
    returnUrls: { success_url: string; cancel_url: string },
  ): Promise<{ data?: CheckoutResult }> {
    const res = await privateApi.post("/user/service/checkout", {
      ...payload,
      payment_type: payload.payment_type === "online_payment" ? "online_payment" : "cash_on_delivery",
      card_info: JSON.stringify(payload.card_info),
      source: "WEB",
      ...returnUrls,
    });
    return res.data;
  },
};

export default serviceOrderService;
