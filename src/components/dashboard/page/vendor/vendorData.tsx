// Vendor-side content, standing in for the vendor API.
//
// Same conventions as `dashboardData` and `historyData`: chrome is i18n keys,
// records (job titles, customer names, money) are raw because the API owns them.

import type { LucideIcon } from "lucide-react";
import {
  AirVent, Banknote, CalendarCheck, CheckCircle2, Clock, CreditCard,
  Lightbulb, SprayCan, Star, Wallet, Wrench,
} from "lucide-react";
import type { OrderStatus } from "@/components/dashboard/page/history/historyData";

/* ─────────────────────────── Overview ─────────────────────────── */

export const VENDOR_KPIS: {
  key: string;
  value: string;
  delta: string;
  deltaTone: "brand" | "ok";
  pct: number;
  icon: LucideIcon;
}[] = [
  { key: "openJobs", value: "3", delta: "+1", deltaTone: "brand", pct: 55, icon: CalendarCheck },
  { key: "completed", value: "128", delta: "", deltaTone: "ok", pct: 82, icon: CheckCircle2 },
  { key: "earnings", value: "৳92.4k", delta: "+18%", deltaTone: "ok", pct: 74, icon: Wallet },
  { key: "rating", value: "4.9", delta: "311", deltaTone: "brand", pct: 96, icon: Star },
];

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
  schedule: string;
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
    schedule: "9:00 AM – 10:00 AM, 18 Jun 2026", address: "Level 7, Bay Tower, Gulshan 1",
    status: "pending", payment: "cod",
    totals: { subtotal: "15.00 USD", charge: "2.25 USD", payout: "12.75 USD" },
  },
  {
    no: "SO58969918", serviceKey: "acServiceGasRefill", icon: AirVent,
    customer: "Nusrat Jahan", phone: "+880 1811 220044", placedOn: "04 May 2026",
    schedule: "2:00 PM – 4:00 PM, 06 May 2026", address: "House 12, Road 5, Mirpur, Dhaka",
    status: "processing", payment: "card",
    totals: { subtotal: "49.00 USD", charge: "7.35 USD", payout: "41.65 USD" },
  },
  {
    no: "SO43557361", serviceKey: "lightingInstall", icon: Lightbulb,
    customer: "Tanvir Ahmed", phone: "+880 1912 778899", placedOn: "30 Apr 2026",
    schedule: "11:00 AM – 12:00 PM, 02 May 2026", address: "Road 11, Banani, Dhaka 1213",
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
