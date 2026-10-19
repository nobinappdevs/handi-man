/**
 * The hand-off between a checkout and the card form, for gateways the site
 * charges on its own page (Authorize.net) instead of redirecting away.
 *
 * The checkout answers with the transaction id, the amounts and the endpoint
 * the card details go to; the card page needs all three, and has to survive a
 * reload. sessionStorage, keyed by the transaction: tab-scoped, gone when the
 * tab closes, and nothing in it is secret - the card details themselves are
 * never stored, only posted.
 */

export const PENDING_CARD_PAYMENT_KEY = "handiman_pending_card_payment";

export interface PaymentSummary {
  gateway_currency_name?: string;
  request_amount?: string;
  exchange_rate?: string;
  total_charge?: string;
  will_get?: string;
  payable_amount?: string;
}

export interface PendingCardPayment {
  trx: string;
  /** API path the card details are posted to, relative to the API root. */
  path: string;
  summary: PaymentSummary;
  /** Where to go once paid, and if the customer backs out. */
  doneHref: string;
  cancelHref: string;
}

export function savePendingCardPayment(payment: PendingCardPayment) {
  try {
    sessionStorage.setItem(PENDING_CARD_PAYMENT_KEY, JSON.stringify(payment));
  } catch {
    /* Private mode or storage disabled - the card page then says the
       payment has expired, which is the honest answer. */
  }
}

export function readPendingCardPayment(trx: string): PendingCardPayment | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CARD_PAYMENT_KEY);
    if (!raw) return null;
    const payment = JSON.parse(raw) as PendingCardPayment;
    return payment?.trx === trx && typeof payment.path === "string" ? payment : null;
  } catch {
    return null;
  }
}

export function clearPendingCardPayment() {
  try {
    sessionStorage.removeItem(PENDING_CARD_PAYMENT_KEY);
  } catch {
    /* nothing to clear */
  }
}
