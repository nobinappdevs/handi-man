"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { vendorScheduleService } from "@/services/vendorSchedule.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import type { ScheduleSlotRequest } from "@/schemas/schedule.schema";

const SLOTS_KEY = ["vendor-schedule", "slots"] as const;
const DAYS_KEY = ["vendor-schedule", "days"] as const;

/** A bookable time slot. `start` / `end` are "HH:mm" - the time input's format. */
export interface ScheduleSlot {
  id: number;
  start: string;
  end: string;
}

/** "20:00:00" → "20:00". */
const hhmm = (t = "") => t.slice(0, 5);

/** GET /vendors/service/schedule/list - in the order the API sends, as the old page showed it. */
export function useScheduleSlots() {
  return useQuery({
    queryKey: SLOTS_KEY,
    queryFn: () => vendorScheduleService.list(),
    select: (res): ScheduleSlot[] =>
      (res.data?.schedule ?? []).map((s) => ({ id: s.id, start: hhmm(s.start_time), end: hhmm(s.end_time) })),
  });
}

/** GET /vendors/service/schedule/date/number - parsed; 0 when unset. */
export function useBookingDays() {
  return useQuery({
    queryKey: DAYS_KEY,
    queryFn: () => vendorScheduleService.getDays(),
    select: (res) => Number(res.data?.schedule_number) || 0,
  });
}

function useScheduleMutation<TArg>(
  run: (arg: TArg) => Promise<unknown>,
  fallback: string,
  key: readonly unknown[],
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, fallback));
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useCreateSlot() {
  return useScheduleMutation(
    (v: ScheduleSlotRequest) => vendorScheduleService.create(v),
    "Time slot added",
    SLOTS_KEY,
  );
}

export function useUpdateSlot() {
  return useScheduleMutation(
    ({ id, values }: { id: number; values: ScheduleSlotRequest }) => vendorScheduleService.update(id, values),
    "Time slot updated",
    SLOTS_KEY,
  );
}

export function useDeleteSlot() {
  return useScheduleMutation((id: number) => vendorScheduleService.remove(id), "Time slot deleted", SLOTS_KEY);
}

export function useUpdateBookingDays() {
  return useScheduleMutation(
    (days: number) => vendorScheduleService.updateDays(days),
    "Booking window updated",
    DAYS_KEY,
  );
}
