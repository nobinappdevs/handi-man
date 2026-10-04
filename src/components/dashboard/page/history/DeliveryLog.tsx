"use client";

import {
  ArrowDownToLine, CalendarClock, CreditCard, MapPin, Package, Phone,
  Receipt, Store, User,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { formatDate, money } from "@/lib/money";
import { useUserTransactions } from "@/hooks/useTransactions";
import { Field, LogSkeleton, ParcelLog, Section } from "@/components/dashboard/page/history/ParcelLog";
import {
  addressLabelFor, paymentKeyFor, statusFromApi, type DeliveryOrder,
} from "@/components/dashboard/page/history/historyData";
import type { UserTransactionData } from "@/services/transaction.service";

/** `/user/transaction`'s `delivery_orders` mapped into what the table and its
 *  modal read. The API calls the parcel-and-shop block `pickup_info` even
 *  here — it is where the courier picks the parcel up FROM — and a delivery
 *  order has never carried more than one parcel, so only the first is read.
 *  There is no `address_type` on a delivery row, so the pickup address label
 *  falls back to "other" rather than guessing. */
function buildDeliveryOrders(data?: UserTransactionData): DeliveryOrder[] {
  return (data?.delivery_orders ?? []).map((row) => {
    const currency = row.currency ?? "";
    const request = Number(row.request_amount) || 0;
    const payable = Number(row.payable) || 0;
    const charge = row.charge !== undefined ? Number(row.charge) || 0 : Math.max(payable - request, 0);
    const parcel = row.pickup_info?.[0];

    return {
      no: row.trx,
      status: statusFromApi(row.status),
      placedOn: formatDate(row.date_time),
      schedule: [row.schedule_time, row.schedule_date].filter(Boolean).join(", "),
      payment: paymentKeyFor(row.payment_type, row.gateway_name),
      parcel: {
        name: parcel?.name ?? "",
        brand: parcel?.brand_name ?? "",
        size: parcel?.size ?? "",
        price: parcel?.price ? money(Number(parcel.price) || 0, currency) : "",
        quantity: Number(parcel?.quantity) || 0,
        shop: parcel?.shop ?? "",
        shopAddress: parcel?.shop_address ?? "",
        details: "",
      },
      pickup: {
        name: row.name ?? "",
        phone: row.phone ?? "",
        addressLabel: addressLabelFor(),
        address: row.address ?? "",
        landmark: row.landmark ?? "",
      },
      dropoff: {
        shortAddress: row.shortaddress ?? "",
        fullAddress: row.fulladdress ?? "",
        phone: row.delivery_phone ?? "",
      },
      totals: {
        subtotal: money(request, currency),
        charge: money(charge, currency),
        total: money(payable, currency),
      },
    };
  });
}

/**
 * The delivery log — parcels you sent out, as a table.
 *
 * The table, the modal shell and the empty state are `ParcelLog`, shared with
 * the pickup log. What is here is what a DELIVERY record holds: a shop the
 * parcel came from, and a drop-off it is going to.
 */
export function DeliveryLog() {
  const { t } = useLang();
  const k = (s: string) => t(`dashboard.delivery.${s}`);
  const { data: res, isLoading } = useUserTransactions();

  if (isLoading) return <LogSkeleton />;

  return (
    <ParcelLog
      ns="dashboard.delivery"
      icon={ArrowDownToLine}
      orders={buildDeliveryOrders(res?.data)}
      routeHeading={k("colTo")}
      routeValue={(order) => order.dropoff.shortAddress || order.dropoff.fullAddress || "—"}
      details={(order) => (
        <>
          <Section title={k("parcelSection")}>
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("parcelName")} value={order.parcel.name} />
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("brand")} value={order.parcel.brand} />
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("size")} value={order.parcel.size} />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={k("price")} value={order.parcel.price} />
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("quantity")} value={order.parcel.quantity} />
            <Field icon={<Store size={13} strokeWidth={2} aria-hidden />} label={k("shop")} value={order.parcel.shop} />
            <Field icon={<Store size={13} strokeWidth={2} aria-hidden />} label={k("shopAddress")} value={order.parcel.shopAddress} />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={k("details")} value={order.parcel.details} />
          </Section>

          <Section title={k("pickupSection")}>
            <Field icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />} label={k("schedule")} value={order.schedule} />
            <Field icon={<User size={13} strokeWidth={2} aria-hidden />} label={k("name")} value={order.pickup.name} />
            <Field icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={k("phone")} value={order.pickup.phone} />
            <Field
              icon={<MapPin size={13} strokeWidth={2} aria-hidden />}
              label={k("addressType")}
              value={t(`dashboard.address.labels.${order.pickup.addressLabel}`)}
            />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("address")} value={order.pickup.address} />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("landmark")} value={order.pickup.landmark} />
          </Section>

          <Section title={k("dropoffSection")}>
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("shortAddress")} value={order.dropoff.shortAddress} />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("fullAddress")} value={order.dropoff.fullAddress} />
            <Field icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={k("deliveryPhone")} value={order.dropoff.phone} />
          </Section>

          <Section title={k("paymentSection")}>
            <Field
              icon={<CreditCard size={13} strokeWidth={2} aria-hidden />}
              label={k("paymentType")}
              value={t(`dashboard.history.payment.${order.payment}`)}
            />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.subtotal")} value={order.totals.subtotal} />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={t("dashboard.history.charge")} value={order.totals.charge} />

            <div className="mt-3 flex items-center justify-between gap-4 border-t-2 border-border pt-3.5">
              <span className="text-[13px] font-bold tracking-[0.1em] text-heading uppercase">
                {k("totalPayable")}
              </span>
              <span className="text-[20px] font-bold tracking-[-0.03em] text-heading">
                {order.totals.total}
              </span>
            </div>
          </Section>
        </>
      )}
    />
  );
}
