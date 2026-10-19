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
};

export const SITE_LINKS: SiteLink[] = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  /* A plain link. It used to open a hover dropdown of categories; the
     services page has its own category rail, so one click now goes there. */
  { href: "/services", key: "nav.services" },
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
