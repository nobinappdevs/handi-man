"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ImageOff, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell, MAX_QTY, type CartLine } from "@/components/context/ShellContext";
import { CircleIconButton } from "@/components/share/CircleIconButton";
import { SERVICE_ROUTES } from "@/lib/serviceRoutes";
import { readToken } from "@/lib/authState";
import { money } from "@/lib/money";

function Thumb({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <span className="flex h-16 w-16 flex-none items-center justify-center bg-brand/12 text-brand">
        <ImageOff size={18} strokeWidth={1.6} aria-hidden />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
    <img src={src} alt="" onError={() => setBroken(true)} className="h-16 w-16 flex-none object-cover" />
  );
}

/**
 * Right slide-over cart - the services the customer has added, from the shell
 * context (kept in localStorage). Checkout leads to `/services/checkout`;
 * signed out, it goes to the login page first, since checkout is an account
 * action and the cart waits in storage.
 */
export function CartDrawer() {
  const { t, dir } = useLang();
  const router = useRouter();
  const { drawer, closeDrawer, lines, count, subtotal, increment, decrement, remove } = useShell();
  const open = drawer === "cart";
  /* Docked at `end` — the right edge in ltr, the left edge in rtl. The closed
     state slides off that same edge, so the sign flips with it. */
  const rtl = dir === "rtl";
  /* The catalogue is one currency; the drawer shows it without a code until
     a checkout has the real one. */
  const currency = t("checkout.currency");

  const checkout = () => {
    closeDrawer();
    if (!readToken("user")) {
      toast.error(t("cart.signInFirst"));
      router.push("/login");
      return;
    }
    router.push(SERVICE_ROUTES.checkout);
  };

  return (
    <aside
      aria-label={t("cart.title")}
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-y-0 end-0 z-50 flex w-[min(400px,90vw)] flex-col bg-drawer text-drawer-ink transition-transform duration-[320ms] ease-[cubic-bezier(.4,0,.2,1)] ${
        rtl ? "shadow-[30px_0_60px_-30px_rgba(0,0,0,0.6)]" : "shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.6)]"
      } ${open ? "translate-x-0" : rtl ? "translate-x-[-105%]" : "translate-x-[105%]"}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-drawer-line px-[22px] py-5">
        <div className="flex items-center gap-2.5">
          <ShoppingCart size={18} strokeWidth={2.2} aria-hidden className="text-brand" />
          <span className="font-display text-base font-bold uppercase leading-none tracking-[0.14em]">
            {t("cart.title")}
          </span>
          <span className="inline bg-primary px-[7px] py-0.5 text-[11px] font-extrabold leading-none text-white tabular-nums">
            {count}
          </span>
        </div>
        <CircleIconButton size={32} tone="soft" onClick={closeDrawer} aria-label={t("common.close")}>
          <X size={15} strokeWidth={2.6} aria-hidden />
        </CircleIconButton>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-[22px] py-4">
        {lines.map((line: CartLine) => (
          <div key={line.id} className="flex gap-3 border border-drawer-line bg-drawer-soft p-3">
            <Link href={SERVICE_ROUTES.details(line.id)} onClick={closeDrawer} className="flex-none">
              <Thumb src={line.image} />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={SERVICE_ROUTES.details(line.id)}
                  onClick={closeDrawer}
                  className="line-clamp-2 text-[14.5px] leading-[1.3] font-bold tracking-[-0.01em] transition-colors hover:text-brand"
                >
                  {line.name}
                </Link>
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  aria-label={`${t("cart.remove")} - ${line.name}`}
                  title={t("cart.remove")}
                  className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center text-muted transition-colors hover:text-danger"
                >
                  <Trash2 size={14} strokeWidth={2} aria-hidden />
                </button>
              </div>
              {line.item && <span className="text-[12.5px] text-muted">{line.item}</span>}
              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="flex h-8 items-center border border-drawer-line">
                  <button
                    type="button"
                    onClick={() => decrement(line.id)}
                    aria-label={t("cart.decrease")}
                    className="flex h-full w-7 cursor-pointer items-center justify-center transition-colors hover:text-brand"
                  >
                    <Minus size={13} strokeWidth={2.4} aria-hidden />
                  </button>
                  <span className="w-7 text-center text-[13.5px] font-extrabold tabular-nums">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => increment(line.id)}
                    disabled={line.qty >= MAX_QTY}
                    aria-label={t("cart.increase")}
                    className="flex h-full w-7 cursor-pointer items-center justify-center transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus size={13} strokeWidth={2.4} aria-hidden />
                  </button>
                </div>
                <span className="text-[15px] font-extrabold text-brand tabular-nums">
                  {money(line.qty * line.price, currency)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {lines.length === 0 && (
          <div className="my-10 flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center bg-brand/12 text-brand">
              <ShoppingCart size={22} strokeWidth={1.8} aria-hidden />
            </span>
            <p className="text-[14.5px] text-muted">{t("cart.empty")}</p>
            <Link
              href="/services"
              onClick={closeDrawer}
              className="font-display text-[13px] font-bold tracking-[0.12em] text-brand uppercase"
            >
              {t("cart.browse")}
            </Link>
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-drawer-line px-[22px] py-[18px]">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[13.5px] font-bold uppercase leading-none tracking-[0.14em] text-muted">
              {t("cart.subtotal")}
            </span>
            <span className="text-2xl font-black tracking-[-0.02em] tabular-nums">{money(subtotal, currency)}</span>
          </div>
          <button
            type="button"
            onClick={checkout}
            className="h-[50px] cursor-pointer bg-primary font-display text-[15px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary-dark"
          >
            {t("cart.checkout")}
          </button>
          <button
            type="button"
            onClick={closeDrawer}
            className="h-11 cursor-pointer border border-drawer-line font-display text-sm font-bold uppercase tracking-[0.12em] text-drawer-ink transition-colors hover:border-brand hover:text-brand"
          >
            {t("cart.keepBrowsing")}
          </button>
        </div>
      )}
    </aside>
  );
}
