import { vendorPrivateApi } from "@/lib/axios";

/**
 * Vendor money-out — `…/api/vendor/v1/vendors/money-out/*`.
 *
 * Vendor-only on purpose: the collection documents no customer equivalent, and
 * the wallet being emptied is the vendor's earnings balance. No role factory
 * here for that reason — add one the day a customer endpoint appears.
 *
 * Three calls, in order:
 *   GET  /info              — wallet, gateways, rates, limits, charges, history
 *   POST /insert            — reserves the withdrawal, returns `trx` + the
 *                             gateway's dynamic fields and a formatted summary
 *   POST /manual/confirmed  — spends `trx` with those field values
 */

/** One field of the gateway-defined confirm form. `type` drives the control. */
export interface MoInputField {
  type: "text" | "number" | "select" | "file" | "textarea" | string;
  label: string;
  name: string;
  required: boolean;
  validation?: {
    max?: number | string;
    min?: number | string;
    mimes?: string[];
    options?: string[];
    required?: boolean;
  };
}

/**
 * A payout option as the user picks it.
 *
 * NOTE this is the unit of choice, not `Gateway` — one gateway can offer
 * several currencies, and the rate, limits and charges all hang off the
 * currency, not the gateway. `alias` is what `insert` wants as `gateway`.
 */
export interface GatewayCurrency {
  id: number;
  payment_gateway_id: number;
  type: string;
  /** Display name, e.g. "JazzCash PKR". */
  name: string;
  /** The value `insert` expects, e.g. "money-out-jazzcash-pkr-manual". */
  alias: string;
  currency_code: string;
  currency_symbol: string;
  image: string | null;
  /** Limits are in THIS currency, not the wallet's — divide by `rate`. */
  min_limit: number;
  max_limit: number;
  percent_charge: number;
  fixed_charge: number;
  /** 1 base unit = `rate` of `currency_code`. */
  rate: number;
}

export interface Gateway {
  id: number;
  name: string;
  image: string | null;
  slug: string;
  code: number | string;
  type: string;
  alias: string;
  supported_currencies: string[] | Record<string, unknown>;
  input_fields: MoInputField[];
  status: number | boolean;
  currencies: GatewayCurrency[];
}

export interface MoneyOutWallet {
  balance: number;
  currency: string;
}

/**
 * One row of the money-out history, as `/info` returns it in `transactions`.
 *
 * There is no separate logs endpoint - the history rides along with the
 * gateways and the wallet on the same call, which is why the logs screen and
 * the withdraw screen share one query.
 *
 * Every money field is a pre-formatted string with its unit baked in
 * ('2760.7 PKR'), like the confirm step's summary. `formatMoneyString` in
 * `lib/money.ts` is what makes them presentable.
 */
export interface MoneyOutTransaction {
  id: number;
  /** Withdrawal reference, e.g. 'WD70999369'. */
  trx: string;
  gateway_name: string;
  gateway_currency_name: string;
  /** ISO-8601, UTC. Format with `formatDateTime` - see why in lib/money.ts. */
  date_time: string;
  request_amount: string;
  exchange_rate: string;
  total_charge: string;
  /** What the vendor receives, in the gateway currency. */
  payable: string;
  /** Wallet balance after this row, in the base currency. */
  current_balance: string;
  /** A label ('Rejected'), not a code - `status_info` holds the numbers. */
  status: string | number;
  /** The API's own legend, e.g. { success: 1, pending: 2, rejected: 3 }. */
  status_info?: Record<string, number>;
  /** Admin's note. Present only when the request was turned down. */
  rejection_reason?: string | null;
  transaction_type?: number | string;
  [key: string]: unknown;
}
export interface MoneyOutData {
  /** The wallet's currency, e.g. "USD" — what amounts are entered in. */
  base_curr: string;
  base_curr_rate: number;
  flag_path?: string;
  default_image?: string;
  image_path?: string;
  userWallet: MoneyOutWallet;
  gateways: Gateway[];
  transactions: MoneyOutTransaction[];
}

/**
 * The server's own formatted summary, returned by `insert`.
 *
 * Every value is a display string with its unit baked in ("2789.6 PKR"). The
 * confirm screen prints these verbatim rather than recomputing: they are what
 * the backend will actually act on, and a locally-derived figure that disagreed
 * would be the more convincing of the two.
 */
export interface PaymentInformations {
  trx: string;
  gateway_currency_name: string;
  request_amount: string;
  exchange_rate: string;
  conversion_amount: string;
  total_charge: string;
  will_get: string;
  payable: string;
}

export interface MoneyOutInsertData {
  payment_informations: PaymentInformations;
  gateway_type: string;
  gateway_currency_name: string;
  alias: string;
  /** Admin-authored instructions. HTML — see `plainText` in the screen. */
  details: string;
  input_fields: MoInputField[];
  /** Absolute confirm URL. Not used: we post to our own relative route so the
   *  bearer token and base URL stay with the axios instance. */
  url?: string;
  method?: string;
}

export const moneyOutService = {
  /** GET /vendors/money-out/info */
  async getInfo(): Promise<{ data: MoneyOutData }> {
    const res = await vendorPrivateApi.get("/vendors/money-out/info");
    return res.data;
  },

  /**
   * POST /vendors/money-out/insert — step 1.
   *
   * `gateway` is the CURRENCY alias, not the gateway's own alias. Amount is in
   * the wallet's base currency; the backend converts.
   */
  async insert(payload: { gateway: string; amount: number }): Promise<{ data: MoneyOutInsertData }> {
    const form = new FormData();
    form.append("gateway", payload.gateway);
    form.append("amount", String(payload.amount));
    const res = await vendorPrivateApi.post("/vendors/money-out/insert", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * POST /vendors/money-out/manual/confirmed — step 2.
   *
   * `trx` comes from `insert`; the rest are whatever that gateway declared.
   * Sent as form-data because a gateway may declare a `file` field.
   */
  async confirmManual(payload: { trx: string; fields: Record<string, unknown> }) {
    const form = new FormData();
    form.append("trx", payload.trx);
    for (const [key, value] of Object.entries(payload.fields)) {
      if (value === undefined || value === null || value === "") continue;
      if (typeof File !== "undefined" && value instanceof File) form.append(key, value);
      else form.append(key, String(value));
    }
    const res = await vendorPrivateApi.post("/vendors/money-out/manual/confirmed", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

/* ──────────────────────────────────────────────────────────────────────────
 * The preview maths
 *
 * There is no preview endpoint, so step 1 has to compute what step 2 will show.
 * These formulas are not guessed from the design — they are reverse-engineered
 * from the server's OWN `insert` response and reproduce it exactly:
 *
 *   amount 10 USD, rate 278.96, fixed 1, percent 1%
 *     conversion  10 × 278.96          = 2789.6   ← server: "2789.6 PKR"
 *     charge      1 + 1% of 2789.6     = 28.896   ← server: "28.9 PKR"
 *     will get    2789.6 − 28.896      = 2760.704 ← server: "2760.7 PKR"
 *
 * ⚠️ The reference screenshots show 1.10 / 2788.50 for the same inputs, i.e.
 * the percentage taken on the BASE amount instead of the converted one. That
 * is a different backend's rule; following it here would have the preview
 * contradict the confirm screen, which prints the server's figures verbatim.
 * ────────────────────────────────────────────────────────────────────────── */

export type MoneyOutQuote = {
  /** What leaves the wallet, in base currency. */
  payable: number;
  /** Amount converted into the gateway's currency, before charges. */
  conversion: number;
  /** Fixed + percentage, in the gateway's currency. */
  charge: number;
  /** What actually arrives, in the gateway's currency. Never negative. */
  willGet: number;
};

export function quoteMoneyOut(amount: number, currency: GatewayCurrency): MoneyOutQuote {
  const safe = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const conversion = safe * currency.rate;
  const charge = currency.fixed_charge + (conversion * currency.percent_charge) / 100;
  return {
    payable: safe,
    conversion,
    charge,
    // A charge larger than a tiny conversion would otherwise show a negative
    // payout; the backend does not pay out less than nothing.
    willGet: Math.max(0, conversion - charge),
  };
}

/**
 * The gateway's limits expressed in the WALLET's currency, which is the one the
 * amount field accepts. `min_limit`/`max_limit` arrive in the gateway currency
 * (10000 PKR), so a vendor entering USD needs 10000 ÷ 278.96 = 35.85.
 */
export function limitsInBaseCurrency(currency: GatewayCurrency) {
  const rate = currency.rate || 1;
  return { min: currency.min_limit / rate, max: currency.max_limit / rate };
}

/** Every payout option across every gateway, which is what the picker lists. */
export function payoutOptions(gateways: Gateway[] = []): GatewayCurrency[] {
  return gateways
    .filter((g) => String(g.status) === "1" || g.status === true || g.status === undefined)
    .flatMap((g) => g.currencies ?? []);
}

export default moneyOutService;
