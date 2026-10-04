"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction.service";

export const USER_TRANSACTIONS_KEY = ["transactions", "user"] as const;

/**
 * GET /user/transaction, shared by the three history screens.
 *
 * One query, one cache entry: a customer visiting Service history and then
 * Pickup history within the `staleTime` window does not refetch, since both
 * screens read the same payload's different pools.
 */
export function useUserTransactions() {
  return useQuery({
    queryKey: USER_TRANSACTIONS_KEY,
    queryFn: () => transactionService.getUserTransactions(),
    staleTime: 30 * 1000,
  });
}
