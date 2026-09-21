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
  CheckCircle2,
  Clock,
  LifeBuoy,
  Wallet,
  MapPin,
  ShieldCheck,
  Wrench,
  Package,
  SprayCan,
  AirVent,
  User,
  SlidersHorizontal,
  IdCard,
  Receipt,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  Briefcase,
  CalendarClock,
  CalendarCheck,
  Truck,
  Star,
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
  | "pickupHistory"
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
  | "vendorKyc"
  | "vendorProfile"
  | "moneyOut"
  | "moneyOutLogs";

export const DASH_ROUTES: Record<PageKey, string> = {
  overview: "/dashboard",
  bookings: "/dashboard/bookings",
  deliveries: "/dashboard/deliveries",
  payments: "/dashboard/payments",
  vendors: "/dashboard/vendors",
  serviceHistory: "/dashboard/history/service",
  pickupHistory: "/dashboard/history/pickup",
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
  vendorKyc: "/vendors/dashboard/kyc",
  vendorProfile: "/vendors/dashboard/profile",
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
      { key: "pickupHistory", icon: ArrowUpFromLine },
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

/* The vendor's own account screens — its profile, verification and security —
   and the way out. Never the customer ones: different accounts, different API. */
const VENDOR_MENU: MenuItem[] = [
  { key: "vendorProfile", icon: User },
  { key: "vendorKyc", icon: IdCard },
  { key: "vendorTwoFa", icon: ShieldCheck },
  { key: "logout" as PageKey, icon: LogOut, danger: true },
];

export const profileMenuFor = (area: DashArea) =>
  area === "vendor" ? VENDOR_MENU : CUSTOMER_MENU;

/* ─────────────────────────── Notifications ───────────────────────────
 * What the header's bell drops down, per area — a customer hears about their
 * bookings and parcels, a vendor about job requests and payouts, so these are
 * two lists rather than one filtered.
 *
 * `page` rather than a URL string so a route rename cannot leave a dead
 * notification behind, and `at` is authored for the same reason every date
 * in this file is: a static export prerenders at BUILD time.
 */

export type Notification = {
  id: string;
  /** i18n suffix under `dashboard.notify.items` — title and body both. */
  key: string;
  icon: LucideIcon;
  /** Which screen answers it. Omit for one that is only news. */
  page?: PageKey;
  /** Pre-formatted age: "2 min ago", "Yesterday". */
  at: string;
  /** Icon-square tone. `warn` is a nudge, `danger` something that went wrong. */
  tone: "brand" | "ok" | "warn" | "danger";
  /** Unread until the reader opens it, or clears the lot. */
  unread: boolean;
};

const CUSTOMER_NOTIFICATIONS: Notification[] = [
  { id: "n1", key: "bookingConfirmed", icon: CalendarCheck, page: "serviceHistory", at: "2 min ago", tone: "ok", unread: true },
  { id: "n2", key: "riderOnTheWay", icon: Truck, page: "deliveryHistory", at: "18 min ago", tone: "brand", unread: true },
  { id: "n3", key: "paymentReceived", icon: Receipt, page: "serviceHistory", at: "1 hr ago", tone: "ok", unread: true },
  { id: "n4", key: "kycPending", icon: IdCard, page: "kyc", at: "Yesterday", tone: "warn", unread: false },
];

const VENDOR_NOTIFICATIONS: Notification[] = [
  { id: "v1", key: "newJob", icon: ClipboardList, page: "vendorOrders", at: "5 min ago", tone: "brand", unread: true },
  { id: "v2", key: "payoutSettled", icon: Banknote, page: "moneyOutLogs", at: "40 min ago", tone: "ok", unread: true },
  { id: "v3", key: "reviewLeft", icon: Star, at: "3 hr ago", tone: "brand", unread: false },
  { id: "v4", key: "listingPaused", icon: Briefcase, page: "vendorServices", at: "2 days ago", tone: "warn", unread: false },
];

export const notificationsFor = (area: DashArea) =>
  area === "vendor" ? VENDOR_NOTIFICATIONS : CUSTOMER_NOTIFICATIONS;

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
};

const SERVICE_ROWS: DashRow[] = [
  { title: "AC servicing — 1.5 ton split", ref: "BK-2288", vendor: "CoolAir Pros", meta: "4.9 · 320 jobs", day: "Today", time: "2:00 – 4:00 PM", status: "inProgress", kind: "active", amount: "৳ 1,850" },
  { title: "Kitchen tap leak repair", ref: "BK-2276", vendor: "Rahim Plumbing", meta: "4.8 · 512 jobs", day: "Tomorrow", time: "10:30 AM", status: "confirmed", kind: "ok", amount: "৳ 900" },
  { title: "Deep clean — 2 bedrooms", ref: "BK-2261", vendor: "Sparkle Home", meta: "4.7 · 208 jobs", day: "5 Sep", time: "9:00 AM", status: "awaitingVendor", kind: "wait", amount: "৳ 2,400" },
  { title: "Ceiling fan rewiring", ref: "BK-2247", vendor: "Volt & Co.", meta: "4.9 · 611 jobs", day: "29 Aug", time: "Completed", status: "completed", kind: "done", amount: "৳ 1,200" },
];

const DELIVERY_ROWS: DashRow[] = [
  { title: "Documents → Banani 11", ref: "HM-4471", vendor: "Shakil M.", meta: "Rider · 4.9", day: "Today", time: "Arriving 4:20 PM", status: "inTransit", kind: "active", amount: "৳ 120" },
  { title: "Spare parts → Uttara 7", ref: "HM-4466", vendor: "Nayeem R.", meta: "Rider · 4.8", day: "Today", time: "Picked up 11:05 AM", status: "atHub", kind: "wait", amount: "৳ 260" },
  { title: "Gift box → Dhanmondi 27", ref: "HM-4402", vendor: "Tanvir A.", meta: "Rider · 5.0", day: "31 Aug", time: "Delivered", status: "delivered", kind: "done", amount: "৳ 180" },
];

const PAYMENT_ROWS: DashRow[] = [
  { title: "Invoice — AC servicing", ref: "IN-9931", vendor: "CoolAir Pros", meta: "bKash ···· 4412", day: "Today", time: "Authorised", status: "pending", kind: "wait", amount: "৳ 1,850" },
  { title: "Invoice — Ceiling fan rewiring", ref: "IN-9902", vendor: "Volt & Co.", meta: "Card ···· 8871", day: "29 Aug", time: "Settled", status: "paid", kind: "done", amount: "৳ 1,200" },
  { title: "Refund — cancelled clean", ref: "RF-8814", vendor: "Sparkle Home", meta: "To bKash ···· 4412", day: "24 Aug", time: "Credited", status: "refunded", kind: "ok", amount: "৳ 600" },
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
  /** Currency or unit set beside the value — the balance's "USD". */
  unit?: string;
  icon: LucideIcon;
  /**
   * The delta and the note under it — one optional block rather than two loose
   * fields, because a figure either has a movement worth naming or it has
   * neither half. A ticket count does not: the customer's four cards carry no
   * trend at all and stop at the number.
   */
  trend?: { delta: string; tone: "brand" | "ok" };
};

export const KPIS: Kpi[] = [
  { key: "balance", value: "1,000.00", unit: "USD", icon: Wallet },
  { key: "completedServices", value: "6", icon: CheckCircle2 },
  { key: "activeTickets", value: "0", icon: LifeBuoy },
  { key: "pendingTickets", value: "0", icon: Clock },
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

/* ─────────────────────────── Order states ───────────────────────────
 * The four-state vocabulary every chart, pill and filter on both dashboards
 * shares. Kept in this order — it is the order the legends read in.
 */

export const STATUS_KEYS = ["pending", "processing", "completed", "canceled"] as const;
export type StatusKey = (typeof STATUS_KEYS)[number];

/* ─────────────────────────── Overview: the range switch ───────────────────
 * The overview is one screen with a Today / Week / Month switch above it, and
 * every figure on it — the stat cards, the chart, the period captions — is
 * read from the range. So the range is an overview's ONE piece of state and
 * everything below is derived from it; no panel keeps a second copy.
 *
 * All of it is authored rather than computed: a static export prerenders at
 * BUILD time, so an axis or a "this month" figure taken from `new Date()`
 * would bake the build date into the HTML and disagree with the client the
 * next day — the same trap `PageShell` documents for its date line. The API
 * will send it preformatted for the same reason.
 */

export const OVERVIEW_RANGES = ["today", "week", "month"] as const;
export type OverviewRange = (typeof OVERVIEW_RANGES)[number];

/*
 * The charts' mock data lived here: HOUR_AXIS / WEEK_AXIS / MONTH_AXIS,
 * MONTH_REQUESTS, rangeSeries, serviceSeriesFor, pickupSeriesFor,
 * deliverySeriesFor, TICKETS / ticketsFor, BALANCE and RANGE_SPANS.
 *
 * Every one of them is now a real figure: the dashboard endpoints return the
 * buckets, the counters and the balance, and `lib/dashboardSeries.ts` shapes
 * them. `RangeSeries` stays because `SegmentSeries` extends it.
 */

/** What one range's chart reads: everything, the completed part, the rest. */
export type RangeSeries = {
  labels: string[];
  totals: number[];
  completed: number[];
  pending: number[];
};

/** The month above the overview's heading, and each range's own date span. */
export const OVERVIEW_PERIOD = "September 2026";

/* `RANGE_SPANS` was here — three hard-coded date strings. Captions now come
   from `rangeCaption()`, which reads the API's own bucket dates. */

/* ─────────────────────────── Orders table ───────────────────────────
 * Its filter row: "all" plus the four states, in the DESIGN's order rather
 * than `STATUS_KEYS`' — the design leads with Completed, which is what a
 * reader scans for, where the state array follows an order's lifecycle.
 */
export const ORDER_FILTERS = ["all", "completed", "processing", "pending", "canceled"] as const;
export type OrderFilter = (typeof ORDER_FILTERS)[number];

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
      /* Verification and 2FA are account settings, not places a vendor works.
         They live in the profile dropdown beside Profile and Logout; the rail
         stays the jobs-to-be-done list. */
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
