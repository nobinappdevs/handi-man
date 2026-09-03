// Content for the landing sections.
//
// This is placeholder data standing in for the catalogue API. When the
// endpoints land, replace these constants with a React Query hook
// (`hooks/useHome.ts` → `services/home.service.ts`); the section components
// already read everything through the same shapes.
//
// Labels are i18n keys, not strings — the pro counts and city names are raw
// data that the API will own.

import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";

import teamOne from "@public/assets/team/team1.webp";
import teamTwo from "@public/assets/team/team2.webp";
import teamThree from "@public/assets/team/team3.webp";
import teamFour from "@public/assets/team/team4.webp";

import avatarOne from "@public/assets/testimonials/avatar-1.webp";
import avatarTwo from "@public/assets/testimonials/avatar-2.webp";
import avatarThree from "@public/assets/testimonials/avatar-3.webp";
import avatarFour from "@public/assets/testimonials/avatar-4.webp";

import cleaningTeam from "@public/assets/services/cleaning-team.webp";
import homeVacuum from "@public/assets/services/home-vacuum.webp";
import janitorialCart from "@public/assets/services/janitorial-cart.webp";
import autoDiagnosticsPhoto from "@public/assets/services/auto-diagnostics.webp";
import engineService from "@public/assets/services/engine-service.webp";
import gearbox from "@public/assets/services/gearbox.webp";
import suspensionPhoto from "@public/assets/services/suspension.webp";
/* Stand-in for any card that has no photo of its own yet. */
import genericService from "@public/assets/home/oneinall.webp";

/* ─────────────────────────── Category icons ───────────────────────────
 * Drawn to match the design's own glyph set; lucide has no equivalent for
 * several of them, so the paths are kept verbatim.
 */
const iconProps = {
  width: 21,
  height: 21,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const HandymanIcon = (
  <svg {...iconProps}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z" />
  </svg>
);

const CleaningIcon = (
  <svg {...iconProps}>
    <path d="M8 3h4l1 7H7l1-7zM7 10h6l1 5H6l1-5zM6 15h8v6H6z" />
  </svg>
);

const DeliveryIcon = (
  <svg {...iconProps}>
    <path d="M2 7h11v9H2zM13 10h4l4 3v3h-8z" />
    <circle cx="6" cy="18.5" r="1.8" />
    <circle cx="17" cy="18.5" r="1.8" />
  </svg>
);

const PlumbingIcon = (
  <svg {...iconProps}>
    <path d="M9 3v6M15 3v6M6 9h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V9zM12 18v3" />
  </svg>
);

const ElectricsIcon = (
  <svg {...iconProps}>
    <path d="M13 2L5 13h6l-1 9 8-11h-6l1-9z" />
  </svg>
);

const AcRepairIcon = (
  <svg {...iconProps}>
    <path d="M3 5h18v7H3zM6 15v3M12 15v4M18 15v3" />
  </svg>
);

const BeautyIcon = (
  <svg {...iconProps}>
    <circle cx="6" cy="18" r="2.6" />
    <circle cx="18" cy="18" r="2.6" />
    <path d="M8 16L18 4M16 16L6 4" />
  </svg>
);

const ShiftingIcon = (
  <svg {...iconProps}>
    <path d="M3 9l9-6 9 6v11H3zM9 20v-7h6v7" />
  </svg>
);

/* ─────────────────────────── Categories ─────────────────────────── */

export type Category = {
  /** i18n key suffix under `home.categories.items`. */
  key: string;
  /** Number of verified pros, or `null` for the always-on delivery tile. */
  pros: number | null;
  icon: ReactNode;
};

export const CATEGORIES: Category[] = [
  { key: "handyman", pros: 312, icon: HandymanIcon },
  { key: "cleaning", pros: 184, icon: CleaningIcon },
  { key: "delivery", pros: null, icon: DeliveryIcon },
  { key: "plumbing", pros: 146, icon: PlumbingIcon },
  { key: "electrics", pros: 88, icon: ElectricsIcon },
  { key: "acRepair", pros: 97, icon: AcRepairIcon },
  { key: "beauty", pros: 78, icon: BeautyIcon },
  { key: "shifting", pros: 62, icon: ShiftingIcon },
];

/* ─────────────────────────── Hero ─────────────────────────── */

/** Service names offered by the hero band's dropdown (i18n key suffixes). */
export const SERVICE_KEYS = [
  "handyman",
  "cleaning",
  "acRepair",
  "plumbing",
  "parcelPickup",
  "beauty",
] as const;

/** Coverage cities. Proper nouns, so not translated — the API will own them. */
export const CITIES = ["Troy", "Nome", "Austin", "Portland", "Denver"] as const;

export const HERO_STATS = [
  { value: "60+", labelKey: "home.hero.stats.categories" },
  { value: "24/7", labelKey: "home.hero.stats.delivery" },
  { value: "4.9", labelKey: "home.hero.stats.rating" },
];

/* ─────────────────────────── About ─────────────────────────── */

export const ABOUT_CHECK_KEYS = [
  "marketplace",
  "tracking",
  "security",
  "payments",
  "scheduling",
  "support",
];

/* ─────────────────────────── Listings (Popular services) ───────────────────
 * Tabbed card grid. `key` resolves i18n title/unit; price and vendor are raw
 * catalogue data (not translated), same convention as `Category.pros`.
 */

export type ListingCard = { key: string; price: string; vendor: string };

export const LISTING_TABS: { key: string; cards: ListingCard[] }[] = [
  {
    key: "recommended",
    cards: [
      { key: "fitnessPotential", price: "10 USD", vendor: "Vendor 1" },
      { key: "totalBodyFitness", price: "15 USD", vendor: "Vendor 1" },
      { key: "kitchenBathroomDeepClean", price: "38 USD", vendor: "Vendor 2" },
      { key: "sameDayParcel", price: "12 USD", vendor: "Vendor 4" },
    ],
  },
  {
    key: "trending",
    cards: [
      { key: "acServiceGasRefill", price: "49 USD", vendor: "Vendor 3" },
      { key: "emergencyPlumbing", price: "32 USD", vendor: "Vendor 5" },
      { key: "electricalSafetyCheck", price: "55 USD", vendor: "Vendor 2" },
      { key: "salonAtHome", price: "28 USD", vendor: "Vendor 6" },
    ],
  },
];

/* ─────────────────────────── Category listing groups ───────────────────── */

export type GroupCard = {
  key: string;
  tag: string;
  price: string;
  vendor: string;
  photo: StaticImageData;
};

export const SERVICE_GROUPS: { key: string; cards: GroupCard[] }[] = [
  {
    key: "cleaning",
    cards: [
      { key: "cleaningSolutions", tag: "Home", price: "10 USD", vendor: "Vendor 1", photo: cleaningTeam },
      /* No deep-clean photo in the set yet — falls back to the generic pro. */
      { key: "deepCleaning", tag: "Home", price: "10 USD", vendor: "Vendor 1", photo: genericService },
      { key: "residentialCleaning", tag: "Residential", price: "15 USD", vendor: "Vendor 1", photo: homeVacuum },
      { key: "janitorial", tag: "Commercial", price: "12 USD", vendor: "Vendor 1", photo: janitorialCart },
    ],
  },
  {
    key: "mechanics",
    cards: [
      { key: "autoDiagnostics", tag: "Garage", price: "10 USD", vendor: "Vendor 1", photo: autoDiagnosticsPhoto },
      { key: "routineMaintenance", tag: "Garage", price: "15 USD", vendor: "Vendor 1", photo: engineService },
      { key: "transmission", tag: "Drivetrain", price: "12 USD", vendor: "Vendor 1", photo: gearbox },
      { key: "suspension", tag: "Chassis", price: "20 USD", vendor: "Vendor 1", photo: suspensionPhoto },
    ],
  },
];

/* ─────────────────────────── How it works ─────────────────────────── */

export type StepGlyph = ReactNode;

export const HOW_IT_WORKS_STEPS: { key: string; icon: StepGlyph }[] = [
  {
    key: "signUp",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </>
    ),
  },
  {
    key: "browseServices",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4.4-4.4" />
      </>
    ),
  },
  {
    key: "selectService",
    icon: (
      <>
        <path d="M9 11l3 3 8-8" />
        <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
      </>
    ),
  },
  {
    key: "placeOrder",
    icon: (
      <>
        <path d="M4 5h3l2.4 10.2A2 2 0 0 0 11.4 17h6.9a2 2 0 0 0 2-1.6L22 8H7" />
        <circle cx="11" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
      </>
    ),
  },
  {
    key: "connectVendor",
    icon: <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
  {
    key: "dedicatedTeams",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.4" />
        <path d="M2.5 21v-1.6A4.4 4.4 0 0 1 7 15h4a4.4 4.4 0 0 1 4.5 4.4V21" />
        <path d="M16.5 4.6a3.4 3.4 0 0 1 0 6.8M18.5 15.2A4.4 4.4 0 0 1 21.5 19.4V21" />
      </>
    ),
  },
  {
    key: "qualityService",
    icon: <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.4 6.7 19.2l1.1-5.9L3.5 9.2l5.9-.8z" />,
  },
  {
    key: "shareFeedback",
    icon: (
      <>
        <path d="M12 20.5l-3.6-3.6H5.5a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9.4a2 2 0 0 1-2 2h-2.9z" />
        <path d="M8.5 9h7M8.5 12.5h4.5" />
      </>
    ),
  },
];

/* ─────────────────────────── Impact (about-us stats) ───────────────────── */

export const IMPACT_FEATURE_KEYS = [
  "onDemand",
  "dedicatedTeams",
  "userFriendly",
  "budgetFriendly",
  "transparentPricing",
  "innovation",
];

export const IMPACT_STAT_KEYS = ["providers", "orders", "clients"];

/* ─────────────────────────── Team ─────────────────────────── */

const socialIconProps = {
  width: 13,
  height: 13,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const TEAM_SOCIAL_ICONS: ReactNode[] = [
  <svg key="x" {...socialIconProps} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>,
  <svg key="facebook" {...socialIconProps} fill="currentColor">
    <path d="M14 8h-2c-.6 0-1 .4-1 1v2h3l-.4 3H11v7H8v-7H6v-3h2V9c0-2.2 1.8-4 4-4h2v3z" />
  </svg>,
  <svg key="pinterest" {...socialIconProps} fill="currentColor">
    <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 0-2.9l1.2-5s-.3-.6-.3-1.4c0-1.4.8-2.4 1.8-2.4.8 0 1.3.6 1.3 1.4 0 .8-.6 2-.8 3.2-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-2.3 3.1-5 0-2.1-1.5-3.6-3.8-3.6-2.6 0-4.2 1.9-4.2 4 0 .7.2 1.2.5 1.6.1.1.1.2.1.4l-.3.9c0 .2-.2.3-.4.2-1.1-.4-1.6-1.7-1.6-3.1 0-2.3 2-5 5.9-5 3.2 0 5.3 2.3 5.3 4.7 0 3.2-1.8 5.6-4.4 5.6-.9 0-1.7-.5-2-1l-.5 2c-.2.8-.6 1.7-1 2.3.8.2 1.6.4 2.5.4a10 10 0 0 0 0-20z" />
  </svg>,
  <svg key="instagram" {...socialIconProps} fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>,
];

export type TeamMember = { key: string; photo: StaticImageData };

export const TEAM_MEMBERS: TeamMember[] = [
  { key: "owenBaxter", photo: teamOne },
  { key: "priyaNandan", photo: teamTwo },
  { key: "marcusCole", photo: teamThree },
  { key: "saraAhmed", photo: teamFour },
];

/* ─────────────────────────── Testimonials ─────────────────────────── */

/**
 * The testimonial wall, authored as the two columns it renders in rather than
 * as one flat list. The design offsets the second column against the first, so
 * which quote lands beside which is a layout decision — keeping it here means
 * the section never has to slice an array to find out.
 *
 * Keys resolve against `home.testimonials.items.*`.
 */
export const TESTIMONIAL_COLUMNS: string[][] = [
  ["nadiaKarim", "tomasRiley", "graceOkafor", "lukeMendes"],
  ["hannahBell", "devPatel", "amaraSolis", "victorNwosu"],
];

/**
 * Portraits, keyed by the same testimonial id.
 *
 * Four stock avatars cover eight quotes, so every face appears TWICE. The
 * pairing is not arbitrary - read down the two columns above and the sequence
 * is 1,2,3,4 against 3,4,1,2, which is the one arrangement where no avatar
 * ever lands next to or directly above its own repeat. Re-order
 * `TESTIMONIAL_COLUMNS` and that property is lost; re-check it here.
 *
 * Swap in eight real photos and the duplication just disappears - only the
 * right-hand side of these lines changes.
 *
 * Encode to 96x96 before adding one. The tile is 40px and `images.unoptimized`
 * ships the imported file byte-for-byte with no `srcset`, so a full-size
 * headshot here is a full-size headshot on every phone - blueprint 14.1.
 */
export const TESTIMONIAL_PHOTOS: Record<string, StaticImageData> = {
  // column 1
  nadiaKarim: avatarOne,
  tomasRiley: avatarTwo,
  graceOkafor: avatarThree,
  lukeMendes: avatarFour,
  // column 2 - same four, rotated by two so no repeat sits beside its twin
  hannahBell: avatarThree,
  devPatel: avatarFour,
  amaraSolis: avatarOne,
  victorNwosu: avatarTwo,
};

/* ─────────────────────────── Blog / Announcement ───────────────────── */

export const BLOG_POST_KEYS = ["communityConnections", "pricingPhilosophy", "onDemandAdvantage"];

/* ─────────────────────────── FAQ ─────────────────────────── */

export const FAQ_KEYS = ["howItWorks", "servicesOffered", "vendorsJoin", "whatSetsApart", "mobileApps"];

/* ─────────────────────────── Footer ─────────────────────────── */

/** Lucide dropped brand/social glyphs, so these four are drawn verbatim from
 *  the design (X, Facebook and LinkedIn are filled marks; Instagram is the
 *  same stroke rect+circle+dot as the team hover panel). */
export const FOOTER_SOCIAL_ICONS: ReactNode[] = [
  <svg key="x" {...socialIconProps} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>,
  <svg key="facebook" {...socialIconProps} fill="currentColor">
    <path d="M14 8h-2c-.6 0-1 .4-1 1v2h3l-.4 3H11v7H8v-7H6v-3h2V9c0-2.2 1.8-4 4-4h2v3z" />
  </svg>,
  <svg key="instagram" {...socialIconProps} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>,
  <svg key="linkedin" {...socialIconProps} fill="currentColor">
    <path d="M4 9h4v11H4zM6 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM11 20V9h4v1.6c.7-1.1 2-1.9 3.6-1.9 2.6 0 4.4 1.7 4.4 5.1V20h-4v-5.4c0-1.5-.6-2.5-2-2.5-1.1 0-1.8.8-2 1.6V20z" />
  </svg>,
];

export const FOOTER_CONTACT_KEYS = ["phone", "email", "address"];

export const FOOTER_LINK_KEYS = ["privacyPolicy", "termsConditions"];
