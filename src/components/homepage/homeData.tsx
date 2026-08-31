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
