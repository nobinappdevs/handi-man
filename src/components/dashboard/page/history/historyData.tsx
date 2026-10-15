// Order history — types and the small pure helpers every history screen maps
// the `/user/transaction` payload through.
//
// Built around `kind` from the start — the old dashboard has Service, Pickup
// and Delivery as three entries under History. Service stayed one component
// (`OrderHistory`, item-based); Pickup and Delivery turned out to share a
// different shape instead (a single parcel, a route) and became `ParcelLog`.
//
// The mock arrays that used to live here (`SERVICE_ORDERS`, `PICKUP_ORDERS`,
// `DELIVERY_ORDERS`) and their accessors are gone now that `/user/transaction`
// is wired up — same call as `vendorData.tsx` made when its endpoints landed.
// Each screen maps the raw rows into these same shapes itself (see
// `OrderHistory`, `PickupLog`, `DeliveryLog`), using the helpers below for the
// bits every one of the three needs: a status word, a payment method, an
// address type.

export type OrderKind = "service" | "pickup" | "delivery";

/** The three states the tracker draws, in order. Not the full status
 *  vocabulary — a canceled order never was a step on this bar, it left it. */
export const ORDER_STEPS = ["pending", "processing", "completed"] as const;

export type OrderStatus = "pending" | "processing" | "completed" | "canceled";

/** One line of a service order. `title` is the vendor's own service name —
 *  raw text from the API, never a catalogue lookup, because a booked order
 *  is not guaranteed to still match a catalogue entry. `thumbnail` is an
 *  absolute URL, or "" to fall back to a generic icon. */
export type OrderItem = {
  id: string | number;
  title: string;
  qty: number;
  /** Pre-formatted money — line total (unit price × quantity). */
  price: string;
  thumbnail: string;
};

export type ServiceOrder = {
  no: string;
  placedOn: string;
  /** i18n suffix under `dashboard.history.payment`. */
  payment: string;
  status: OrderStatus;
  items: OrderItem[];
  schedule: {
    name: string;
    /** i18n suffix under `dashboard.address.labels`. */
    addressLabel: string;
    date: string;
    time: string;
    address: string;
    phone: string;
  };
  totals: { subtotal: string; charge: string; discount: string; total: string };
};

/* ─────────────────────────── Delivery log ───────────────────────────
 * A parcel carries far more fields than a service order, and most of them are
 * blank most of the time. That is why this screen is a TABLE of the handful you
 * scan a log for, with the whole record behind a modal — see `ParcelLog`.
 */

export type DeliveryOrder = {
  no: string;
  status: OrderStatus;
  placedOn: string;
  /** Pre-formatted window; the API sends the date and the time separately. */
  schedule: string;
  /** i18n suffix under `dashboard.history.payment`. */
  payment: string;
  parcel: {
    name: string; brand: string; size: string; price: string;
    quantity: number; shop: string; shopAddress: string; details: string;
  };
  /** Where the rider collects. */
  pickup: { name: string; phone: string; addressLabel: string; address: string; landmark: string };
  /** Where it goes. */
  dropoff: { shortAddress: string; fullAddress: string; phone: string };
  totals: { subtotal: string; charge: string; total: string };
};

/* ─────────────────────────── Pickup log ───────────────────────────
 * The mirror image of a delivery: a rider comes to YOUR door, collects what
 * you already have, and carries it on to a destination. So it is the same
 * table — see `ParcelLog` — over a record that trades the shop fields for a
 * weight, which is what a courier quote is priced on.
 */

export type PickupOrder = {
  no: string;
  status: OrderStatus;
  placedOn: string;
  /** Pre-formatted window; the API sends the date and the time separately. */
  schedule: string;
  /** i18n suffix under `dashboard.history.payment`. */
  payment: string;
  parcel: {
    name: string; quantity: number; weight: string; price: string; details: string;
  };
  /** Where the rider collects — the customer's own door, usually. */
  collect: { name: string; phone: string; addressLabel: string; address: string; landmark: string };
  /** Where it goes afterwards. */
  dropoff: { shortAddress: string; fullAddress: string; phone: string };
  totals: { subtotal: string; charge: string; total: string };
};

/** Tone classes per status — same four-tone vocabulary as the jobs table. */
export const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-muted/16 text-muted",
  processing: "bg-warn/14 text-warn",
  completed: "bg-ok/14 text-ok",
  canceled: "bg-danger/14 text-danger",
};

/**
 * The API's own status word onto the four the pill and the tracker draw.
 *
 * Case-insensitive and reads the string ("Rejected", "Success") rather than
 * a numeric code, because the numbers are not documented anywhere in the
 * collection and the string is what the backend itself renders — same call
 * `VendorRecentJobs` makes for the vendor side. Anything unrecognised lands on
 * "pending", never "completed": a status this screen cannot place should
 * undersell the order, not oversell it.
 */
export function statusFromApi(raw?: string | number | null): OrderStatus {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "processing" || s === "progress") return "processing";
  if (s === "completed" || s === "complete" || s === "success") return "completed";
  if (s === "rejected" || s === "canceled" || s === "cancelled" || s === "declined") return "canceled";
  return "pending";
}

/**
 * `payment_type` + `gateway_name` onto the three words `dashboard.history.payment`
 * defines. The API's own values are `cash_on_delivery` / `online_payment` plus a
 * free-text gateway ("Stripe USD"), not the three-way split the design shows —
 * so this narrows it down rather than showing a raw gateway string as if it
 * were a translated label. Any online gateway this cannot place still reads as
 * "Card": it is the least wrong of the three for money that moved online.
 */
export function paymentKeyFor(paymentType?: string | null, gatewayName?: string | null): string {
  const type = String(paymentType ?? "").trim().toLowerCase();
  const gateway = String(gatewayName ?? "").trim().toLowerCase();
  if (type === "cash_on_delivery") return "cod";
  if (gateway.includes("bkash")) return "bkash";
  return "card";
}

/** `address_type` ("Work") onto `dashboard.address.labels`' three keys. */
export function addressLabelFor(raw?: string | null): "home" | "work" | "other" {
  const s = String(raw ?? "").trim().toLowerCase();
  return s === "home" || s === "work" ? s : "other";
}
