"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { env } from "@/config/env";
import { cardPaymentService } from "@/services/cardPayment.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import { USER_TRANSACTIONS_KEY } from "@/hooks/useTransactions";
import { clearPendingCardPayment, type PendingCardPayment } from "@/lib/pendingPayment";
import type { CardPaymentRequest } from "@/schemas/cardPayment.schema";

export const CARD_PAYMENT_ROUTE = "/payment/card";

/** A gateway the site charges on its own card form rather than redirecting to. */
export const isCardGateway = (identify?: string, alias?: string) =>
  identify === "authorize" || Boolean(alias?.includes("authorize"));

/**
 * The checkout's `url`, reduced to a path on OUR API - or null.
 *
 * Card details are about to be posted wherever this points, so it is not
 * trusted as given: it must sit under the API root this build talks to
 * (`env.apiUrl`). Anything else - another host, a tampered response - is
 * refused, and the customer never sees a card form for it.
 */
export function pendingPaymentPathFrom(url?: string): string | null {
  if (!url) return null;
  const root = env.apiUrl.replace(/\/+$/, "");
  if (!root || !url.startsWith(`${root}/`)) return null;
  return url.slice(root.length);
}

/**
 * POST the card to the order's Authorize endpoint. On success the pending
 * payment is forgotten and the customer lands where the order lives.
 */
export function useCardPayment(pending: PendingCardPayment | null) {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CardPaymentRequest) => {
      if (!pending) throw new Error("No pending payment");
      return cardPaymentService.submit(pending.path, {
        identifier: pending.trx,
        card_number: values.card_number.replace(/\D/g, ""),
        date: values.date.replace(/\s/g, ""),
        code: values.code,
      });
    },
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Payment successful"));
      clearPendingCardPayment();
      qc.invalidateQueries({ queryKey: USER_TRANSACTIONS_KEY });
      router.push(pending?.doneHref ?? "/dashboard");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
