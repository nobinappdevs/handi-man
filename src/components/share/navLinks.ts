import {
  AirVent,
  Boxes,
  Car,
  Hammer,
  Scissors,
  SprayCan,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The public site's navigation — ONE set of lists, read by both the desktop
 * header and the mobile drawer.
 *
 * It used to be declared twice, once in each component, which is exactly how a
 * nav ends up saying different things depending on the viewport.
 *
 * The lists split by intent. `SITE_LINKS` is where the site's content lives;
 * `ACCOUNT_LINKS` is what you do with your own account; `VENDOR_LINK` is the
 * one conversion path that is neither, and the header gives it a button of its
 * own rather than burying it mid-nav. The drawer stacks all three.
 */
export type SiteLink = {
  href: string;
  key: string;
  /** Renders as a dropdown trigger in the header rather than a plain link. */
  menu?: boolean;
};

export const SITE_LINKS: SiteLink[] = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services", menu: true },
  { href: "/pickup", key: "nav.pickup" },
  { href: "/delivery", key: "nav.delivery" },
  { href: "/blog", key: "nav.blog" },
  { href: "/contact", key: "nav.contact" },
];

export const ACCOUNT_LINKS: SiteLink[] = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/login", key: "nav.login" },
];

/** Vendor recruitment — a conversion path, so the header gives it a button. */
export const VENDOR_LINK: SiteLink = { href: "/vendors", key: "nav.joinVendor" };

/**
 * The categories behind the header's "Services" dropdown.
 *
 * Labels are the SAME i18n keys the home rail and the catalogue use, so a
 * renamed category renames itself in all three places. Only the icons are
 * chosen here: pulling them from `homeData`/`servicesData` would drag those
 * modules — and every photograph they import — into the header, which every
 * page on the site loads.
 *
 * The `#cat-…` fragments must match `sectionId()` in `services/servicesData`;
 * they are the anchors `ServiceCatalogue` puts on each section.
 */
export type ServiceMenuItem = { href: string; key: string; icon: LucideIcon };

export const SERVICE_MENU: ServiceMenuItem[] = [
  { href: "/services#cat-handyman", key: "home.categories.items.handyman", icon: Hammer },
  { href: "/services#cat-cleaning", key: "home.categories.items.cleaning", icon: SprayCan },
  { href: "/services#cat-delivery", key: "home.categories.items.delivery", icon: Truck },
  { href: "/services#cat-plumbing", key: "home.categories.items.plumbing", icon: Wrench },
  { href: "/services#cat-electrics", key: "home.categories.items.electrics", icon: Zap },
  { href: "/services#cat-acRepair", key: "home.categories.items.acRepair", icon: AirVent },
  { href: "/services#cat-beauty", key: "home.categories.items.beauty", icon: Scissors },
  { href: "/services#cat-shifting", key: "home.categories.items.shifting", icon: Boxes },
  {
    href: "/services#cat-mechanics",
    key: "home.categoryGroups.groups.mechanics.name",
    icon: Car,
  },
];

/**
 * The one breakpoint that decides between the full header nav and the burger.
 *
 * Declared here because it has to hold in several places at once — the nav,
 * the burger that replaces it, and the buttons beside them. It was previously
 * inline in `Navbar`, and `MobileMenu`'s own comment claimed a different figure
 * (980px) than the code enforced (1280px); a shared constant is what stops that
 * drifting again.
 *
 * Written as complete literal class strings so Tailwind's scanner still sees
 * them — a composed `min-[${n}px]:flex` would produce no CSS at all.
 */
export const NAV_SHOW = "min-[1280px]:flex";
export const NAV_HIDE = "min-[1280px]:hidden";
