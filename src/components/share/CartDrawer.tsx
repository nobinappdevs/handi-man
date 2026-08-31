"use client";

import { X } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useShell } from "@/components/context/ShellContext";
import { CircleIconButton } from "@/components/share/CircleIconButton";

/**
 * Right slide-over cart. Prices are formatted with a hard "$" until the API
 * supplies the account's currency — swap this one helper when it does.
 */
const price = (n: number) => `$${n}`;

export function CartDrawer() {
  const { t } = useLang();
  const { drawer, closeDrawer, lines, count, subtotal, increment, decrement } = useShell();
  const open = drawer === "cart";

  return (
    <aside
      aria-label={t("cart.title")}
      aria-hidden={!open}
      className={`fixed inset-y-0 end-0 z-50 flex w-[min(380px,88vw)] flex-col bg-drawer text-drawer-ink shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.6)] transition-transform duration-[320ms] ease-[cubic-bezier(.4,0,.2,1)] ${
        open ? "translate-x-0" : "translate-x-[105%]"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-drawer-line px-[22px] py-5">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-base font-bold uppercase leading-none tracking-[0.14em]">
            {t("cart.title")}
          </span>
          <span className="rounded-[9px] bg-primary px-[7px] py-0.5 text-[11px] font-extrabold leading-none text-white">
            {count}
          </span>
        </div>
        <CircleIconButton size={32} tone="soft" onClick={closeDrawer} aria-label={t("common.close")}>
          <X size={15} strokeWidth={2.6} aria-hidden />
        </CircleIconButton>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-[22px] py-4">
        {lines.map((line) => {
          const title = t(line.titleKey);
          return (
            <div
              key={line.id}
              className="flex flex-col gap-2.5 border border-drawer-line bg-drawer-soft p-3"
            >
              <div className="flex items-center gap-[11px]">
                <span
                  aria-hidden
                  className="flex h-[38px] w-[38px] flex-none items-center justify-center bg-primary text-base font-black text-white"
                >
                  {title.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[15px] font-bold leading-[1.25] tracking-[-0.01em]">
                    {title}
                  </span>
                  <span className="font-display text-[12.5px] font-bold uppercase leading-none tracking-[0.1em] text-muted">
                    {t(line.metaKey)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decrement(line.id)}
                    aria-label={t("cart.decrease")}
                    className="h-7 w-7 cursor-pointer border border-drawer-line text-[15px] font-bold leading-none text-drawer-ink transition-colors hover:border-brand hover:text-brand"
                  >
                    −
                  </button>
                  <span className="min-w-4 text-center text-sm font-extrabold">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => increment(line.id)}
                    aria-label={t("cart.increase")}
                    className="h-7 w-7 cursor-pointer border border-drawer-line text-[15px] font-bold leading-none text-drawer-ink transition-colors hover:border-brand hover:text-brand"
                  >
                    +
                  </button>
                </div>
                <span className="text-[15.5px] font-extrabold">{price(line.qty * line.unit)}</span>
              </div>
            </div>
          );
        })}

        {lines.length === 0 && (
          <p className="my-5 text-center text-[14.5px] text-muted">{t("cart.empty")}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-drawer-line px-[22px] py-[18px]">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[13.5px] font-bold uppercase leading-none tracking-[0.14em] text-muted">
            {t("cart.subtotal")}
          </span>
          <span className="text-2xl font-black tracking-[-0.02em]">{price(subtotal)}</span>
        </div>
        <button
          type="button"
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
    </aside>
  );
}
