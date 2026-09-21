"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export const DASHBOARD_KEY = ["dashboard", "user"] as const;
export const VENDOR_DASHBOARD_KEY = ["dashboard", "vendor"] as const;

/**
 * GET /user/dashboard/cart_count.
 *
 * Short `staleTime`: the balance on this screen is the same balance a booking
 * spends, so a figure that lingers after a payment is worse than one extra
 * request. Not zero, because the overview mounts three charts off one payload
 * and a range change must not refetch.
 */
export function useUserDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: () => dashboardService.getUserDashboard(),
    staleTime: 30 * 1000,
  });
}

/**
 * GET /vendors/dashboard.
 *
 * Its own key, not a role argument on one hook: the two payloads are different
 * shapes, so a shared hook would have to return a union every caller then
 * narrows. Same cache policy though - the balance here is the one Money Out
 * spends.
 */
export function useVendorDashboard() {
  return useQuery({
    queryKey: VENDOR_DASHBOARD_KEY,
    queryFn: () => dashboardService.getVendorDashboard(),
    staleTime: 30 * 1000,
  });
}
