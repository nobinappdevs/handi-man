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

/* ─────────────────────────── Categories ───────────────────────────
 * The category tiles (CATEGORIES, and the icons drawn for them) used to be
 * mocked here. The home rail and the services page now take their categories
 * from the API - `useHomeContent` and `useCatalogue`.
 */

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
 * The recommended / trending cards (LISTING_TABS) used to be mocked here; they
 * now come from `GET /global/index` - see `useHomeContent`.
 */

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

/**
 * A team member's social links arrive as Font Awesome classes ("fab
 * fa-instagram"); `useHomeContent` reduces those to the network name, and
 * this maps the name to a glyph. An unknown network falls back to a globe in
 * the section rather than an empty square.
 */
export const SOCIAL_ICONS: Record<string, ReactNode> = {
  x: <svg {...socialIconProps} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>,
  facebook: <svg {...socialIconProps} fill="currentColor">
    <path d="M14 8h-2c-.6 0-1 .4-1 1v2h3l-.4 3H11v7H8v-7H6v-3h2V9c0-2.2 1.8-4 4-4h2v3z" />
  </svg>,
  pinterest: <svg {...socialIconProps} fill="currentColor">
    <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 0-2.9l1.2-5s-.3-.6-.3-1.4c0-1.4.8-2.4 1.8-2.4.8 0 1.3.6 1.3 1.4 0 .8-.6 2-.8 3.2-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-2.3 3.1-5 0-2.1-1.5-3.6-3.8-3.6-2.6 0-4.2 1.9-4.2 4 0 .7.2 1.2.5 1.6.1.1.1.2.1.4l-.3.9c0 .2-.2.3-.4.2-1.1-.4-1.6-1.7-1.6-3.1 0-2.3 2-5 5.9-5 3.2 0 5.3 2.3 5.3 4.7 0 3.2-1.8 5.6-4.4 5.6-.9 0-1.7-.5-2-1l-.5 2c-.2.8-.6 1.7-1 2.3.8.2 1.6.4 2.5.4a10 10 0 0 0 0-20z" />
  </svg>,
  instagram: <svg {...socialIconProps} fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>,
  whatsapp: (
    <svg {...socialIconProps} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.1z" />
    </svg>
  ),
  linkedin: (
    <svg {...socialIconProps} fill="currentColor">
      <path d="M6.9 8.5H3.6V20h3.3V8.5zM5.2 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM20.4 13.4c0-3.1-1.7-5.1-4.3-5.1-1.5 0-2.5.8-2.9 1.6V8.5H10V20h3.3v-5.9c0-1.6.6-2.8 2-2.8s1.8 1.2 1.8 2.8V20h3.3v-6.6z" />
    </svg>
  ),
  youtube: (
    <svg {...socialIconProps} fill="currentColor">
      <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  ),
};
/* Font Awesome's older name for X. */
SOCIAL_ICONS.twitter = SOCIAL_ICONS.x;

/*
 * The team itself (TEAM_MEMBERS) used to be mocked here; it now comes from
 * `teams.value.items` on `GET /global/index` - see `useHomeContent`.
 */

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

/* ─────────────────────────── Blog / Announcement ─────────────────────
 * The posts (BLOG_POST_KEYS) are the API's now - `announcements` on
 * `GET /global/index`, see `useHomeContent`.
 */

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
