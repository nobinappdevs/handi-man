import { privateApi } from "@/lib/axios";

/**
 * The customer's order history — `GET /user/transaction`.
 *
 * One endpoint, three pools: `service_orders`, `pickup_orders` and
 * `delivery_orders`, each shaped differently (a service order carries line
 * items; a parcel order carries a single parcel and a route). The three
 * history screens each map their own pool into the shape they render — see
 * `historyData.tsx` for the shared status/payment/address helpers and
 * `OrderHistory` / `PickupLog` / `DeliveryLog` for the mapping itself.
 *
 * Images are pieces, not URLs, same as the profile avatar (blueprint §14.3):
 * `base_url` is the storage root, `service_image_path` the directory a
 * service thumbnail lives in, and a line with no thumbnail falls back to
 * `default_image` — both already relative to `base_url`.
 */

/** One line of a service order — a booked service and its own price/charge. */
export interface ApiServiceInfo {
  id: number;
  service_name: string;
  quantity: string | number;
  item?: string;
  reject_reason?: string | null;
  single_price?: number | string;
  percent_charge?: number | string;
  fixed_charge?: number | string;
  discount?: number | string;
  service?: {
    thumbnail?: string;
    [key: string]: unknown;
  };
}

export interface ApiServiceOrder {
  trx: string;
  payment_type?: string;
  gateway_name?: string;
  request_amount: string;
  payable: string;
  currency?: string;
  payable_currency?: string;
  service_orders: {
    name?: string;
    address?: string;
    landmark?: string;
    address_type?: string;
    phone?: string;
    schedule_time?: string;
    schedule_date?: string;
    payment_type?: string;
  };
  status: string;
  date_time: string;
  service_info: ApiServiceInfo[];
}

export interface ApiPickupParcel {
  name?: string;
  quantity?: string | number;
  kg?: string | number;
}

export interface ApiPickupOrder {
  trx: string;
  payment_type?: string;
  gateway_name?: string;
  request_amount: string;
  payable: string;
  currency?: string;
  pickup_info: ApiPickupParcel[];
  name?: string;
  phone?: string;
  schedule_time?: string;
  schedule_date?: string;
  address_type?: string;
  address?: string;
  landmark?: string;
  shortaddress?: string;
  fulladdress?: string;
  delivery_phone?: string;
  status: string;
  date_time: string;
}

/** Named `pickup_info` by the API even on a delivery order — it is where the
 *  courier picks the parcel up FROM, same as it is on a pickup order. */
export interface ApiDeliveryParcel {
  name?: string;
  brand_name?: string;
  size?: string | null;
  price?: string | number | null;
  quantity?: string | number;
  shop?: string;
  shop_address?: string;
}

export interface ApiDeliveryOrder {
  trx: string;
  payment_type?: string;
  gateway_name?: string;
  request_amount: string;
  charge?: number | string;
  payable: string;
  currency?: string;
  pickup_info: ApiDeliveryParcel[];
  name?: string;
  phone?: string;
  schedule_time?: string;
  schedule_date?: string;
  address?: string;
  landmark?: string;
  shortaddress?: string;
  fulladdress?: string;
  delivery_phone?: string;
  status: string;
  date_time: string;
}

export interface UserTransactionData {
  base_url: string;
  default_image: string;
  service_image_path: string;
  service_orders: ApiServiceOrder[];
  pickup_orders: ApiPickupOrder[];
  delivery_orders: ApiDeliveryOrder[];
}

export const transactionService = {
  /** GET /user/transaction — the customer's service, pickup and delivery orders. */
  async getUserTransactions(): Promise<{ data: UserTransactionData }> {
    const res = await privateApi.get("/user/transaction");
    return res.data;
  },
};

export default transactionService;
