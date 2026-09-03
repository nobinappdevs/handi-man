// Order history, standing in for the orders API.
//
// Built around `kind` from the start — the old dashboard has Service, Pickup
// and Delivery as three entries under History, and they are the same screen
// with a different pool. Adding the other two is a data change, not a new
// component.

import type { LucideIcon } from "lucide-react";
import { AirVent, Lightbulb, Package, SprayCan, Wrench } from "lucide-react";

export type OrderKind = "service" | "pickup" | "delivery";

/** The three states the tracker draws, in order. */
export const ORDER_STEPS = ["pending", "processing", "completed"] as const;
export type OrderStatus = (typeof ORDER_STEPS)[number];

export type OrderItem = {
  /** Catalogue key — the title comes from the same copy the catalogue uses. */
  key: string;
  /** i18n namespace for the title. Defaults to `servicesPage.items`. */
  copyNs?: string;
  qty: number;
  /** Raw money, as the API will send it. */
  price: string;
  icon: LucideIcon;
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

const HOME_NS = "home.categoryGroups.items";

const SERVICE_ORDERS: ServiceOrder[] = [
  {
    no: "SO34338359",
    placedOn: "16 Jun 2026",
    payment: "cod",
    status: "completed",
    items: [{ key: "residentialCleaning", copyNs: HOME_NS, qty: 1, price: "15.00 USD", icon: SprayCan }],
    schedule: {
      name: "Rakib Hasan", addressLabel: "work", date: "18 Jun 2026",
      time: "9:00 AM – 10:00 AM", address: "Level 7, Bay Tower, Gulshan 1", phone: "+880 1712 345678",
    },
    totals: { subtotal: "15.00 USD", charge: "5.75 USD", discount: "0.00 USD", total: "20.75 USD" },
  },
  {
    no: "SO58969918",
    placedOn: "04 May 2026",
    payment: "card",
    status: "completed",
    items: [{ key: "acServiceGasRefill", qty: 1, price: "49.00 USD", icon: AirVent }],
    schedule: {
      name: "Rakib Hasan", addressLabel: "home", date: "06 May 2026",
      time: "2:00 PM – 4:00 PM", address: "House 12, Road 5, Mirpur, Dhaka", phone: "+880 1712 345678",
    },
    totals: { subtotal: "49.00 USD", charge: "5.75 USD", discount: "5.00 USD", total: "49.75 USD" },
  },
  {
    no: "SO43557361",
    placedOn: "30 Apr 2026",
    payment: "cod",
    status: "processing",
    items: [{ key: "lightingInstall", qty: 1, price: "28.00 USD", icon: Lightbulb }],
    schedule: {
      name: "Rakib Hasan", addressLabel: "home", date: "02 May 2026",
      time: "11:00 AM – 12:00 PM", address: "House 12, Road 5, Mirpur, Dhaka", phone: "+880 1712 345678",
    },
    totals: { subtotal: "28.00 USD", charge: "4.00 USD", discount: "0.00 USD", total: "32.00 USD" },
  },
  {
    no: "SO41220874",
    placedOn: "22 Apr 2026",
    payment: "bkash",
    status: "pending",
    items: [
      { key: "emergencyPlumbing", qty: 1, price: "32.00 USD", icon: Wrench },
      { key: "drainCleaning", qty: 2, price: "52.00 USD", icon: Package },
    ],
    schedule: {
      name: "Rakib Hasan", addressLabel: "home", date: "24 Apr 2026",
      time: "8:00 AM – 9:00 AM", address: "House 12, Road 5, Mirpur, Dhaka", phone: "+880 1712 345678",
    },
    totals: { subtotal: "84.00 USD", charge: "6.50 USD", discount: "0.00 USD", total: "90.50 USD" },
  },
];

/* ─────────────────────────── Delivery log ───────────────────────────
 * A parcel carries far more fields than a service order, and most of them are
 * blank most of the time. That is why this screen is a TABLE of the handful you
 * scan a log for, with the whole record behind a modal — see `DeliveryLog`.
 */

export type DeliveryOrder = {
  no: string;
  status: OrderStatus;
  placedOn: string;
  /** Pre-formatted window; the API sends it as one string. */
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

/* Blanks are kept as "" rather than dropped: the old screen rendered an empty
   row for each, and the modal needs to say "not given" instead of hiding the
   field, so the reader can tell a missing value from a missing row. */
const DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    no: "DO29476842",
    status: "pending",
    placedOn: "23 Mar 2026",
    schedule: "2:00 PM – 3:00 PM, 25 Mar 2026",
    payment: "cod",
    parcel: {
      name: "Documents envelope", brand: "", size: "A4", price: "",
      quantity: 1, shop: "", shopAddress: "", details: "Hand to reception only.",
    },
    pickup: {
      name: "Rakib Hasan", phone: "+880 1712 345678", addressLabel: "home",
      address: "House 12, Road 5, Mirpur, Dhaka", landmark: "Flat 3B, Rose Tower",
    },
    dropoff: { shortAddress: "Banani 11", fullAddress: "Road 11, Banani, Dhaka 1213", phone: "+880 1811 220044" },
    totals: { subtotal: "0.00 USD", charge: "5.00 USD", total: "5.00 USD" },
  },
  {
    no: "DO29455190",
    status: "processing",
    placedOn: "19 Mar 2026",
    schedule: "11:00 AM – 12:00 PM, 21 Mar 2026",
    payment: "bkash",
    parcel: {
      name: "Spare parts box", brand: "Bosch", size: "Medium", price: "42.00 USD",
      quantity: 2, shop: "Auto Mart", shopAddress: "Shop 4, Bijoy Sarani, Dhaka", details: "Fragile — do not stack.",
    },
    pickup: {
      name: "Rakib Hasan", phone: "+880 1712 345678", addressLabel: "work",
      address: "Level 7, Bay Tower, Gulshan 1", landmark: "",
    },
    dropoff: { shortAddress: "Uttara 7", fullAddress: "House 22, Sector 7, Uttara, Dhaka", phone: "+880 1912 778899" },
    totals: { subtotal: "42.00 USD", charge: "6.50 USD", total: "48.50 USD" },
  },
  {
    no: "DO29401773",
    status: "completed",
    placedOn: "28 Feb 2026",
    schedule: "4:00 PM – 5:00 PM, 01 Mar 2026",
    payment: "card",
    parcel: {
      name: "Gift box", brand: "", size: "Small", price: "18.00 USD",
      quantity: 1, shop: "Bloom & Co.", shopAddress: "Road 27, Dhanmondi, Dhaka", details: "",
    },
    pickup: {
      name: "Rakib Hasan", phone: "+880 1712 345678", addressLabel: "home",
      address: "House 12, Road 5, Mirpur, Dhaka", landmark: "Flat 3B, Rose Tower",
    },
    dropoff: { shortAddress: "Dhanmondi 27", fullAddress: "", phone: "" },
    totals: { subtotal: "18.00 USD", charge: "4.00 USD", total: "22.00 USD" },
  },
];

export const deliveryOrders = () => DELIVERY_ORDERS;

export const findDelivery = (no: string | null) =>
  no ? (DELIVERY_ORDERS.find((o) => o.no === no) ?? null) : null;

/** Pickup arrives later; the screen already handles an empty pool. */
const ORDERS: Record<OrderKind, ServiceOrder[]> = {
  service: SERVICE_ORDERS,
  pickup: [],
  delivery: [],
};

export const ordersFor = (kind: OrderKind) => ORDERS[kind] ?? [];

export const findOrder = (kind: OrderKind, no: string | null) =>
  no ? (ordersFor(kind).find((o) => o.no === no) ?? null) : null;

/** Tone classes per status — same four-tone vocabulary as the jobs table. */
export const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-muted/16 text-muted",
  processing: "bg-warn/14 text-warn",
  completed: "bg-ok/14 text-ok",
};
