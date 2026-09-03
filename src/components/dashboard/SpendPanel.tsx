"use client";

import { useLang } from "@/hooks/useLang";
import { SPEND, SPEND_TOTAL } from "@/components/dashboard/dashboardData";

export function SpendPanel() {
  const { t } = useLang();

  return (
    <section className="flex flex-col gap-4 border border-border bg-card p-[clamp(18px,1.9vw,24px)]">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium tracking-[0.12em] text-muted uppercase">
          {t("dashboard.spend.title")}
        </span>
        <span className="text-[20px] font-semibold tracking-[-0.03em] text-heading">
          {SPEND_TOTAL}
        </span>
      </span>

      <div className="flex flex-col gap-[13px]">
        {SPEND.map(({ key, amount, pct, fill }) => (
          <span key={key} className="flex flex-col gap-[7px]">
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-[14px] font-bold text-heading">
                {t(`dashboard.spend.${key}`)}
              </span>
              <span className="text-[12.5px] font-medium tracking-[0.1em] text-muted">{amount}</span>
            </span>
            {/* `--sunk`, not `--surface`: this track sits inside a card, and in
                dark those two are the same colour. */}
            <span className="block h-1.5 bg-sunk">
              <span className={`block h-full ${fill}`} style={{ width: `${pct}%` }} />
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
