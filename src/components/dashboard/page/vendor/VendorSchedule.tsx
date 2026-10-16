"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useIsClient } from "@/hooks/useIsClient";
import {
  useBookingDays,
  useCreateSlot,
  useDeleteSlot,
  useScheduleSlots,
  useUpdateBookingDays,
  useUpdateSlot,
  type ScheduleSlot,
} from "@/hooks/useVendorSchedule";
import {
  BOOKING_DAYS_MAX,
  bookingDaysSchema,
  scheduleSlotSchema,
  type BookingDaysRequest,
  type ScheduleSlotRequest,
} from "@/schemas/schedule.schema";
import { Panel, SkLine } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { TimePicker } from "@/components/ui/TimePicker";
import { SquareIconButton } from "@/components/ui/SquareIconButton";
import { cn } from "@/components/ui/cn";

/** How many of the bookable dates the preview spells out before "+N more". */
const PREVIEW_DATES = 10;

/** "20:00" → "8:00 PM". */
function to12h(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * The vendor's Service Schedule - the two things that decide when customers
 * can book them:
 *
 *  1. **Booking window** - how many days ahead, from today, a customer may
 *     pick (`/schedule/date/*`). The preview under it lists the actual dates
 *     the number currently in the box would open, before it is saved.
 *  2. **Time slots** - the hours offered on each of those days
 *     (`/schedule/list|store|update|delete`), as cards rather than a
 *     four-column table: a slot is one fact, "8:00 PM – 9:00 PM", and its
 *     length is worth showing beside it.
 *
 * Slots stay in the order the API sends them, as on the old page.
 */
export function VendorSchedule() {
  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      <BookingWindow />
      <TimeSlots />
    </div>
  );
}

/* ─────────────────────────── 1 · Booking window ─────────────────────────── */

function BookingWindow() {
  const { t, lang } = useLang();
  const isClient = useIsClient();
  const { data: saved, isLoading } = useBookingDays();
  const update = useUpdateBookingDays();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BookingDaysRequest>({
    resolver: zodResolver(bookingDaysSchema),
    defaultValues: { days: "" },
  });

  /* The saved number fills the box once it arrives, and again after a save. */
  useEffect(() => {
    if (saved !== undefined) reset({ days: saved ? String(saved) : "" });
  }, [saved, reset]);

  const typed = useWatch({ control, name: "days" });
  const days = /^\d+$/.test(typed ?? "") ? Math.min(Number(typed), BOOKING_DAYS_MAX) : 0;

  /* Today plus the next `days - 1`. Client-only: a static export prerenders
     at build time, and a date baked in then would be wrong - and mismatch on
     hydration - by the time anyone opens the page. */
  const dates = isClient
    ? Array.from({ length: Math.min(days, PREVIEW_DATES) }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
      })
    : [];
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString(lang, o);
  const last = isClient && days > 0 ? new Date(Date.now() + (days - 1) * 86_400_000) : null;

  return (
    <Panel>
      <div className="flex flex-wrap items-start gap-4 border-b border-border p-[clamp(16px,1.8vw,24px)]">
        <span className="flex h-11 w-11 flex-none items-center justify-center bg-brand/12 text-brand">
          <CalendarRange size={20} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="flex min-w-0 flex-auto flex-col gap-1">
          <h2 className="text-[clamp(16px,1.7vw,19px)] leading-tight font-semibold tracking-[-0.02em]">
            {t("dashboard.vendor.schedule.windowTitle")}
          </h2>
          <span className="text-[13px] leading-normal font-normal text-muted">
            {t("dashboard.vendor.schedule.windowHint")}
          </span>
        </span>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit((v) => update.mutate(Number(v.days)))}
        className="flex flex-col gap-5 p-[clamp(16px,1.8vw,24px)]"
      >
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex w-full max-w-60 flex-col gap-1.5">
            <Controller
              name="days"
              control={control}
              render={({ field }) => (
                <QuantityStepper
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  min={1}
                  max={BOOKING_DAYS_MAX}
                  invalid={Boolean(errors.days)}
                  decreaseLabel={t("dashboard.vendor.schedule.fewerDays")}
                  increaseLabel={t("dashboard.vendor.schedule.moreDays")}
                />
              )}
            />
            {errors.days?.message && <p className="text-xs text-danger">{errors.days.message}</p>}
          </div>
          <span className="flex h-12 items-center text-[14px] font-medium text-body">
            {t("dashboard.vendor.schedule.daysUnit")}
          </span>
          <Button type="submit" size="lg" loading={update.isPending} disabled={isLoading || !isDirty} className="ms-auto">
            {t("common.save")}
          </Button>
        </div>

        {/* What the number in the box would open - live, before saving. */}
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <span className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[12px] font-bold tracking-widest text-muted uppercase">
              {t("dashboard.vendor.schedule.previewTitle")}
            </span>
            {last && dates[0] && (
              <span className="text-[13px] font-semibold text-heading">
                {fmt(dates[0], { day: "numeric", month: "short" })} – {fmt(last, { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </span>

          {isLoading ? (
            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <SkLine key={i} className="h-16 w-16" />
              ))}
            </div>
          ) : dates.length === 0 ? (
            <span className="text-[13.5px] text-muted">{t("dashboard.vendor.schedule.previewEmpty")}</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dates.map((d, i) => (
                <span
                  key={d.toDateString()}
                  className={cn(
                    "flex w-16 flex-none flex-col items-center gap-0.5 border py-2",
                    i === 0 ? "border-primary bg-primary text-white" : "border-border bg-surface text-heading",
                  )}
                >
                  <span className={cn("text-[11px] font-semibold uppercase", i === 0 ? "text-white/80" : "text-muted")}>
                    {fmt(d, { weekday: "short" })}
                  </span>
                  <span className="text-[19px] leading-none font-bold tabular-nums">{d.getDate()}</span>
                  <span className={cn("text-[11px] font-medium", i === 0 ? "text-white/80" : "text-muted")}>
                    {fmt(d, { month: "short" })}
                  </span>
                </span>
              ))}
              {days > PREVIEW_DATES && (
                <span className="flex w-16 flex-none items-center justify-center border border-dashed border-border text-[13px] font-semibold text-muted tabular-nums">
                  +{days - PREVIEW_DATES}
                </span>
              )}
            </div>
          )}
        </div>
      </form>
    </Panel>
  );
}

/* ─────────────────────────── 2 · Time slots ─────────────────────────── */

/** What the slot dialog is doing. */
type SlotDialog = { open: false } | { open: true; slot: ScheduleSlot | null };

function TimeSlots() {
  const { t } = useLang();
  const { data: slots = [], isLoading } = useScheduleSlots();
  const remove = useDeleteSlot();
  const [dialog, setDialog] = useState<SlotDialog>({ open: false });
  const [deleting, setDeleting] = useState<ScheduleSlot | null>(null);

  const length = (s: ScheduleSlot) => {
    const mins = minutesOf(s.end) - minutesOf(s.start);
    if (!(mins > 0)) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return [h && `${h}${t("dashboard.vendor.schedule.hourShort")}`, m && `${m}${t("dashboard.vendor.schedule.minuteShort")}`]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-4 border-b border-border p-[clamp(16px,1.8vw,24px)]">
        <span className="flex h-11 w-11 flex-none items-center justify-center bg-brand/12 text-brand">
          <Clock size={20} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="flex min-w-0 flex-auto flex-col gap-1">
          <span className="flex items-center gap-2">
            <h2 className="text-[clamp(16px,1.7vw,19px)] leading-tight font-semibold tracking-[-0.02em]">
              {t("dashboard.vendor.schedule.slotsTitle")}
            </h2>
            <span className="flex-none bg-brand/10 px-2.25 py-0.75 text-[12px] font-medium text-brand tabular-nums">
              {slots.length}
            </span>
          </span>
          <span className="text-[13px] leading-normal font-normal text-muted">
            {t("dashboard.vendor.schedule.slotsHint")}
          </span>
        </span>
        <Button
          onClick={() => setDialog({ open: true, slot: null })}
          leftIcon={<Plus size={16} strokeWidth={2.4} aria-hidden />}
        >
          {t("dashboard.vendor.schedule.addSlot")}
        </Button>
      </div>

      <div className="p-[clamp(16px,1.8vw,24px)]">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[1180px]:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <SkLine key={i} className="h-19 w-full" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-[clamp(28px,4vw,48px)] text-center">
            <span className="text-[15.5px] font-semibold text-heading">{t("dashboard.vendor.schedule.emptyTitle")}</span>
            <span className="max-w-[44ch] text-[13.5px] text-muted">{t("dashboard.vendor.schedule.emptyBody")}</span>
            <Button
              className="mt-1"
              onClick={() => setDialog({ open: true, slot: null })}
              leftIcon={<Plus size={16} strokeWidth={2.4} aria-hidden />}
            >
              {t("dashboard.vendor.schedule.addSlot")}
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[1180px]:grid-cols-3">
            {slots.map((slot, i) => (
              <li
                key={slot.id}
                className="group flex items-center gap-3.5 border border-border bg-surface px-4 py-3.5 transition-colors hover:border-primary/50"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center bg-card font-display text-[13px] font-bold text-brand tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-auto flex-col gap-1">
                  <span className="truncate text-[15.5px] font-bold tracking-[-0.015em] text-heading tabular-nums">
                    {to12h(slot.start)} – {to12h(slot.end)}
                  </span>
                  {length(slot) && (
                    <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
                      <Clock size={12} strokeWidth={2} aria-hidden />
                      {length(slot)}
                    </span>
                  )}
                </span>
                <span className="flex flex-none items-center gap-1.5">
                  <SquareIconButton
                    size={36}
                    onClick={() => setDialog({ open: true, slot })}
                    aria-label={t("dashboard.vendor.schedule.editSlot")}
                    title={t("dashboard.vendor.schedule.editSlot")}
                  >
                    <Pencil size={14} strokeWidth={2} aria-hidden />
                  </SquareIconButton>
                  <SquareIconButton
                    size={36}
                    onClick={() => setDeleting(slot)}
                    aria-label={t("dashboard.vendor.schedule.deleteSlot")}
                    title={t("dashboard.vendor.schedule.deleteSlot")}
                    className="hover:border-danger hover:text-danger"
                  >
                    <Trash2 size={14} strokeWidth={2} aria-hidden />
                  </SquareIconButton>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Keyed by slot: each open starts from that slot's times (or blank). */}
      <SlotDialog
        key={dialog.open ? (dialog.slot?.id ?? "new") : "closed"}
        open={dialog.open}
        slot={dialog.open ? dialog.slot : null}
        onClose={() => setDialog({ open: false })}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        tone="danger"
        busy={remove.isPending}
        icon={<Trash2 size={22} strokeWidth={2} aria-hidden />}
        title={t("dashboard.vendor.schedule.deleteTitle")}
        description={deleting ? `${to12h(deleting.start)} – ${to12h(deleting.end)}` : ""}
        confirmLabel={t("dashboard.vendor.schedule.deleteSlot")}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </Panel>
  );
}

/** Add or edit one slot - `slot` null adds. */
function SlotDialog({ open, slot, onClose }: { open: boolean; slot: ScheduleSlot | null; onClose: () => void }) {
  const { t } = useLang();
  const create = useCreateSlot();
  const update = useUpdateSlot();
  const busy = create.isPending || update.isPending;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleSlotRequest>({
    resolver: zodResolver(scheduleSlotSchema),
    defaultValues: { start_time: slot?.start ?? "", end_time: slot?.end ?? "" },
  });

  const submit = (values: ScheduleSlotRequest) => {
    if (slot) update.mutate({ id: slot.id, values }, { onSuccess: onClose });
    else create.mutate(values, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={busy}
      size="lg"
      labelledBy="slot-dialog-title"
      icon={slot ? <Pencil size={16} strokeWidth={2.2} aria-hidden /> : <Plus size={17} strokeWidth={2.4} aria-hidden />}
      title={t(slot ? "dashboard.vendor.schedule.editSlot" : "dashboard.vendor.schedule.addSlot")}
    >
      <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-5 p-[clamp(16px,1.8vw,24px)]">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
          <Controller
            name="start_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                required
                label={t("dashboard.vendor.schedule.start")}
                error={errors.start_time?.message}
              />
            )}
          />
          <Controller
            name="end_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                required
                label={t("dashboard.vendor.schedule.end")}
                error={errors.end_time?.message}
              />
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" fullWidth disabled={busy} onClick={onClose} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button type="submit" fullWidth loading={busy} className="flex-1">
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
