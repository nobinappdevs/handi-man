"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, CheckCheck, Eye, Info, Printer, Wrench, X } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import {
  useApproveOrder,
  useCompleteOrder,
  usePrintOrder,
  useRejectOrder,
  useVendorOrderView,
  type VendorJob,
  type VendorJobStatus,
} from "@/hooks/useVendorOrders";
import { rejectOrderSchema, type RejectOrderRequest } from "@/schemas/vendorOrder.schema";
import { Panel, PanelTitle, SkLine } from "@/components/dashboard/Panel";
import { Modal } from "@/components/dashboard/Modal";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SquareIconButton } from "@/components/ui/SquareIconButton";
import { cn } from "@/components/ui/cn";
import { money, formatDate, formatDateTime } from "@/lib/money";

/**
 * A vendor's service orders as one table: the overview's "Recent jobs" (first
 * few rows, no filter, a View all link) and the Orders page (every row, with
 * the status filter) are this component with different props, so a job looks
 * and acts the same wherever it is met.
 *
 * Each row carries the actions its status allows - Accept and Reject while
 * pending, Complete while processing - plus View, which opens the full record.
 * The record is fetched on open (`/vendors/order/view`): the list rows have no
 * customer, address or schedule, and those are what a vendor opens a job for.
 *
 * The row is a `div`, not a `<button>`, because it holds buttons of its own.
 * The reference inside it is the keyboard's way in; the row's own click is the
 * mouse's shortcut to the same record.
 */

const FILTERS = ["all", "pending", "processing", "completed", "canceled", "hold"] as const;
type Filter = (typeof FILTERS)[number];

/* Job | placed | status | amount | actions. The actions column is a fixed
   width so the buttons line up row to row; `auto` would size it per row. Below
   900px it folds into two columns: job + status, then amount + actions. */
const COLS =
  "grid-cols-[minmax(0,1fr)_auto] min-[900px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_128px_112px_236px]";
const WIDE_ONLY = "hidden min-[900px]:flex";
const GUTTER = "px-[clamp(16px,1.8vw,24px)]";

/* An outline chip - a table full of filled ones reads as coloured blocks. Two
   maps because Tailwind reads class names literally. */
const STATUS_LINE: Record<VendorJobStatus, string> = {
  pending: "border-warn",
  processing: "border-primary",
  completed: "border-ok",
  canceled: "border-danger",
  hold: "border-muted",
};
const STATUS_INK: Record<VendorJobStatus, string> = {
  pending: "text-warn",
  processing: "text-brand",
  completed: "text-ok",
  canceled: "text-danger",
  hold: "text-muted",
};

function StatusChip({ status }: { status: VendorJobStatus }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.75 border py-1.25 pe-2.5 ps-2 text-[12px] font-medium tracking-[0.04em] whitespace-nowrap uppercase",
        STATUS_LINE[status],
        STATUS_INK[status],
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {t(`dashboard.charts.status.${status}`)}
    </span>
  );
}

/** A label/value line. `href` makes the value an outbound link (the map). */
function Line({
  label,
  value,
  ink = "text-heading",
  href,
}: {
  label: string;
  value?: string | null;
  ink?: string;
  href?: string;
}) {
  const has = typeof value === "string" && value.trim() !== "";
  return (
    <span className="flex items-baseline justify-between gap-4 border-b border-border py-2.25 last:border-b-0">
      <span className="flex-none text-[13.5px] font-medium text-body">{label}</span>
      {has && href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 text-end text-[13.5px] wrap-anywhere text-brand underline-offset-2 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className={cn("min-w-0 text-end text-[13.5px] wrap-anywhere", has ? ink : "text-muted")}>
          {has ? value : "—"}
        </span>
      )}
    </span>
  );
}

/** "home" → "Home", "cash_on_card" → "Cash on card". */
const humanize = (raw?: string | null) => {
  const s = (raw ?? "").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
};

/** "20:00:00 - 21:00:00" → "8:00 PM - 9:00 PM". Anything else passes through,
 *  so a backend that already formats it ("8:00 PM - 9:00 PM") is untouched. */
function formatSlot(raw?: string) {
  if (!raw) return "";
  return raw.replace(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b(?!\s?[AP]M)/gi, (_, h: string, m: string) => {
    const hour = Number(h);
    return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
  });
}

/** Only a real web link becomes clickable - never `javascript:` or a bare word. */
const safeHref = (raw?: string | null) => (raw && /^https?:\/\//i.test(raw.trim()) ? raw.trim() : undefined);

export function VendorJobsPanel({
  title,
  jobs,
  currency,
  isLoading,
  limit,
  filterable = false,
  viewAllHref,
}: {
  title: string;
  jobs: VendorJob[];
  currency: string;
  isLoading?: boolean;
  /** Show only the first `limit` rows (the overview's recent jobs). */
  limit?: number;
  /** The status tabs - on the full list, not on the overview's preview. */
  filterable?: boolean;
  /** Where "View all" goes; omitted on the page that IS all. */
  viewAllHref?: string;
}) {
  const { t } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<VendorJob | null>(null);

  const approve = useApproveOrder();
  const complete = useCompleteOrder();

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const rows = limit ? filtered.slice(0, limit) : filtered;
  const cash = (value: number) => money(value, currency);

  /* Which row's button is spinning: a mutation is one at a time per hook, and
     `variables` says which order it was called for. */
  const approvingId = approve.isPending ? approve.variables : undefined;
  const completingId = complete.isPending ? complete.variables : undefined;

  const stop = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  /* A render helper, not a component: declared in here it would be a new
     component type every render, remounting the buttons each time. */
  function renderActions(job: VendorJob) {
    return (
      <span className="flex items-center justify-end gap-2">
        {job.canAccept && (
          <Button
            size="sm"
            loading={approvingId === job.id}
            onClick={stop(() => approve.mutate(job.id))}
            leftIcon={<Check size={14} strokeWidth={2.6} aria-hidden />}
          >
            {t("dashboard.vendor.orders.accept")}
          </Button>
        )}
        {job.canReject && (
          <Button
            size="sm"
            variant="danger"
            onClick={stop(() => setRejecting(job))}
            leftIcon={<X size={14} strokeWidth={2.6} aria-hidden />}
          >
            {t("dashboard.vendor.orders.reject")}
          </Button>
        )}
        {job.canComplete && (
          <Button
            size="sm"
            loading={completingId === job.id}
            onClick={stop(() => complete.mutate(job.id))}
            leftIcon={<CheckCheck size={14} strokeWidth={2.6} aria-hidden />}
          >
            {t("dashboard.vendor.orders.complete")}
          </Button>
        )}
        <SquareIconButton
          size={36}
          onClick={stop(() => setOpenId(job.id))}
          aria-label={t("dashboard.vendor.orders.viewDetails")}
          title={t("dashboard.vendor.orders.viewDetails")}
        >
          <Eye size={15} strokeWidth={2} aria-hidden />
        </SquareIconButton>
      </span>
    );
  }

  return (
    <>
      <Panel>
        <div className={`flex flex-wrap items-center gap-x-4.5 gap-y-3 py-[clamp(16px,1.8vw,22px)] ${GUTTER}`}>
          <PanelTitle>{title}</PanelTitle>
          <span className="flex-none bg-brand/10 px-2.25 py-0.75 text-[12px] font-medium text-brand tabular-nums">
            {rows.length} / {filtered.length}
          </span>

          {filterable && (
            <div className="scroll-x ms-auto flex max-w-full flex-none border border-border">
              {FILTERS.map((key, i) => {
                const on = key === filter;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    aria-pressed={on}
                    className={cn(
                      "cursor-pointer px-3.5 py-2.25 text-[13px] font-medium whitespace-nowrap transition-colors",
                      i > 0 && "border-s border-border",
                      on ? "bg-primary text-white" : "bg-transparent text-body hover:text-heading",
                    )}
                  >
                    {key === "all" ? t("dashboard.tabs.all") : t(`dashboard.charts.status.${key}`)}
                  </button>
                );
              })}
            </div>
          )}

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="group ms-auto flex flex-none items-center gap-2 bg-primary px-4 py-2.25 text-[13px] font-medium text-white transition-colors hover:bg-primary-dark"
            >
              {t("dashboard.vendor.orders.viewAll")}
              <ArrowRight
                size={14}
                strokeWidth={2.2}
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              />
            </Link>
          )}
        </div>

        <div
          className={cn(
            "hidden gap-4 pb-2.5 text-[11.5px] font-medium tracking-widest text-muted uppercase min-[900px]:grid",
            COLS,
            GUTTER,
          )}
        >
          <span>{t("dashboard.vendor.orders.colJob")}</span>
          <span>{t("dashboard.history.placedOn")}</span>
          <span>{t("dashboard.table.status")}</span>
          <span className="text-end">{t("dashboard.vendor.orders.colAmount")}</span>
          <span className="text-end">{t("dashboard.delivery.colActions")}</span>
        </div>

        {isLoading &&
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={`flex items-center gap-4 border-t border-border py-4.5 ${GUTTER}`}>
              <SkLine className="h-9.5 w-9.5 flex-none" />
              <SkLine className="h-4 flex-1" />
              <SkLine className="h-4 w-24" />
            </div>
          ))}

        {!isLoading &&
          rows.map((job) => (
            <div
              key={job.id}
              onClick={() => setOpenId(job.id)}
              className={cn(
                "group relative grid cursor-pointer items-center gap-x-4 gap-y-3 border-t border-border py-4 transition-colors hover:bg-sunk",
                COLS,
                GUTTER,
              )}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 inset-s-0 w-0.5 bg-transparent transition-colors group-hover:bg-primary"
              />

              <span className="flex min-w-0 items-center gap-3.25">
                <span className="flex h-9.5 w-9.5 flex-none items-center justify-center bg-sunk text-brand transition-colors group-hover:bg-primary group-hover:text-white">
                  <Wrench size={18} strokeWidth={1.5} aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col gap-0.75">
                  <button
                    type="button"
                    onClick={stop(() => setOpenId(job.id))}
                    className="w-fit cursor-pointer text-start text-[14.5px] font-medium text-heading tabular-nums hover:text-brand"
                  >
                    #{job.trx}
                  </button>
                  <span className="truncate text-[12.5px] text-muted">
                    {job.service || "—"}
                    {job.lines.length > 1 ? ` +${job.lines.length - 1}` : job.item && ` · ${job.item}`}
                  </span>
                </span>
              </span>

              <span className={`min-w-0 flex-col gap-0.75 ${WIDE_ONLY}`}>
                <span className="truncate text-[14px] text-body">{formatDate(job.createdAt)}</span>
              </span>

              <span className="min-w-0 justify-self-end min-[900px]:justify-self-start">
                <StatusChip status={job.status} />
              </span>

              <span className="text-[15px] font-semibold tracking-[-0.02em] whitespace-nowrap text-heading tabular-nums min-[900px]:text-end">
                {cash(job.amount)}
              </span>

              {renderActions(job)}
            </div>
          ))}

        {!isLoading && rows.length === 0 && (
          <span className={`block border-t border-border py-12 text-center text-[14px] text-muted ${GUTTER}`}>
            {t("dashboard.common.empty")}
          </span>
        )}

        <div className={`flex flex-wrap items-center justify-between gap-2.5 border-t border-border py-3.5 ${GUTTER}`}>
          <span className="text-[12.5px] text-muted">
            {t("dashboard.common.showing")} {rows.length} {t("dashboard.common.of")} {filtered.length}{" "}
            {t("dashboard.vendor.orders.jobs")}
          </span>
          <span className="text-[12.5px] text-muted">{t("dashboard.overview.clickRow")}</span>
        </div>
      </Panel>

      <JobRecord
        id={openId}
        fallback={jobs.find((j) => j.id === openId) ?? null}
        currency={currency}
        onClose={() => setOpenId(null)}
        onReject={(job) => {
          setOpenId(null);
          setRejecting(job);
        }}
      />

      <RejectDialog job={rejecting} onClose={() => setRejecting(null)} />
    </>
  );
}

/**
 * The opened order. `fallback` is the list row, shown at once; the `view`
 * response replaces it when it lands and adds the customer half.
 */
function JobRecord({
  id,
  fallback,
  currency,
  onClose,
  onReject,
}: {
  id: number | null;
  fallback: VendorJob | null;
  currency: string;
  onClose: () => void;
  onReject: (job: VendorJob) => void;
}) {
  const { t } = useLang();
  const { data: viewed, isLoading } = useVendorOrderView(id);
  const approve = useApproveOrder();
  const complete = useCompleteOrder();
  const print = usePrintOrder();

  const job = viewed ?? fallback;
  const d = job?.details;
  const cash = (value: number) => money(value, currency);

  const payment =
    d?.payment_type === "cash_on_delivery" ? t("dashboard.history.payment.cod") : humanize(d?.payment_type);
  /* An ISO day ("2026-09-15") is formatted like every other date here; a
     backend-formatted one ("03-Oct-2026") is shown as sent. */
  const scheduleDate =
    d?.schedule_date && /^\d{4}-\d{2}-\d{2}$/.test(d.schedule_date) ? formatDate(d.schedule_date) : d?.schedule_date;
  const detailsLoading = isLoading && !d;

  return (
    <Modal
      open={id !== null}
      onClose={onClose}
      size="xl"
      tone="accent"
      labelledBy="vendor-job-title"
      icon={<Info size={16} strokeWidth={1.6} aria-hidden />}
      title={t("dashboard.overview.orderDetails")}
      aside={job ? `#${job.trx}` : undefined}
    >
      {job && (
        <>
          <div className="grid grid-cols-1 items-start gap-[clamp(14px,1.6vw,20px)] p-[clamp(16px,1.9vw,24px)] min-[760px]:grid-cols-2">
            {/* ── The order and who it is for ── */}
            <div className="flex min-w-0 flex-col gap-3.5 border border-border p-[clamp(16px,1.7vw,22px)]">
              <h4 className="text-[15.5px] font-semibold tracking-[-0.015em] text-heading">
                {t("dashboard.overview.orderInfo")}
              </h4>
              <div className="flex flex-col">
                <Line label={t("dashboard.overview.transactionId")} value={`#${job.trx}`} />
                <Line label={t("dashboard.history.placedOn")} value={formatDateTime(job.createdAt)} />

                {detailsLoading ? (
                  <div className="flex flex-col gap-3 py-3">
                    <SkLine className="h-4 w-full" />
                    <SkLine className="h-4 w-4/5" />
                    <SkLine className="h-4 w-3/5" />
                    <SkLine className="h-4 w-4/5" />
                  </div>
                ) : (
                  <>
                    <Line label={t("dashboard.vendor.orders.orderBy")} value={d?.name} />
                    <Line label={t("dashboard.history.phone")} value={d?.phone} />
                    <Line label={t("dashboard.history.addressType")} value={humanize(d?.address_type)} />
                    <Line label={t("dashboard.history.address")} value={d?.address} />
                    <Line label={t("dashboard.vendor.orders.landmark")} value={d?.landmark} />
                    {d?.google_map && (
                      <Line
                        label={t("dashboard.vendor.orders.map")}
                        value={d.google_map}
                        href={safeHref(d.google_map)}
                      />
                    )}
                    <Line label={t("dashboard.history.scheduleDate")} value={scheduleDate} />
                    <Line label={t("dashboard.history.scheduleTime")} value={formatSlot(d?.schedule_time)} />
                    <Line label={t("dashboard.overview.paymentMethod")} value={payment} />
                  </>
                )}

                <Line
                  label={t("dashboard.overview.paymentStatus")}
                  value={t(`dashboard.charts.status.${job.status}`)}
                  ink={STATUS_INK[job.status]}
                />
                {job.rejectReason && (
                  <Line label={t("dashboard.vendor.logs.rejectionReason")} value={job.rejectReason} ink="text-danger" />
                )}
              </div>
            </div>

            {/* ── What was booked, and the money ── */}
            <div className="flex min-w-0 flex-col gap-3.5 border border-border p-[clamp(16px,1.7vw,22px)]">
              {job.lines.length === 0 && (
                <h4 className="text-[15.5px] font-semibold tracking-[-0.015em] text-heading">
                  {t("dashboard.vendor.orders.service")}
                </h4>
              )}

              {job.lines.map((line, i) => (
                <div
                  key={`${line.name}-${i}`}
                  className={cn("flex flex-col gap-2", i > 0 && "border-t border-border pt-3.5")}
                >
                  <h4 className="text-[15.5px] font-semibold tracking-[-0.015em] text-heading">
                    {t("dashboard.vendor.orders.service")} {job.lines.length > 1 ? i + 1 : ""}
                  </h4>
                  <div className="flex flex-col">
                    <Line label={t("dashboard.overview.serviceName")} value={line.name} />
                    <Line label={t("dashboard.vendor.orders.item")} value={line.item} />
                    <Line label={t("dashboard.table.quantity")} value={String(line.quantity)} />
                    <Line label={t("dashboard.vendor.orders.price")} value={cash(line.price)} />
                  </div>
                </div>
              ))}

              <div className="mt-1 flex flex-col">
                {[
                  { label: t("dashboard.history.subtotal"), value: cash(job.amount) },
                  { label: t("dashboard.history.charge"), value: cash(job.charge) },
                  ...(job.discount > 0
                    ? [{ label: t("dashboard.history.discount"), value: `− ${cash(job.discount)}` }]
                    : []),
                  { label: t("dashboard.history.total"), value: cash(job.payable) },
                ].map((row, i, all) => (
                  <span
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 border-t border-border py-2.5"
                  >
                    <span className="flex-none text-[13.5px] font-medium text-body">{row.label}</span>
                    <span
                      className={cn(
                        "flex-none font-semibold tabular-nums",
                        i === all.length - 1 ? "text-[17px] text-brand" : "text-[14.5px] text-heading",
                      )}
                    >
                      {row.value}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2.5 px-[clamp(16px,1.9vw,24px)] pb-[clamp(16px,1.9vw,24px)]">
            <Button variant="outline" onClick={onClose}>
              {t("common.close")}
            </Button>
            <Button
              variant="outline"
              loading={print.isPending}
              onClick={() => print.mutate(job.trx)}
              leftIcon={<Printer size={15} strokeWidth={1.8} aria-hidden />}
            >
              {t("common.print")}
            </Button>
            {job.canReject && (
              <Button
                variant="danger"
                onClick={() => onReject(job)}
                leftIcon={<X size={15} strokeWidth={2.6} aria-hidden />}
              >
                {t("dashboard.vendor.orders.reject")}
              </Button>
            )}
            {job.canAccept && (
              <Button
                loading={approve.isPending}
                onClick={() => approve.mutate(job.id, { onSuccess: onClose })}
                leftIcon={<Check size={15} strokeWidth={2.6} aria-hidden />}
              >
                {t("dashboard.vendor.orders.accept")}
              </Button>
            )}
            {job.canComplete && (
              <Button
                loading={complete.isPending}
                onClick={() => complete.mutate(job.id, { onSuccess: onClose })}
                leftIcon={<CheckCheck size={15} strokeWidth={2.6} aria-hidden />}
              >
                {t("dashboard.vendor.orders.complete")}
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

/** Reject needs a reason - the API requires it and the customer reads it. */
function RejectDialog({ job, onClose }: { job: VendorJob | null; onClose: () => void }) {
  const { t } = useLang();
  const reject = useRejectOrder();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectOrderRequest>({
    resolver: zodResolver(rejectOrderSchema),
    defaultValues: { reject_reason: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <ConfirmDialog
      open={job !== null}
      onClose={close}
      tone="danger"
      busy={reject.isPending}
      icon={<X size={22} strokeWidth={2} aria-hidden />}
      title={t("dashboard.vendor.orders.rejectTitle")}
      description={job ? `#${job.trx}${job.service ? ` · ${job.service}` : ""}` : ""}
      confirmLabel={t("dashboard.vendor.orders.reject")}
      onConfirm={() =>
        void handleSubmit((values) => {
          if (!job) return;
          reject.mutate({ id: job.id, reject_reason: values.reject_reason.trim() }, { onSuccess: close });
        })()
      }
    >
      <div className="mt-5 text-start">
        <Controller
          name="reject_reason"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="textarea"
              rows={3}
              label={t("dashboard.vendor.orders.reasonLabel")}
              placeholder={t("dashboard.vendor.orders.reasonPlaceholder")}
              hint={t("dashboard.vendor.orders.reasonHint")}
              error={errors.reject_reason?.message}
              required
            />
          )}
        />
      </div>
    </ConfirmDialog>
  );
}
