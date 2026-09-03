"use client";

import { useState } from "react";
import {
  Building2, ExternalLink, Home, MapPin, MapPinPlus, Pencil, Phone, Star, Trash2,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import {
  useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress, useUpdateAddress,
} from "@/hooks/useAddresses";
import { Panel, PANEL_BODY, SkLine } from "@/components/dashboard/Panel";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { AddressDialog } from "@/components/dashboard/page/address/AddressDialog";
import { Button } from "@/components/ui/Button";
import { SquareIconButton } from "@/components/ui/SquareIconButton";
import { cn } from "@/components/ui/cn";
import type { AddressLabel, AddressRequest, SavedAddress } from "@/schemas/address.schema";

const LABEL_ICON: Record<AddressLabel, typeof Home> = {
  home: Home,
  work: Building2,
  other: MapPin,
};

/**
 * Saved addresses.
 *
 * Two things the old screen did not do, and both are why it needed opening an
 * edit dialog to answer basic questions:
 *
 *   1. The card shows the WHOLE record — landmark and phone included. Those are
 *      what a courier actually needs, and hiding them behind an edit button
 *      made the list a set of unlabelled boxes.
 *   2. One address is the default. A saved-address list with no default has
 *      nothing for a booking or a parcel to pre-fill from, which is most of the
 *      reason to save one.
 */
export function Addresses() {
  const { t } = useLang();

  const { data, isLoading } = useAddresses();
  const rows = (data?.data ?? []) as SavedAddress[];

  const create = useCreateAddress(t("dashboard.address.toastAdded"));
  const update = useUpdateAddress(t("dashboard.address.toastUpdated"));
  const remove = useDeleteAddress(t("dashboard.address.toastRemoved"));
  const setDefault = useSetDefaultAddress(t("dashboard.address.toastDefault"));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedAddress | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: SavedAddress) {
    setEditing(row);
    setDialogOpen(true);
  }

  const saving = create.isPending || update.isPending;

  function onSubmit(values: AddressRequest) {
    const done = { onSuccess: () => setDialogOpen(false) };
    if (editing) update.mutate({ id: editing.id, payload: values }, done);
    else create.mutate(values, done);
  }

  const addButton = (
    <Button onClick={openAdd} leftIcon={<MapPinPlus size={16} strokeWidth={2.2} aria-hidden />}>
      {t("dashboard.address.addAddress")}
    </Button>
  );

  return (
    <div className="flex flex-col gap-[clamp(16px,1.8vw,24px)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[clamp(16px,1.6vw,19px)] font-semibold tracking-[-0.02em] text-heading">
          {t("dashboard.address.savedTitle")}
          {rows.length > 0 && <span className="inline ms-2 text-muted">({rows.length})</span>}
        </span>
        {rows.length > 0 && addButton}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-[clamp(16px,1.8vw,24px)] min-[700px]:grid-cols-2 min-[1180px]:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Panel key={i}>
              <div className={`flex flex-col gap-3 ${PANEL_BODY}`}>
                <SkLine className="h-10 w-10" />
                <SkLine className="h-4 w-24" />
                <SkLine className="h-3 w-full" />
                <SkLine className="h-3 w-2/3" />
              </div>
            </Panel>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Panel>
          <div className={`flex flex-col items-center gap-4 py-[clamp(32px,5vw,64px)] text-center ${PANEL_BODY}`}>
            <span className="flex h-14 w-14 items-center justify-center bg-brand/14 text-brand">
              <MapPinPlus size={24} strokeWidth={1.8} aria-hidden />
            </span>
            <span className="text-[17px] font-bold tracking-[-0.02em] text-heading">
              {t("dashboard.address.emptyTitle")}
            </span>
            <p className="max-w-[42ch] text-[13.5px] leading-[1.55]">
              {t("dashboard.address.emptyBody")}
            </p>
            {addButton}
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 items-start gap-[clamp(16px,1.8vw,24px)] min-[700px]:grid-cols-2 min-[1180px]:grid-cols-3">
          {rows.map((row) => {
            const Icon = LABEL_ICON[row.label] ?? MapPin;
            return (
              <section
                key={row.id}
                className={cn(
                  "flex min-w-0 flex-col border bg-card transition-colors",
                  /* The default is marked by its border, not just a badge — it
                     has to be findable at a glance across a wrapped grid. */
                  row.isDefault ? "border-primary" : "border-border",
                )}
              >
                <div className={`flex min-w-0 flex-auto flex-col gap-3 ${PANEL_BODY}`}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 flex-none items-center justify-center bg-brand/14 text-brand">
                      <Icon size={19} strokeWidth={2} aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-auto flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[15.5px] font-bold tracking-[-0.015em] text-heading">
                          {t(`dashboard.address.labels.${row.label}`)}
                        </span>
                        {row.isDefault && (
                          <span className="inline-flex items-center gap-1 bg-primary px-2 py-0.5 text-[10.5px] font-bold tracking-[0.12em] text-white uppercase">
                            <Star size={9} strokeWidth={3} aria-hidden />
                            {t("dashboard.address.defaultBadge")}
                          </span>
                        )}
                      </span>
                      <span className="text-[13.5px] leading-[1.5] font-normal text-body">
                        {row.address}
                      </span>
                    </span>
                  </div>

                  {row.landmark && (
                    <span className="flex items-start gap-2 text-[12.5px] leading-[1.5] text-muted">
                      <Building2 size={13} strokeWidth={2} aria-hidden className="mt-0.5 flex-none" />
                      {row.landmark}
                    </span>
                  )}

                  <span className="flex items-center gap-2 text-[12.5px] text-muted">
                    <Phone size={13} strokeWidth={2} aria-hidden className="flex-none" />
                    {row.phone}
                  </span>
                </div>

                <div className="flex items-center gap-2 border-t border-border bg-sunk px-[clamp(14px,1.6vw,18px)] py-2.5">
                  {row.isDefault ? (
                    <span className="flex-auto text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
                      {t("dashboard.address.inUse")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefault.mutate(row.id)}
                      className="flex-auto cursor-pointer text-start text-[12px] font-bold tracking-[0.1em] text-brand uppercase transition-opacity hover:opacity-70"
                    >
                      {t("dashboard.address.setDefault")}
                    </button>
                  )}

                  {row.mapLink && (
                    <a
                      href={row.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("dashboard.address.viewMap")}
                      title={t("dashboard.address.viewMap")}
                      className="flex h-9 w-9 flex-none items-center justify-center border border-border text-heading transition-colors hover:border-primary hover:text-brand"
                    >
                      <ExternalLink size={15} strokeWidth={2} aria-hidden />
                    </a>
                  )}
                  <SquareIconButton
                    size={36}
                    onClick={() => openEdit(row)}
                    aria-label={t("dashboard.address.edit")}
                    title={t("dashboard.address.edit")}
                  >
                    <Pencil size={15} strokeWidth={2} aria-hidden />
                  </SquareIconButton>
                  <SquareIconButton
                    size={36}
                    onClick={() => setPendingDelete(row)}
                    aria-label={t("dashboard.address.delete")}
                    title={t("dashboard.address.delete")}
                    className="hover:border-danger hover:text-danger"
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden />
                  </SquareIconButton>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <AddressDialog
        open={dialogOpen}
        editing={editing}
        busy={saving}
        onClose={() => setDialogOpen(false)}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        busy={remove.isPending}
        tone="danger"
        icon={<Trash2 size={22} strokeWidth={2} aria-hidden />}
        title={t("dashboard.address.deleteTitle")}
        description={pendingDelete?.address}
        confirmLabel={t("dashboard.address.delete")}
        onConfirm={() =>
          pendingDelete &&
          remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })
        }
      />
    </div>
  );
}
