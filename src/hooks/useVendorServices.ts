"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  vendorServiceService,
  type ServicePayload,
  type VendorServiceRecord,
} from "@/services/vendorService.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import { DASH_ROUTES } from "@/components/dashboard/dashboardData";
import type { ServiceListingRequest } from "@/schemas/service.schema";

export const VENDOR_SERVICES_KEY = ["vendor-services"] as const;
const detailKey = (id: number) => ["vendor-services", "edit", id] as const;

/** How a status badge is coloured - read off the backend's badge class. */
export type ServiceTone = "ok" | "warn" | "danger" | "muted";

/** A listing as the screens read it: ids as strings, price parsed, image resolved. */
export interface VendorListing {
  id: number;
  name: string;
  category: string;
  categoryId: string;
  stateId: string;
  cityId: string;
  item: string;
  price: number;
  /** `details` with the HTML stripped - the card's excerpt. */
  details: string;
  /** `details` as sent - the rich-text editor opens it with its formatting. */
  detailsHtml: string;
  image: string;
  status: string;
  tone: ServiceTone;
  rejectedReason: string;
}

interface ImagePaths {
  base_url?: string;
  default_image?: string;
  service_image_path?: string;
}

/** `base_url` ends in a slash and the paths do not start with one - but do not
 *  count on either. */
function joinUrl(...parts: (string | undefined)[]) {
  return parts
    .filter((p): p is string => Boolean(p))
    .map((p, i) => (i === 0 ? p.replace(/\/+$/, "") : p.replace(/^\/+|\/+$/g, "")))
    .join("/");
}

function imageOf(file: string | null | undefined, paths: ImagePaths) {
  if (file) return joinUrl(paths.base_url, paths.service_image_path, file);
  return paths.default_image ? joinUrl(paths.base_url, paths.default_image) : "";
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/** Rich-text HTML to plain text, for the card's excerpt: block ends become
 *  line breaks, tags go, the common entities are decoded. */
export function htmlToText(html = "") {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e: string) => ENTITIES[e] ?? "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toneOf(cls = ""): ServiceTone {
  if (/success|info/.test(cls)) return "ok";
  if (/warning/.test(cls)) return "warn";
  if (/danger/.test(cls)) return "danger";
  return "muted";
}

function toListing(s: VendorServiceRecord, paths: ImagePaths): VendorListing {
  const tag = s.string_status ?? s.stringStatus;
  return {
    id: s.id,
    name: s.service_name,
    category: s.category ?? "",
    categoryId: s.category_id !== undefined ? String(s.category_id) : "",
    stateId: s.state_id !== undefined ? String(s.state_id) : "",
    cityId: s.city_id !== undefined ? String(s.city_id) : "",
    item: s.item ?? "",
    price: Number(s.price) || 0,
    details: htmlToText(s.details),
    detailsHtml: s.details ?? "",
    image: imageOf(s.thumbnail, paths),
    status: tag?.value ?? "",
    tone: toneOf(tag?.class),
    rejectedReason: s.rejected_reason ?? "",
  };
}

/** GET /vendors/service/list */
export function useVendorServices() {
  return useQuery({
    queryKey: VENDOR_SERVICES_KEY,
    queryFn: () => vendorServiceService.list(),
    select: (res) => (res.data?.services ?? []).map((s) => toListing(s, res.data)),
    staleTime: 30 * 1000,
  });
}

/** GET /vendors/service/preview - the form's states, cities and categories.
 *  Admin-managed, so cached for the session's worth of form opens. */
export function useServiceFormOptions(enabled = true) {
  return useQuery({
    queryKey: ["vendor-services", "options"],
    queryFn: () => vendorServiceService.formOptions(),
    select: (res) => ({
      states: (res.data?.state ?? []).map((s) => ({ value: String(s.id), label: s.name })),
      cities: (res.data?.city ?? []).map((c) => ({ value: String(c.id), label: c.name, stateId: String(c.state_id) })),
      categories: (res.data?.category ?? []).map((c) => ({ value: String(c.id), label: c.name })),
    }),
    staleTime: 10 * 60 * 1000,
    enabled,
  });
}

/** GET /vendors/service/edit?id= - fresh, so the form never edits a stale copy. */
export function useVendorServiceDetail(id: number | null) {
  return useQuery({
    queryKey: detailKey(id ?? 0),
    queryFn: () => vendorServiceService.get(id as number),
    select: (res) => (res.data?.service ? toListing(res.data.service, res.data) : null),
    enabled: id !== null,
    staleTime: 0,
  });
}

/** The form's values in the API's field names. */
export function toServicePayload(v: ServiceListingRequest): ServicePayload {
  return {
    state_id: v.state,
    city_id: v.city,
    category_id: v.category,
    service_name: v.name.trim(),
    item: v.item.trim(),
    price: v.price.trim(),
    details: v.details.trim(),
    thumbnail: v.thumbnail,
  };
}

/** `backToList`: create and update are their own pages, and finish there. */
function useServiceMutation<TArg>(
  run: (arg: TArg) => Promise<unknown>,
  fallback: string,
  backToList = false,
) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: run,
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, fallback));
      qc.invalidateQueries({ queryKey: VENDOR_SERVICES_KEY });
      if (backToList) router.push(DASH_ROUTES.vendorServices);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useCreateService() {
  return useServiceMutation(
    (values: ServiceListingRequest) => vendorServiceService.create(toServicePayload(values)),
    "Service created",
    true,
  );
}

export function useUpdateService() {
  return useServiceMutation(
    ({ id, values }: { id: number; values: ServiceListingRequest }) =>
      vendorServiceService.update(id, toServicePayload(values)),
    "Service updated",
    true,
  );
}

export function useDeleteService() {
  return useServiceMutation((id: number) => vendorServiceService.remove(id), "Service deleted");
}
