"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  orderCheckoutService,
  type CheckoutResult,
  type GatewayRecord,
  type OrderCheckoutPayload,
  type OrderKind,
  type OrderPreviewData,
  type ScheduleTimeRecord,
} from "@/services/orderCheckout.service";
import { getApiErrorMessage, getApiRefusalMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import { USER_TRANSACTIONS_KEY } from "@/hooks/useTransactions";
import { CARD_PAYMENT_ROUTE, isCardGateway, pendingPaymentPathFrom } from "@/hooks/useCardPayment";
import { savePendingCardPayment } from "@/lib/pendingPayment";
import type { AddressRequest, SavedAddress } from "@/schemas/address.schema";

/**
 * The checkout of a delivery or a pickup order - one set of hooks, keyed by
 * `kind`. The two differ only in their paths, their lines (a delivery line has
 * a price, a pickup line a weight) and where they finish.
 */

const previewKey = (kind: OrderKind, identifier: string) => [kind, "preview", identifier] as const;

/** Where each kind's checkout lives, and where its finished orders are listed. */
export const ORDER_ROUTES: Record<OrderKind, { form: string; checkout: string; history: string }> = {
  delivery: { form: "/delivery", checkout: "/delivery/checkout", history: "/dashboard/history/delivery" },
  pickup: { form: "/pickup", checkout: "/pickup/checkout", history: "/dashboard/history/pickup" },
};

export const checkoutHref = (kind: OrderKind, identifier: string) =>
  `${ORDER_ROUTES[kind].checkout}?identifier=${encodeURIComponent(identifier)}`;

/** One saved line as the checkout reads it. Fields a kind does not have are "" / 0. */
export interface OrderLine {
  name: string;
  quantity: number;
  /** Delivery: the line's estimated price (the whole line, not per unit). */
  price: number;
  brand: string;
  size: string;
  shop: string;
  shopAddress: string;
  /** Pickup: the weight of ONE unit, in kg. */
  kg: number;
}

export interface OrderSlot {
  id: number;
  /** As the API stores it from the web: "8:00 PM - 9:00 PM". */
  value: string;
  start: string;
  end: string;
}

export interface PaymentOption {
  /** A gateway currency alias. */
  value: string;
  label: string;
  code: string;
  rate: number;
  percentCharge: number;
  fixedCharge: number;
  min: number;
  max: number;
}

export interface OrderPreview {
  details: string;
  lines: OrderLine[];
  /** Sum of the line prices - 0 for a pickup, whose lines are not priced. */
  subtotal: number;
  /** The kind's fixed delivery / pickup charge. */
  charge: number;
  total: number;
  /** "16-Oct-2026" - the API's checkout format (see `toApiDate`). */
  dates: string[];
  slots: OrderSlot[];
  addresses: SavedAddress[];
  paymentTypes: { value: string; label: string }[];
  /** Every gateway currency; the wallet is offered beside them by the page. */
  gateways: PaymentOption[];
}

export const WALLET = "my_wallet";

const num = (v: unknown) => Number(v) || 0;

/*
 * The checkout's date and time are sent the way the old web checkout sent
 * them - an order it placed comes back as "03-Oct-2026, 8:00 PM - 9:00 PM",
 * and the collection's delivery sample uses "5-Feb-2024". The preview,
 * though, lists its dates as "16-10-2026", and an order sent with that (and
 * "10:00:00 - 11:00:00") came back "Record didn't saved properly" - most
 * likely the backend parsing it as d-M-Y. So the dates are rewritten here,
 * once, and the checkout never sees the numeric form.
 *
 * English month names on purpose, whatever the page language: this is a wire
 * format the backend parses, not text for a reader.
 */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function toApiDate(value: string) {
  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value);
  if (!m) return value; // already "16-Oct-2026", or a shape we do not know - leave it
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${m[1].padStart(2, "0")}-${month}-${m[3]}` : value;
}

/** "20:00:00" → "8:00 PM". */
function to12h(hhmmss: string) {
  const [h, min] = hhmmss.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return hhmmss;
  return `${h % 12 || 12}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** The API's slots, with the value the checkout sends back. */
export const toSlots = (records: ScheduleTimeRecord[] = []): OrderSlot[] =>
  records.map((s) => ({
    id: s.id,
    value: `${to12h(s.start_time)} - ${to12h(s.end_time)}`,
    start: s.start_time.slice(0, 5),
    end: s.end_time.slice(0, 5),
  }));

/** Every currency of every gateway, flattened into one list of choices. */
export const toPaymentOptions = (gateways: GatewayRecord[] = []): PaymentOption[] =>
  gateways.flatMap((g) =>
    (g.currencies ?? []).map((c) => ({
      value: c.alias,
      label: c.name,
      code: c.currency_code,
      rate: num(c.rate) || 1,
      percentCharge: num(c.percent_charge),
      fixedCharge: num(c.fixed_charge),
      min: num(c.min_limit),
      max: num(c.max_limit),
    })),
  );

function toPreview(d: OrderPreviewData): OrderPreview {
  const info = d.delivery_info ?? d.order_info ?? d.pickup_info;
  const lines = (info?.data?.order ?? []).map((o) => ({
    name: o.name ?? "",
    quantity: num(o.quantity) || 1,
    price: num(o.price),
    brand: o.brand_name ?? "",
    size: o.size ?? "",
    shop: o.shop ?? "",
    shopAddress: o.shop_address ?? "",
    kg: num(o.kg),
  }));
  const subtotal = lines.reduce((sum, l) => sum + l.price, 0);
  const charge = num(d.fixed_charge);

  return {
    details: info?.data?.details ?? "",
    lines,
    subtotal,
    charge,
    total: subtotal + charge,
    dates: (d.dates ?? []).map(toApiDate),
    slots: toSlots(d.scheduleTime),
    addresses: d.address ?? [],
    paymentTypes: (d.paymentType ?? []).map((p) => ({ value: p.value, label: p.label_name ?? p.value })),
    gateways: toPaymentOptions(d.gateways),
  };
}

/** GET /user/{kind}/preview - the checkout page's data, by identifier. */
export function useOrderPreview(kind: OrderKind, identifier: string) {
  return useQuery({
    queryKey: previewKey(kind, identifier),
    queryFn: () => orderCheckoutService.preview(kind, identifier),
    select: (res) => toPreview(res.data ?? {}),
    enabled: Boolean(identifier),
    retry: false,
  });
}

/** POST /user/{kind}/my-address/save - then re-read the preview, whose
 *  address list is where the new one appears. */
export function useSaveOrderAddress(kind: OrderKind, identifier: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: AddressRequest) => orderCheckoutService.saveAddress(kind, values),
    onSuccess: async (res) => {
      toast.success(getApiSuccessMessage(res, "Address added"));
      await qc.invalidateQueries({ queryKey: previewKey(kind, identifier) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/**
 * POST /user/{kind}/checkout. Three endings:
 *
 *  - **Authorize.net** answers with a transaction and an API endpoint, not a
 *    page: the customer is taken to the site's own card form, which posts the
 *    card there (`useCardPayment`).
 *  - **Other gateways** answer with their own page and the browser goes there
 *    (a full navigation - it is another site); the gateway returns the
 *    customer to their order history, or back to this checkout on cancel.
 *  - **Cash and the wallet** finish here.
 */
/**
 * How every checkout ends - delivery, pickup and service alike. Returns
 * whether the order is done HERE (cash / wallet), so the caller can tidy up
 * (the service checkout empties the cart) only when nothing is left to pay.
 */
export function useFinishCheckout() {
  const router = useRouter();
  const qc = useQueryClient();

  return (
    res: { data?: CheckoutResult },
    where: { history: string; cancelHref: string },
    fallback: string,
  ): "card" | "redirect" | "done" | "failed" => {
    qc.invalidateQueries({ queryKey: USER_TRANSACTIONS_KEY });

    // A 200 carrying `message.error` / `message.warning` is a refusal, not an
    // order - say so and stay on the checkout instead of toasting "placed".
    const refusal = getApiRefusalMessage(res);
    if (refusal) {
      toast.error(refusal);
      return "failed";
    }

    const data = res.data;
    const url = data?.url;

    if (isCardGateway(data?.identify, data?.alias)) {
      const trx = data?.payment_informations?.trx;
      const path = pendingPaymentPathFrom(url);
      if (!trx || !path) {
        toast.error("This payment option is not available right now.");
        return "failed";
      }
      savePendingCardPayment({
        trx,
        path,
        summary: data?.payment_informations ?? {},
        doneHref: where.history,
        cancelHref: where.cancelHref,
      });
      router.push(`${CARD_PAYMENT_ROUTE}?trx=${encodeURIComponent(trx)}`);
      return "card";
    }

    if (url && /^https?:\/\//i.test(url)) {
      window.location.href = url;
      return "redirect";
    }
    toast.success(getApiSuccessMessage(res, fallback));
    router.push(where.history);
    return "done";
  };
}

export function useOrderCheckout(kind: OrderKind) {
  const finish = useFinishCheckout();
  const routes = ORDER_ROUTES[kind];

  return useMutation({
    mutationFn: (payload: OrderCheckoutPayload) => {
      const origin = window.location.origin;
      return orderCheckoutService.checkout(kind, payload, {
        success_url: `${origin}${routes.history}`,
        cancel_url: `${origin}${checkoutHref(kind, payload.identifier)}`,
      });
    },
    onSuccess: (res, payload) => {
      finish(res, { history: routes.history, cancelHref: checkoutHref(kind, payload.identifier) }, "Order placed");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
