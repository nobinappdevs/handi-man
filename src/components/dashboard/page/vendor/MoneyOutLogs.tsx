"use client";

import { MoneyOutHistory } from "@/components/dashboard/page/vendor/MoneyOutHistory";

/**
 * The payout history page — the whole list.
 *
 * The table and its record modal live in `MoneyOutHistory`, because the
 * withdraw screen shows the same thing in short form underneath its form. This
 * page is that component without a row limit.
 */
export function MoneyOutLogs() {
  return <MoneyOutHistory />;
}
