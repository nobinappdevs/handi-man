"use client";

// Chrome state shared by the public header and its two slide-over drawers:
// which drawer is open, and the service cart.
//
// The cart is the customer's, built on the client: the API has no cart, only a
// checkout that takes the whole thing at once (`card_info`). It is kept in
// localStorage (`lib/cartStorage`) so it survives a reload or a detour through
// the login page.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useIsClient } from "@/hooks/useIsClient";
import { readCart, writeCart, type CartLine } from "@/lib/cartStorage";

export type { CartLine };

type Drawer = "cart" | "menu" | null;

/** The most of one service a single order takes - a typo guard, not a policy. */
export const MAX_QTY = 99;

type ShellContextValue = {
  drawer: Drawer;
  openCart: () => void;
  openMenu: () => void;
  closeDrawer: () => void;
  lines: CartLine[];
  /** Total number of units, i.e. the header badge. */
  count: number;
  subtotal: number;
  /** Adds `qty` of a service, or tops up its existing line. */
  addToCart: (line: Omit<CartLine, "qty">, qty: number) => void;
  setQty: (id: number, qty: number) => void;
  increment: (id: number) => void;
  /** Decrementing the last unit removes the line. */
  decrement: (id: number) => void;
  remove: (id: number) => void;
  clearCart: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1));

export function ShellProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  /* The stored cart is read once the page is on the client, not during the
     first render: the static export prerenders with no storage, and reading it
     straight away would mismatch that HTML. `useIsClient` is false on the
     hydration pass and true right after, and the read happens on that second
     render (state adjusted during render - no effect, no extra commit).
     Writes wait for the read, or the empty first state would overwrite the
     saved cart. */
  const isClient = useIsClient();
  const [loaded, setLoaded] = useState(false);
  if (isClient && !loaded) {
    setLoaded(true);
    setLines(readCart());
  }

  useEffect(() => {
    if (loaded) writeCart(lines);
  }, [loaded, lines]);

  const closeDrawer = useCallback(() => setDrawer(null), []);
  const openCart = useCallback(() => setDrawer("cart"), []);
  const openMenu = useCallback(() => setDrawer("menu"), []);

  /* Escape closes whichever drawer is open. */
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const addToCart = useCallback((line: Omit<CartLine, "qty">, qty: number) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === line.id);
      if (existing) {
        return prev.map((l) => (l.id === line.id ? { ...l, ...line, qty: clampQty(l.qty + qty) } : l));
      }
      return [...prev, { ...line, qty: clampQty(qty) }];
    });
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: clampQty(qty) } : l)));
  }, []);

  const increment = useCallback((id: number) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: clampQty(l.qty + 1) } : l)));
  }, []);

  const decrement = useCallback((id: number) => {
    setLines((prev) =>
      prev.flatMap((l) => (l.id !== id ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [])),
    );
  }, []);

  const remove = useCallback((id: number) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const { count, subtotal } = useMemo(
    () => ({
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
    }),
    [lines],
  );

  const value: ShellContextValue = {
    drawer,
    openCart,
    openMenu,
    closeDrawer,
    lines,
    count,
    subtotal,
    addToCart,
    setQty,
    increment,
    decrement,
    remove,
    clearCart,
  };

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used inside a <ShellProvider>");
  }
  return ctx;
}
