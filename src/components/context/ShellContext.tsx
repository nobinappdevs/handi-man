"use client";

// Chrome state shared by the public header and its two slide-over drawers:
// which drawer is open, and the cart's lines.
//
// The cart is seeded locally so the drawer has something to render. When the
// cart API lands, replace the seed + the qty mutators with a React Query hook
// (`hooks/useCart.ts` → `services/cart.service.ts`) and keep this context for
// the open/closed state only.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** While the cart is local, labels are i18n keys; API rows will carry strings. */
export type CartLine = {
  id: string;
  titleKey: string;
  metaKey: string;
  /** Unit price in whole currency units. */
  unit: number;
  qty: number;
};

const SEED: CartLine[] = [
  { id: "ac-service", titleKey: "cart.seed.ac.title", metaKey: "cart.seed.ac.meta", unit: 49, qty: 1 },
  { id: "parcel-5kg", titleKey: "cart.seed.parcel.title", metaKey: "cart.seed.parcel.meta", unit: 12, qty: 2 },
];

type Drawer = "cart" | "menu" | null;

type ShellContextValue = {
  drawer: Drawer;
  openCart: () => void;
  openMenu: () => void;
  closeDrawer: () => void;
  lines: CartLine[];
  /** Total number of items, i.e. the header badge. */
  count: number;
  subtotal: number;
  increment: (id: string) => void;
  /** Decrementing the last unit removes the line, matching the design. */
  decrement: (id: string) => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [lines, setLines] = useState<CartLine[]>(SEED);

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

  const increment = useCallback((id: string) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)));
  }, []);

  const decrement = useCallback((id: string) => {
    setLines((prev) =>
      prev.flatMap((l) => (l.id !== id ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [])),
    );
  }, []);

  const { count, subtotal } = useMemo(
    () => ({
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.unit, 0),
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
    increment,
    decrement,
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
