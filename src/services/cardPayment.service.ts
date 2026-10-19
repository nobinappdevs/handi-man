import { privateApi } from "@/lib/axios";

/**
 * POST {kind}/authorize-payment-submit?{trx} - charge a card through
 * Authorize.net, for an order whose checkout chose an Authorize currency.
 *
 * The path comes from the checkout's own response (it differs per order kind:
 * `delivery/`, `pickup/`, `service/`) and is checked against the API root
 * before anything is sent - see `pendingPaymentPathFrom`. The transaction id
 * rides as a bare query key AND as `identifier` in the body, as the API wants.
 */

export interface CardPaymentPayload {
  identifier: string;
  /** Digits only. */
  card_number: string;
  /** "YY/MM". */
  date: string;
  code: string;
}

export const cardPaymentService = {
  async submit(path: string, payload: CardPaymentPayload) {
    const form = new FormData();
    (Object.keys(payload) as (keyof CardPaymentPayload)[]).forEach((key) => form.append(key, payload[key]));
    const res = await privateApi.post(path, form, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
  },
};

export default cardPaymentService;
