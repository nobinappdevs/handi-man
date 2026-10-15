"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  moneyOutService,
  type MoneyOutInsertData,
} from "@/services/moneyout.service";
import { getApiErrorMessage, getApiSuccessMessage, profileQueryKey } from "@/hooks/useAuth";

export const MONEY_OUT_KEY = ["money-out"] as const;

/**
 * GET /vendors/money-out/info — wallet, gateways, rates, limits and history.
 *
 * Rates and the balance both move, so this is not cached for long: a vendor
 * reading a stale rate would be quoted a figure the backend then refuses.
 */
export function useMoneyOutInfo() {
  return useQuery({
    queryKey: MONEY_OUT_KEY,
    queryFn: () => moneyOutService.getInfo(),
    staleTime: 30 * 1000,
  });
}

/**
 * POST /vendors/money-out/insert — step 1.
 *
 * No toast on success: the screen advances to the confirm step, which is the
 * feedback. Failures ("Please follow the transaction limit!") do toast, since
 * nothing else on screen would say why the step did not happen.
 */
export function useInsertMoneyOut() {
  return useMutation<{ data: MoneyOutInsertData }, unknown, { gateway: string; amount: number }>({
    mutationFn: (payload) => moneyOutService.insert(payload),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/**
 * POST /vendors/money-out/manual/confirmed — step 2.
 *
 * On success the balance has moved and a new row exists in the history, so the
 * info query is invalidated. The profile goes with it: several screens read the
 * wallet from there too.
 */
export function useConfirmMoneyOut() {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, { trx: string; fields: Record<string, unknown> }>({
    mutationFn: (payload) => moneyOutService.confirmManual(payload),
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Withdraw request sent"));
      qc.invalidateQueries({ queryKey: MONEY_OUT_KEY });
      qc.invalidateQueries({ queryKey: profileQueryKey("vendor") });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
