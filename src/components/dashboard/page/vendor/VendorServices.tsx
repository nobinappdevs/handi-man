"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleAlert, ImageOff, Pencil, Plus, Search, Trash2, Wrench } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useDeleteService, useVendorServices, type ServiceTone, type VendorListing } from "@/hooks/useVendorServices";
import { Panel, SkLine } from "@/components/dashboard/Panel";
import { Pagination } from "@/components/dashboard/Pagination";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { SquareIconButton } from "@/components/ui/SquareIconButton";
import { cn } from "@/components/ui/cn";
import { DASH_ROUTES } from "@/components/dashboard/dashboardData";
import { money } from "@/lib/money";

/** Three rows of the three-column grid. */
const PAGE_SIZE = 9;

const GRID =
  "grid grid-cols-1 gap-[clamp(16px,1.8vw,24px)] min-[640px]:grid-cols-2 min-[1180px]:grid-cols-3";

/* The status flag sits on the photo, so it is a solid fill - an outline would
   vanish into a busy image. */
const TONE_FILL: Record<ServiceTone, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  muted: "bg-muted",
};

const CREATE_HREF = DASH_ROUTES.vendorServiceCreate;
const editHref = (id: number) => `${DASH_ROUTES.vendorServiceEdit}?id=${id}`;

/* The primary button's look on a link - adding a service is a page now. */
const ADD_LINK =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-primary px-5 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition hover:bg-primary-dark";

/**
 * The vendor's service listings (`GET /vendors/service/list`).
 *
 * A card per listing, in the public catalogue's vocabulary - photo, category,
 * name, price per unit - so the vendor sees it the way a customer will, plus
 * what only the owner needs: the review status, the admin's reason when a
 * listing is rejected, and Edit / Delete.
 *
 * The API sends every listing at once, so search and paging are client-side.
 * The currency is not in the payload; listings are priced in the site
 * currency the form itself names.
 */
export function VendorServices() {
  const { t } = useLang();
  const { data: listings = [], isLoading } = useVendorServices();
  const remove = useDeleteService();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<VendorListing | null>(null);

  const currency = t("dashboard.vendor.services.form.currency");
  const q = query.trim().toLowerCase();
  const matches = q
    ? listings.filter((l) => `${l.name} ${l.category} ${l.item}`.toLowerCase().includes(q))
    : listings;

  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  /* Clamped, not stored: a delete or a search can shrink the list under the
     current page, and the screen should land on the last real page rather
     than an empty one. */
  const current = Math.min(page, pageCount);
  const shown = matches.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      {/* ── Toolbar ── */}
      <Panel className="flex flex-wrap items-center gap-3 p-[clamp(14px,1.6vw,18px)]">
        <span className="flex min-w-0 flex-auto items-baseline gap-2">
          <span className="truncate text-[clamp(16px,1.6vw,19px)] font-semibold tracking-[-0.02em] text-heading">
            {t("dashboard.vendor.services.title")}
          </span>
          <span className="flex-none bg-brand/10 px-2.25 py-0.75 text-[12px] font-medium text-brand tabular-nums">
            {listings.length}
          </span>
        </span>

        <label className="relative flex h-11 min-w-0 flex-[1_1_220px] items-center border border-border bg-surface transition-colors focus-within:border-primary min-[760px]:max-w-80">
          <Search size={15} strokeWidth={2} aria-hidden className="pointer-events-none absolute inset-s-3.5 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t("dashboard.vendor.services.searchPlaceholder")}
            aria-label={t("dashboard.vendor.services.searchPlaceholder")}
            className="h-full w-full bg-transparent ps-10 pe-3 text-[14px] text-heading outline-none placeholder:text-muted"
          />
        </label>

        <Link href={CREATE_HREF} className={ADD_LINK}>
          <Plus size={16} strokeWidth={2.4} aria-hidden />
          {t("dashboard.vendor.services.add")}
        </Link>
      </Panel>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className={GRID}>
          {Array.from({ length: 6 }, (_, i) => (
            <Panel key={i} className="flex flex-col">
              <SkLine className="aspect-[1.6] w-full" />
              <div className="flex flex-col gap-3 p-[clamp(14px,1.6vw,18px)]">
                <SkLine className="h-3 w-1/3" />
                <SkLine className="h-5 w-4/5" />
                <SkLine className="h-4 w-1/2" />
              </div>
            </Panel>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <Panel className="flex flex-col items-center gap-3 px-6 py-[clamp(40px,6vw,72px)] text-center">
          <span className="flex h-14 w-14 items-center justify-center bg-brand/12 text-brand">
            <Wrench size={24} strokeWidth={1.6} aria-hidden />
          </span>
          <span className="text-[16px] font-semibold text-heading">
            {t(q ? "dashboard.vendor.services.noMatch" : "dashboard.vendor.services.emptyTitle")}
          </span>
          <span className="max-w-[44ch] text-[13.5px] text-muted">
            {t(q ? "dashboard.vendor.services.noMatchHint" : "dashboard.vendor.services.emptyBody")}
          </span>
          {!q && (
            <Link href={CREATE_HREF} className={`${ADD_LINK} mt-2`}>
              <Plus size={16} strokeWidth={2.4} aria-hidden />
              {t("dashboard.vendor.services.add")}
            </Link>
          )}
        </Panel>
      ) : (
        <div className={GRID}>
          {shown.map((listing) => (
            <ServiceCard
              key={listing.id}
              listing={listing}
              currency={currency}
              editHref={editHref(listing.id)}
              onDelete={() => setDeleting(listing)}
            />
          ))}
        </div>
      )}

      {!isLoading && matches.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12.5px] text-muted tabular-nums">
            {t("dashboard.common.showing")} {(current - 1) * PAGE_SIZE + 1}–
            {Math.min(current * PAGE_SIZE, matches.length)} {t("dashboard.common.of")} {matches.length}
          </span>
          <Pagination page={current} count={pageCount} onPage={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        tone="danger"
        busy={remove.isPending}
        icon={<Trash2 size={22} strokeWidth={2} aria-hidden />}
        title={t("dashboard.vendor.services.deleteTitle")}
        description={deleting?.name}
        confirmLabel={t("dashboard.vendor.services.delete")}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}

function ServiceCard({
  listing,
  currency,
  editHref,
  onDelete,
}: {
  listing: VendorListing;
  currency: string;
  editHref: string;
  onDelete: () => void;
}) {
  const { t } = useLang();
  const [broken, setBroken] = useState(false);

  return (
    <Panel className="group flex flex-col overflow-hidden transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-[1.6] overflow-hidden bg-sunk">
        {listing.image && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote storage URL in a static-export app
          <img
            src={listing.image}
            alt=""
            aria-hidden
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-brand/10 text-brand">
            <ImageOff size={30} strokeWidth={1.4} aria-hidden />
          </span>
        )}

        {listing.status && (
          <span
            className={cn(
              "absolute top-3 inset-s-3 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-widest text-white uppercase",
              TONE_FILL[listing.tone],
            )}
          >
            <span aria-hidden className="h-1.5 w-1.5 bg-current" />
            {listing.status}
          </span>
        )}
      </div>

      <div className="flex flex-auto flex-col gap-2 p-[clamp(14px,1.6vw,18px)]">
        {listing.category && (
          <span className="text-[11.5px] font-bold tracking-[0.12em] text-brand uppercase">{listing.category}</span>
        )}
        <h3 title={listing.name} className="line-clamp-2 text-[16px] leading-[1.3] font-bold tracking-[-0.015em] text-heading">
          {listing.name}
        </h3>
        {listing.details && (
          <p className="line-clamp-2 text-[13px] leading-[1.55] text-muted">{listing.details}</p>
        )}

        {listing.rejectedReason && (
          <p className="mt-1 flex items-start gap-2 border border-danger/30 bg-danger/8 px-3 py-2 text-[12.5px] leading-normal text-danger">
            <CircleAlert size={14} strokeWidth={2.2} aria-hidden className="mt-0.5 flex-none" />
            <span>{listing.rejectedReason}</span>
          </p>
        )}

        <span className="mt-auto flex items-baseline gap-1.5 pt-2">
          <span className="text-[clamp(19px,1.8vw,22px)] leading-none font-bold tracking-[-0.03em] text-brand tabular-nums">
            {money(listing.price, currency)}
          </span>
          {listing.item && <span className="text-[12.5px] text-muted">/ {listing.item}</span>}
        </span>
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-sunk px-[clamp(14px,1.6vw,18px)] py-2.5">
        <Link
          href={editHref}
          className="inline-flex h-9 flex-auto items-center justify-center gap-2 border border-border bg-card px-3.5 text-xs font-semibold text-heading transition hover:border-primary/50 hover:text-primary"
        >
          <Pencil size={13} strokeWidth={2.2} aria-hidden />
          {t("dashboard.vendor.services.edit")}
        </Link>
        <SquareIconButton
          size={36}
          onClick={onDelete}
          aria-label={t("dashboard.vendor.services.delete")}
          title={t("dashboard.vendor.services.delete")}
          className="hover:border-danger hover:text-danger"
        >
          <Trash2 size={15} strokeWidth={2} aria-hidden />
        </SquareIconButton>
      </div>
    </Panel>
  );
}
