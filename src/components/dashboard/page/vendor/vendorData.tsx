// Vendor-side content, standing in for the vendor API.
//
// Same conventions as `dashboardData` and `historyData`: chrome is i18n keys,
// records (job titles, customer names, money) are raw because the API owns them.

import type { LucideIcon } from "lucide-react";
import {
  AirVent, Banknote, CalendarCheck, CheckCircle2, Clock, CreditCard,
  Lightbulb, SprayCan, Star, Wallet, Wrench,
} from "lucide-react";
import { rangeSeries, type Kpi, type OverviewRange } from "@/components/dashboard/dashboardData";
import type { OrderStatus } from "@/components/dashboard/page/history/historyData";

/* ─────────────────────────── Overview ─────────────────────────── */

export const VENDOR_KPIS: Kpi[] = [
  { key: "openJobs", value: "3", icon: CalendarCheck, trend: { delta: "+1", tone: "brand" } },
  { key: "completed", value: "128", icon: CheckCircle2, trend: { delta: "", tone: "ok" } },
  { key: "earnings", value: "৳92.4k", icon: Wallet, trend: { delta: "+18%", tone: "ok" } },
  { key: "rating", value: "4.9", icon: Star, trend: { delta: "311", tone: "brand" } },
];

/**
 * Jobs per bucket for the overview chart, one figure per month tick.
 *
 * A vendor works several jobs a day where a single customer books a handful a
 * month, so this is its own month rather than the customer's — but it goes
 * through the same `rangeSeries` builder, so Today / Week / Month agree
 * with each other exactly the way the customer's do.
 */
const MONTH_JOBS = [
  2, 3, 1, 4, 2, 3, 5, 2, 4, 3, 2, 4, 6, 3, 2, 5, 3, 2, 4, 5, 3, 6, 4, 3, 2, 4, 3, 5, 2, 4, 3,
];

const VENDOR_JOB_SERIES = rangeSeries(MONTH_JOBS);

export const vendorJobsFor = (range: OverviewRange) => VENDOR_JOB_SERIES[range];

/** The rating card's three numbers: the score, its ceiling, and the count. */
export const VENDOR_RATING = { score: "4.9", of: 5, reviews: 311 };

/** Money available to withdraw, and what is still held. */
export const VENDOR_BALANCE = {
  available: "৳ 42,180.00",
  pending: "৳ 8,450.00",
  lifetime: "৳ 92,400.00",
  minimum: "৳ 500.00",
};

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

export const PAYOUT_METHODS: { key: string; icon: LucideIcon; detail: string }[] = [
  { key: "bkash", icon: Banknote, detail: "···· 4412" },
  { key: "bank", icon: CreditCard, detail: "···· 8871" },
];

export type PayoutLog = {
  ref: string;
  requestedOn: string;
  method: string;
  amount: string;
  fee: string;
  received: string;
  status: OrderStatus;
  note: string;
};

export const PAYOUT_LOGS: PayoutLog[] = [
  { ref: "MO-77120", requestedOn: "12 Jun 2026", method: "bkash", amount: "৳ 12,000.00", fee: "৳ 120.00", received: "৳ 11,880.00", status: "completed", note: "Settled to bKash ···· 4412." },
  { ref: "MO-76884", requestedOn: "02 Jun 2026", method: "bank", amount: "৳ 25,000.00", fee: "৳ 250.00", received: "৳ 24,750.00", status: "completed", note: "Settled to bank ···· 8871." },
  { ref: "MO-76510", requestedOn: "27 May 2026", method: "bkash", amount: "৳ 6,500.00", fee: "৳ 65.00", received: "৳ 6,435.00", status: "processing", note: "Awaiting the payment partner." },
  { ref: "MO-76331", requestedOn: "18 May 2026", method: "bkash", amount: "৳ 3,000.00", fee: "৳ 30.00", received: "৳ 2,970.00", status: "pending", note: "Queued for the next payout run." },
];

export const PAYOUT_ICON: Record<string, LucideIcon> = { bkash: Banknote, bank: CreditCard, pending: Clock };
