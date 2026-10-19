"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useLang } from "@/hooks/useLang";
import {
  serviceOrderService,
  type ServiceCheckoutPayload,
  type ServiceDetailsData,
  type ServiceReviewRecord,
} from "@/services/serviceOrder.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import { toApiDate, toPaymentOptions, toSlots, useFinishCheckout } from "@/hooks/useOrderCheckout";
import type { AddressRequest } from "@/schemas/address.schema";
import { SERVICE_ROUTES } from "@/lib/serviceRoutes";

export { SERVICE_ROUTES };

const detailsKey = (id: number, lang: string) => ["service", "details", id, lang] as const;
const ADDRESSES_KEY = ["service", "addresses"] as const;

function joinUrl(base?: string, folder?: string, file?: string | null) {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  return [base?.replace(/\/+$/, ""), folder?.replace(/^\/+|\/+$/g, ""), file.replace(/^\/+/, "")]
    .filter(Boolean)
    .join("/");
}

export interface ServiceReview {
  id: string;
  text: string;
  author: string;
  avatar: string;
  createdAt: string;
}

export interface ServiceDetails {
  id: number;
  name: string;
  item: string;
  price: number;
  image: string;
  /** The file name - `card_info` carries it as `thumbnail`. */
  thumbnail: string;
  vendor: string;
  vendorId: number;
  /** The vendor's rich-text description. UNSANITISED - render via `sanitizeHtml`. */
  html: string;
  currency: string;
  reviews: ServiceReview[];
}

function toReview(r: ServiceReviewRecord, i: number, d: ServiceDetailsData): ServiceReview {
  const u = r.user ?? {};
  const author = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "";
  return {
    id: String(r.id ?? i),
    text: String(r.review ?? r.comment ?? ""),
    author,
    avatar: joinUrl(d.base_url, d.user_image, u.image),
    createdAt: r.created_at ?? "",
  };
}

function toDetails(d: ServiceDetailsData): ServiceDetails | null {
  const s = d.serviceDetails;
  if (!s) return null;
  return {
    id: s.id,
    name: s.service_name,
    item: s.item ?? "",
    price: Number(s.price) || 0,
    image: joinUrl(d.base_url, d.service_image_path, s.image) || joinUrl(d.base_url, "", d.default_image),
    thumbnail: s.image ?? "",
    vendor: s.vendor ?? "",
    vendorId: Number(s.vendor_id) || 0,
    html: s.details ?? "",
    currency: d.currency_code ?? "",
    reviews: (d.reviews ?? []).map((r, i) => toReview(r, i, d)).filter((r) => r.text),
  };
}

/** GET /service/details?id= - public. Keyed by language: it carries `?lang=`. */
export function useServiceDetails(id: number) {
  const { lang } = useLang();
  return useQuery({
    queryKey: detailsKey(id, lang),
    queryFn: () => serviceOrderService.details(id),
    select: (res) => toDetails(res.data ?? {}),
    enabled: id > 0,
    retry: false,
  });
}

/** POST /service/review - then re-read the service, whose list it joins. */
export function useAddReview(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (review: string) => serviceOrderService.review(id, review),
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, "Review added"));
      qc.invalidateQueries({ queryKey: ["service", "details", id] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/**
 * GET /user/service/date-time - the slots, the gateways, and the booking
 * window. The window comes as a NUMBER of days (`count_date`), not a list, so
 * the dates are built here: today and the days after it, in the checkout's
 * "16-Oct-2026" format. Built on the client - a static export would bake the
 * build day in otherwise.
 */
export function useServiceSchedule() {
  return useQuery({
    queryKey: ["service", "date-time"],
    queryFn: () => serviceOrderService.dateTime(),
    select: (res) => {
      const d = res.data ?? {};
      const days = Math.max(0, Math.min(60, Number(d.dates?.[0]?.count_date) || 0));
      const now = new Date();
      const dates = Array.from({ length: days }, (_, i) => {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        return toApiDate(`${day.getDate()}-${day.getMonth() + 1}-${day.getFullYear()}`);
      });
      return {
        dates,
        slots: toSlots(d.scheduleTime),
        gateways: toPaymentOptions(d.gateways),
        paymentTypes: (d.paymentType ?? []).map((p) => ({ value: p.value, label: p.label_name ?? p.value })),
      };
    },
  });
}

/** GET /user/service/address */
export function useServiceAddresses() {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: () => serviceOrderService.addresses(),
    select: (res) => res.data?.address ?? [],
  });
}

/** POST /user/service/address/save - then re-read the list it joins. */
export function useSaveServiceAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: AddressRequest) => serviceOrderService.saveAddress(values),
    onSuccess: async (res) => {
      toast.success(getApiSuccessMessage(res, "Address added"));
      await qc.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/** POST /user/service/coupon/apply → the coupon's code and fixed amount off. */
export function useApplyCoupon() {
  return useMutation({
    mutationFn: async (coupon: string) => {
      const res = await serviceOrderService.applyCoupon(coupon.trim());
      return { res, code: res.data?.coupon?.code ?? coupon.trim(), amount: Number(res.data?.coupon?.amount) || 0 };
    },
    onSuccess: ({ res }) => toast.success(getApiSuccessMessage(res, "Coupon applied")),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/**
 * POST /user/service/checkout. Ends like every checkout (`useFinishCheckout`);
 * `onPlaced` runs once the order exists - paid here or handed to a gateway -
 * which is when the cart has done its job.
 */
export function useServiceCheckout(onPlaced: () => void) {
  const finish = useFinishCheckout();
  return useMutation({
    mutationFn: (payload: ServiceCheckoutPayload) => {
      const origin = window.location.origin;
      return serviceOrderService.checkout(payload, {
        success_url: `${origin}${SERVICE_ROUTES.history}`,
        cancel_url: `${origin}${SERVICE_ROUTES.checkout}`,
      });
    },
    onSuccess: (res) => {
      const outcome = finish(res, { history: SERVICE_ROUTES.history, cancelHref: SERVICE_ROUTES.checkout }, "Service booked");
      if (outcome !== "failed") onPlaced();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
