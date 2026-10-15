// Vendor-side content, standing in for the vendor API.
//
// Same conventions as `dashboardData` and `historyData`: chrome is i18n keys,
// records (job titles, customer names, money) are raw because the API owns them.

import type { LucideIcon } from "lucide-react";
import {
  AirVent, CalendarCheck, CheckCircle2,
  Lightbulb, SprayCan, Star, Wallet, Wrench,
} from "lucide-react";
import { type Kpi } from "@/components/dashboard/dashboardData";
import type { OrderStatus } from "@/components/dashboard/page/history/historyData";

/* ─────────────────────────── Overview ─────────────────────────── */

export const VENDOR_KPIS: Kpi[] = [
  { key: "openJobs", value: "3", icon: CalendarCheck, trend: { delta: "+1", tone: "brand" } },
  { key: "completed", value: "128", icon: CheckCircle2, trend: { delta: "", tone: "ok" } },
  { key: "earnings", value: "৳92.4k", icon: Wallet, trend: { delta: "+18%", tone: "ok" } },
  { key: "rating", value: "4.9", icon: Star, trend: { delta: "311", tone: "brand" } },
];

/*
 * The job series, the rating and the balance were mocked here
 * (MONTH_JOBS / vendorJobsFor / VENDOR_RATING / VENDOR_BALANCE).
 *
 * They now come from `GET /vendors/dashboard`: the chart from its `chart`
 * block, the balance from `vendor_wallet` + `currency`. The rating has no
 * replacement - that payload carries no score and no review count - so the
 * card it fed shows `active_ticket` instead.
 */
/* ─────────────────────────── Service orders ───────────────────────────
 * The vendor's side of the same booking the customer sees in History.
 */

export type VendorOrder = {
  no: string;
  /** Catalogue key — title comes from the shared copy. */
  serviceKey: string;
  copyNs?: string;
  icon: LucideIcon;
  customer: string;
  phone: string;
  placedOn: string;
  /** Split in two so the design's table can stack the window under the date. */
  schedule: { date: string; time: string };
  address: string;
  status: OrderStatus;
  payment: string;
  totals: { subtotal: string; charge: string; payout: string };
};

const HOME_NS = "home.categoryGroups.items";

export const VENDOR_ORDERS: VendorOrder[] = [
  {
    no: "SO34338359", serviceKey: "residentialCleaning", copyNs: HOME_NS, icon: SprayCan,
    customer: "Rakib Hasan", phone: "+880 1712 345678", placedOn: "16 Jun 2026",
    schedule: { date: "18 Jun 2026", time: "9:00 AM – 10:00 AM" }, address: "Level 7, Bay Tower, Gulshan 1",
    status: "pending", payment: "cod",
    totals: { subtotal: "15.00 USD", charge: "2.25 USD", payout: "12.75 USD" },
  },
  {
    no: "SO58969918", serviceKey: "acServiceGasRefill", icon: AirVent,
    customer: "Nusrat Jahan", phone: "+880 1811 220044", placedOn: "04 May 2026",
    schedule: { date: "06 May 2026", time: "2:00 PM – 4:00 PM" }, address: "House 12, Road 5, Mirpur, Dhaka",
    status: "processing", payment: "card",
    totals: { subtotal: "49.00 USD", charge: "7.35 USD", payout: "41.65 USD" },
  },
  {
    no: "SO43557361", serviceKey: "lightingInstall", icon: Lightbulb,
    customer: "Tanvir Ahmed", phone: "+880 1912 778899", placedOn: "30 Apr 2026",
    schedule: { date: "02 May 2026", time: "11:00 AM – 12:00 PM" }, address: "Road 11, Banani, Dhaka 1213",
    status: "completed", payment: "bkash",
    totals: { subtotal: "28.00 USD", charge: "4.20 USD", payout: "23.80 USD" },
  },
];

export const findVendorOrder = (no: string | null) =>
  no ? (VENDOR_ORDERS.find((o) => o.no === no) ?? null) : null;

/* ─────────────────────────── Services offered ─────────────────────────── */

export type VendorService = {
  key: string;
  copyNs?: string;
  icon: LucideIcon;
  price: string;
  /** Live listings take bookings; paused ones stay on the account, hidden. */
  live: boolean;
  booked: number;
};

export const VENDOR_SERVICES: VendorService[] = [
  { key: "residentialCleaning", copyNs: HOME_NS, icon: SprayCan, price: "15 USD", live: true, booked: 62 },
  { key: "cleaningSolutions", copyNs: HOME_NS, icon: SprayCan, price: "10 USD", live: true, booked: 41 },
  { key: "acServiceGasRefill", icon: AirVent, price: "49 USD", live: true, booked: 18 },
  { key: "lightingInstall", icon: Lightbulb, price: "28 USD", live: false, booked: 7 },
  { key: "emergencyPlumbing", icon: Wrench, price: "32 USD", live: false, booked: 0 },
];

/* ─────────────────────────── Schedule ───────────────────────────
 * Grouped by day, because that is how a vendor reads their week.
 */

export type ScheduleSlot = {
  time: string;
  orderNo: string;
  serviceKey: string;
  copyNs?: string;
  icon: LucideIcon;
  customer: string;
  address: string;
  status: OrderStatus;
};

export const VENDOR_SCHEDULE: { dayKey: string; date: string; slots: ScheduleSlot[] }[] = [
  {
    dayKey: "today", date: "18 Jun 2026",
    slots: [
      { time: "9:00 – 10:00 AM", orderNo: "SO34338359", serviceKey: "residentialCleaning", copyNs: HOME_NS, icon: SprayCan, customer: "Rakib Hasan", address: "Level 7, Bay Tower, Gulshan 1", status: "pending" },
      { time: "2:00 – 4:00 PM", orderNo: "SO58969918", serviceKey: "acServiceGasRefill", icon: AirVent, customer: "Nusrat Jahan", address: "House 12, Road 5, Mirpur", status: "processing" },
    ],
  },
  {
    dayKey: "tomorrow", date: "19 Jun 2026",
    slots: [
      { time: "11:00 AM – 12:00 PM", orderNo: "SO43557361", serviceKey: "lightingInstall", icon: Lightbulb, customer: "Tanvir Ahmed", address: "Road 11, Banani", status: "pending" },
    ],
  },
  { dayKey: "later", date: "20 Jun 2026", slots: [] },
];

/* ─────────────────────────── Money out ─────────────────────────── */


/*
 * The payout history used to be mocked here (PayoutLog / PAYOUT_LOGS /
 * PAYOUT_ICON). It now comes from `transactions` on
 * `/vendors/money-out/info`, so the fixtures are gone rather than left
 * sitting beside a real screen inviting someone to wire them back.
 */

/* ─────────────────────────── Service listing options ───────────────────────────
 * The option lists behind "add a service".
 *
 * States and cities are proper nouns, so they are not translated — same call
 * as `CITIES` in `homepage/homeData`, and the API will own them. Cities are
 * nested under their state because the form's City select is driven by the
 * State above it: a flat list would happily let someone list a service in
 * Denver, Alaska.
 *
 * Categories are keys, not names — they resolve through
 * `home.categories.items.<key>`, the same strings the public rail and the
 * catalogue use, so a renamed category renames itself everywhere.
 */
export const SERVICE_REGIONS: { state: string; cities: string[] }[] = [
  { state: "Alaska", cities: ["Nome", "Anchorage", "Juneau"] },
  { state: "Colorado", cities: ["Denver", "Boulder", "Colorado Springs"] },
  { state: "Michigan", cities: ["Troy", "Detroit", "Ann Arbor"] },
  { state: "Oregon", cities: ["Portland", "Salem", "Eugene"] },
  { state: "Texas", cities: ["Austin", "Dallas", "Houston"] },
];

export const citiesIn = (state: string) =>
  SERVICE_REGIONS.find((r) => r.state === state)?.cities ?? [];

export const SERVICE_CATEGORY_KEYS = [
  "handyman",
  "cleaning",
  "delivery",
  "plumbing",
  "electrics",
  "acRepair",
  "beauty",
  "shifting",
] as const;
