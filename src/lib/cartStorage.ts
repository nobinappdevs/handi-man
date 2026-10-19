/**
 * The service cart, kept in localStorage.
 *
 * The API has no cart: a service order is built on the client and sent whole
 * to `POST /user/service/checkout` as `card_info`. So the lines live here, and
 * survive a reload or a trip to the login page - that is the whole job, and
 * nothing in them is private (a service id, its price, a quantity).
 */

export const CART_KEY = "handiman_cart";

export interface CartLine {
  /** The service's id - one line per service. */
  id: number;
  name: string;
  /** The billing unit as the vendor wrote it: "1 day", "1 hour". */
  item: string;
  /** Unit price. */
  price: number;
  qty: number;
  /** Full image URL, for the drawer and the summary. */
  image: string;
  /** The image's file name, which `card_info` carries as `thumbnail`. */
  thumbnail: string;
  vendorId: number;
}

const isLine = (v: unknown): v is CartLine =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as CartLine).id === "number" &&
  typeof (v as CartLine).name === "string" &&
  typeof (v as CartLine).qty === "number";

export function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  try {
    if (lines.length) localStorage.setItem(CART_KEY, JSON.stringify(lines));
    else localStorage.removeItem(CART_KEY);
  } catch {
    /* Storage disabled - the cart still works for this page view. */
  }
}
