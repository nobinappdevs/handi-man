// Dashboard content, standing in for the account API.
//
// Same split as `homeData.tsx`: anything that is CHROME — nav labels, page
// headings, column headers, tab names, status words — is an i18n key resolved
// at render. Anything that is a RECORD — job titles, vendor names, references,
// money — is raw, because it is data the API will own and translating it would
// be wrong. Swap these constants for a React Query hook when the endpoints
// land; the components already read them through these shapes.

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Star,
  MapPin,
  ShieldCheck,
  Wrench,
  Zap,
  SprayCan,
  Package,
  AirVent,
  User,
  SlidersHorizontal,
  IdCard,
  Receipt,
  ArrowDownToLine,
  ClipboardList,
  Briefcase,
  CalendarClock,
  Banknote,
  ScrollText,
  LogOut,
} from "lucide-react";

/* ─────────────────────────── Routes ───────────────────────────
 * One entry per dashboard page. `key` is both the i18n namespace
 * (`dashboard.pages.<key>.*`) and the discriminator the view switches on, so a
 * page.tsx passes nothing but the key.
 */
export type PageKey =
  | "overview"
  | "bookings"
  | "deliveries"
  | "payments"
  | "vendors"
  | "serviceHistory"
  | "deliveryHistory"
  | "address"
  | "twoFa"
  | "kyc"
  | "settings"
  | "profile"
  /* ── vendor area ── */
  | "vendorOverview"
  | "vendorOrders"
  | "vendorServices"
  | "vendorSchedule"
  | "vendorTwoFa"
  | "moneyOut"
  | "moneyOutLogs";

export const DASH_ROUTES: Record<PageKey, string> = {
  overview: "/dashboard",
  bookings: "/dashboard/bookings",
  deliveries: "/dashboard/deliveries",
  payments: "/dashboard/payments",
  vendors: "/dashboard/vendors",
  serviceHistory: "/dashboard/history/service",
  deliveryHistory: "/dashboard/history/delivery",
  address: "/dashboard/address",
  twoFa: "/dashboard/2fa",
  kyc: "/dashboard/kyc",
  settings: "/dashboard/settings",
  profile: "/dashboard/profile",

  vendorOverview: "/vendors/dashboard",
  vendorOrders: "/vendors/dashboard/orders",
  vendorServices: "/vendors/dashboard/services",
  vendorSchedule: "/vendors/dashboard/schedule",
  vendorTwoFa: "/vendors/dashboard/2fa",
  moneyOut: "/vendors/dashboard/money-out",
  moneyOutLogs: "/vendors/dashboard/money-out/logs",
};

/**
 * The two dashboards.
 *
 * They are the same shell — rail, header, page head — with a different nav and
 * a different set of pages. Which one is showing is read from the URL rather
 * than threaded through the layout as a prop, because the chrome lives in a
 * layout that never sees which page rendered under it.
 */
export type DashArea = "customer" | "vendor";

export const VENDOR_ROOT = "/vendors/dashboard";

export const areaFromPath = (pathname: string): DashArea =>
  pathname === VENDOR_ROOT || pathname.startsWith(VENDOR_ROOT + "/") ? "vendor" : "customer";

/** Reverse of `DASH_ROUTES`, for chrome that only has the URL to go on. */
export function pageFromPath(pathname: string): PageKey {
  const hit = (Object.keys(DASH_ROUTES) as PageKey[]).find((k) => DASH_ROUTES[k] === pathname);
  return hit ?? (areaFromPath(pathname) === "vendor" ? "vendorOverview" : "overview");
}

type NavItem = { key: PageKey; icon: LucideIcon; count?: number };
type NavGroup = { key: string; items: NavItem[] };

/** Pick the rail for the area the URL is in. */
export const navGroupsFor = (area: DashArea) => (area === "vendor" ? VENDOR_NAV : CUSTOMER_NAV);

/** The customer rail, authored as the labelled groups it renders in. */
const CUSTOMER_NAV: NavGroup[] = [
  {
    key: "platform",
    items: [{ key: "overview", icon: LayoutDashboard }],
  },
  {
    key: "history",
    items: [
      { key: "serviceHistory", icon: Receipt },
      { key: "deliveryHistory", icon: ArrowDownToLine },
    ],
  },
  {
    key: "account",
    items: [
      { key: "address", icon: MapPin },
      { key: "twoFa", icon: ShieldCheck },
    ],
  },
];

type MenuItem = { key: PageKey; icon: LucideIcon; danger?: boolean };

/** The header's profile dropdown, per area. Sign out is the `danger` entry. */
const CUSTOMER_MENU: MenuItem[] = [
  { key: "profile", icon: User },
  { key: "settings", icon: SlidersHorizontal },
  { key: "twoFa", icon: ShieldCheck },
  { key: "kyc", icon: IdCard },
  { key: "logout" as PageKey, icon: LogOut, danger: true },
];

/* A vendor has no customer profile, address or KYC page to reach from here —
   only its own security screen and the way out. */
const VENDOR_MENU: MenuItem[] = [
  { key: "vendorTwoFa", icon: ShieldCheck },
  { key: "logout" as PageKey, icon: LogOut, danger: true },
];

export const profileMenuFor = (area: DashArea) =>
  area === "vendor" ? VENDOR_MENU : CUSTOMER_MENU;

/* ─────────────────────────── Table rows ───────────────────────────
 * `kind` drives both the status pill's colour and the Active/Completed
 * filter, so it is the one field here that is NOT free text.
 */
export type RowKind = "active" | "ok" | "wait" | "done";

export type DashRow = {
  title: string;
  ref: string;
  vendor: string;
  meta: string;
  day: string;
  time: string;
  /** i18n key under `dashboard.status.*`. */
  status: string;
  kind: RowKind;
  amount: string;
  icon: LucideIcon;
};

const SERVICE_ROWS: DashRow[] = [
  { title: "AC servicing — 1.5 ton split", ref: "BK-2288", vendor: "CoolAir Pros", meta: "4.9 · 320 jobs", day: "Today", time: "2:00 – 4:00 PM", status: "inProgress", kind: "active", amount: "৳ 1,850", icon: AirVent },
  { title: "Kitchen tap leak repair", ref: "BK-2276", vendor: "Rahim Plumbing", meta: "4.8 · 512 jobs", day: "Tomorrow", time: "10:30 AM", status: "confirmed", kind: "ok", amount: "৳ 900", icon: Wrench },
  { title: "Deep clean — 2 bedrooms", ref: "BK-2261", vendor: "Sparkle Home", meta: "4.7 · 208 jobs", day: "5 Sep", time: "9:00 AM", status: "awaitingVendor", kind: "wait", amount: "৳ 2,400", icon: SprayCan },
  { title: "Ceiling fan rewiring", ref: "BK-2247", vendor: "Volt & Co.", meta: "4.9 · 611 jobs", day: "29 Aug", time: "Completed", status: "completed", kind: "done", amount: "৳ 1,200", icon: Zap },
];

const DELIVERY_ROWS: DashRow[] = [
  { title: "Documents → Banani 11", ref: "HM-4471", vendor: "Shakil M.", meta: "Rider · 4.9", day: "Today", time: "Arriving 4:20 PM", status: "inTransit", kind: "active", amount: "৳ 120", icon: Package },
  { title: "Spare parts → Uttara 7", ref: "HM-4466", vendor: "Nayeem R.", meta: "Rider · 4.8", day: "Today", time: "Picked up 11:05 AM", status: "atHub", kind: "wait", amount: "৳ 260", icon: Package },
  { title: "Gift box → Dhanmondi 27", ref: "HM-4402", vendor: "Tanvir A.", meta: "Rider · 5.0", day: "31 Aug", time: "Delivered", status: "delivered", kind: "done", amount: "৳ 180", icon: Package },
];

const PAYMENT_ROWS: DashRow[] = [
  { title: "Invoice — AC servicing", ref: "IN-9931", vendor: "CoolAir Pros", meta: "bKash ···· 4412", day: "Today", time: "Authorised", status: "pending", kind: "wait", amount: "৳ 1,850", icon: CreditCard },
  { title: "Invoice — Ceiling fan rewiring", ref: "IN-9902", vendor: "Volt & Co.", meta: "Card ···· 8871", day: "29 Aug", time: "Settled", status: "paid", kind: "done", amount: "৳ 1,200", icon: CreditCard },
  { title: "Refund — cancelled clean", ref: "RF-8814", vendor: "Sparkle Home", meta: "To bKash ···· 4412", day: "24 Aug", time: "Credited", status: "refunded", kind: "ok", amount: "৳ 600", icon: CreditCard },
];

/**
 * Which rows a page shows. Everything that is not a dedicated list (Overview,
 * Saved vendors, My address, 2FA, Settings, Profile) gets the interleaved
 * "recent activity" mix the design specifies — service, parcel, service,
 * parcel, service — rather than one type in a row.
 */
export function rowsFor(page: PageKey): DashRow[] {
  if (page === "bookings") return SERVICE_ROWS;
  if (page === "deliveries") return DELIVERY_ROWS;
  if (page === "payments") return PAYMENT_ROWS;
  return [SERVICE_ROWS[0], DELIVERY_ROWS[0], SERVICE_ROWS[1], DELIVERY_ROWS[1], SERVICE_ROWS[2]];
}

export const TAB_KEYS = ["all", "active", "completed"] as const;
export type TabKey = (typeof TAB_KEYS)[number];

export function filterRows(rows: DashRow[], tab: TabKey): DashRow[] {
  if (tab === "all") return rows;
  if (tab === "active") return rows.filter((r) => r.kind !== "done");
  return rows.filter((r) => r.kind === "done");
}

/* ─────────────────────────── Side panels ─────────────────────────── */

export type Kpi = {
  key: string;
  value: string;
  delta: string;
  /** `brand` for a neutral/positive brand note, `ok` for a good-news delta. */
  deltaTone: "brand" | "ok";
  pct: number;
  icon: LucideIcon;
};

export const KPIS: Kpi[] = [
  { key: "activeBookings", value: "4", delta: "+2", deltaTone: "brand", pct: 62, icon: CalendarCheck },
  { key: "parcelsInTransit", value: "2", delta: "", deltaTone: "ok", pct: 45, icon: Package },
  { key: "spend", value: "৳8.4k", delta: "-12%", deltaTone: "ok", pct: 70, icon: CreditCard },
  { key: "savedVendors", value: "12", delta: "3", deltaTone: "brand", pct: 34, icon: Star },
];

/** The live parcel on the tracker card. `state` drives dot size, ring and ink. */
export type TrackStep = { key: string; time: string; state: "done" | "now" | "next" };

export const PARCEL = {
  ref: "HM-4471",
  route: "Mirpur 10 → Banani 11",
  rider: "Shakil M.",
  eta: "4:20 PM",
  steps: [
    { key: "pickedUp", time: "10:42 AM", state: "done" },
    { key: "atHub", time: "12:15 PM", state: "done" },
    { key: "outForDelivery", time: "3:30 PM", state: "now" },
    { key: "delivered", time: "Est. 4:20 PM", state: "next" },
  ] satisfies TrackStep[],
};

export const SPEND_TOTAL = "৳ 8,450";

/** `fill` is a Tailwind background class — three steps down the plum ramp. */
export const SPEND: { key: string; amount: string; pct: number; fill: string }[] = [
  { key: "repairs", amount: "৳ 3,950", pct: 47, fill: "bg-primary" },
  { key: "cleaning", amount: "৳ 2,400", pct: 28, fill: "bg-primary-lite" },
  { key: "delivery", amount: "৳ 2,100", pct: 25, fill: "bg-muted" },
];

export const QUICK_ACTIONS: { key: string; icon: LucideIcon }[] = [
  { key: "rebook", icon: Wrench },
  { key: "sendParcel", icon: Package },
  { key: "addAddress", icon: MapPin },
];

/**
 * The vendor rail.
 *
 * Money Out is a group rather than two loose entries because the payout screen
 * and its log belong together — the same shape History uses for its three
 * order types.
 */
const VENDOR_NAV: NavGroup[] = [
  {
    key: "platform",
    items: [
      { key: "vendorOverview", icon: LayoutDashboard },
      { key: "vendorOrders", icon: ClipboardList, count: 3 },
      { key: "vendorServices", icon: Briefcase },
      { key: "vendorSchedule", icon: CalendarClock },
      { key: "vendorTwoFa", icon: ShieldCheck },
    ],
  },
  {
    key: "moneyOut",
    items: [
      { key: "moneyOut", icon: Banknote },
      { key: "moneyOutLogs", icon: ScrollText },
    ],
  },
];
