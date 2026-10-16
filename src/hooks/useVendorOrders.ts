"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  vendorOrderService,
  type VendorOrderDetails,
  type VendorOrderListData,
  type VendorOrderRecord,
} from "@/services/vendorOrder.service";
import { VENDOR_DASHBOARD_KEY } from "@/hooks/useDashboard";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";

export const VENDOR_ORDERS_KEY = ["vendor-orders"] as const;
const viewKey = (id: number) => ["vendor-orders", "view", id] as const;

/** The API's numeric status, named. `hold` has no action of its own. */
export type VendorJobStatus = "pending" | "processing" | "completed" | "canceled" | "hold";

const STATUS_BY_CODE: Record<string, VendorJobStatus> = {
  "1": "completed",
  "2": "pending",
  "3": "canceled",
  "4": "hold",
  "5": "processing",
};

/** One service booked in an order. */
export interface VendorJobLine {
  name: string;
  item: string;
  quantity: number;
  /** Unit price. */
  price: number;
  subtotal: number;
}

/** An order as the screens read it - numbers parsed, status named, actions decided. */
export interface VendorJob {
  id: number;
  trx: string;
  /** First service's name - the table's one-line summary. */
  service: string;
  item: string;
  quantity: string;
  /** Every service in the order; an order can book several. */
  lines: VendorJobLine[];
  amount: number;
  charge: number;
  discount: number;
  payable: number;
  status: VendorJobStatus;
  rejectReason: string;
  createdAt: string;
  /** Same rules the dashboard's `order_log` documents: accept/reject while
   *  pending, complete while processing. */
  canAccept: boolean;
  canReject: boolean;
  canComplete: boolean;
  details?: VendorOrderDetails;
}

const num = (v: unknown) => Number(v) || 0;

/**
 * The order's services. `order_details_info` (list AND view) is the record of
 * what was booked; `details.cart_info` (view only) is the cart it came from and
 * stands in when the first is missing.
 */
function linesOf(o: VendorOrderRecord): VendorJobLine[] {
  const booked = o.order_details_info ?? [];
  if (booked.length > 0) {
    return booked.map((l) => {
      const quantity = num(l.quantity) || 1;
      const price = num(l.single_price);
      return { name: l.service_name ?? "", item: l.item ?? "", quantity, price, subtotal: price * quantity };
    });
  }
  return (o.details?.cart_info ?? []).map((c) => {
    const quantity = num(c.qty) || 1;
    const price = num(c.price);
    return {
      name: c.name ?? "",
      item: c.options?.item ?? "",
      quantity,
      price,
      subtotal: num(c.subtotal) || price * quantity,
    };
  });
}

export function toVendorJob(o: VendorOrderRecord): VendorJob {
  const status = STATUS_BY_CODE[String(o.status)] ?? "pending";
  const lines = linesOf(o);
  const first = lines[0];
  return {
    id: o.id,
    trx: o.trx_id,
    service: first?.name ?? "",
    item: first?.item ?? "",
    quantity: first ? String(first.quantity) : "",
    lines,
    amount: num(o.request_amount),
    charge: num(o.total_charge),
    discount: num(o.discount),
    payable: num(o.payable),
    status,
    rejectReason: o.reject_reason ?? "",
    createdAt: o.created_at ?? "",
    canAccept: status === "pending",
    canReject: status === "pending",
    canComplete: status === "processing",
    details: o.details,
  };
}

/**
 * Newest first, as the old web panel and the dashboard's `order_log` show
 * them. Sorted here rather than trusted from the API: `/vendors/order/list`
 * answers oldest first, which put the latest job at the bottom of the queue
 * and out of the overview's five-row preview. Same timestamp → higher id first.
 */
function newestFirst(a: VendorJob, b: VendorJob) {
  const byDate = (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
  return byDate !== 0 ? byDate : b.id - a.id;
}

function toJobs(res: { data: VendorOrderListData }) {
  return {
    currency: res.data?.currency ?? "",
    jobs: (res.data?.order ?? []).map(toVendorJob).sort(newestFirst),
  };
}

/**
 * GET /vendors/order/list - the full queue. The overview's recent jobs read
 * the first few rows of this same query rather than `/vendors/dashboard`'s
 * `order_log`, whose rows carry no service name, charge or payable; one cache
 * entry then serves both screens, and an action on either refreshes both.
 */
export function useVendorOrders() {
  return useQuery({
    queryKey: VENDOR_ORDERS_KEY,
    queryFn: () => vendorOrderService.list(),
    select: toJobs,
    staleTime: 30 * 1000,
  });
}

/** POST /vendors/order/view - the customer and schedule, fetched when a record opens. */
export function useVendorOrderView(id: number | null) {
  return useQuery({
    queryKey: viewKey(id ?? 0),
    queryFn: () => vendorOrderService.view(id as number),
    select: (res) => {
      const record = res.data?.order?.[0];
      return record ? toVendorJob(record) : null;
    },
    enabled: id !== null,
  });
}

/**
 * The three status changes. Each refreshes the list, the opened record and the
 * dashboard - the overview's counters and chart move with every decision.
 */
function useOrderAction<TArg>(run: (arg: TArg) => Promise<unknown>, fallback: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, fallback));
      qc.invalidateQueries({ queryKey: VENDOR_ORDERS_KEY });
      qc.invalidateQueries({ queryKey: VENDOR_DASHBOARD_KEY });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useApproveOrder() {
  return useOrderAction((id: number) => vendorOrderService.approve(id), "Order accepted");
}

export function useRejectOrder() {
  return useOrderAction(vendorOrderService.reject, "Order rejected");
}

export function useCompleteOrder() {
  return useOrderAction((id: number) => vendorOrderService.complete(id), "Order completed");
}

/**
 * GET /vendors/order/print - the backend renders the PDF; this opens its link.
 * The tab is opened BEFORE the request and pointed at the link after, because
 * a `window.open` that runs after an `await` is no longer a user gesture and
 * popup blockers swallow it.
 */
export function usePrintOrder() {
  return useMutation({
    mutationFn: async (trxId: string) => {
      const tab = window.open("", "_blank");
      try {
        const res = await vendorOrderService.printLink(trxId);
        const link = res.data?.download_link;
        if (!link) throw new Error("No download link");
        if (tab) tab.location.href = link;
        else window.location.href = link;
      } catch (err) {
        tab?.close();
        throw err;
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
