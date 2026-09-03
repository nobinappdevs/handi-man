/**
 * The public site's primary navigation — ONE list, read by both the desktop
 * bar and the mobile drawer.
 *
 * It used to be declared twice, once in each component, which is exactly how a
 * nav ends up saying different things depending on the viewport.
 *
 * `accent` marks the item the design highlights in the brand colour rather than
 * the default ink. It is a standing highlight, not an active state — the active
 * page still gets its own underline on top.
 */
export type SiteLink = { href: string; key: string; accent?: boolean };

export const SITE_LINKS: SiteLink[] = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/pickup", key: "nav.pickup" },
  { href: "/delivery", key: "nav.delivery" },
  { href: "/vendors", key: "nav.joinVendor", accent: true },
  { href: "/blog", key: "nav.blog" },
  { href: "/contact", key: "nav.contact" },
  { href: "/dashboard", key: "nav.dashboard" },
];
