"use client";

import {
  ArrowUpFromLine, CalendarClock, CreditCard, MapPin, Package, Phone,
  Receipt, Scale, User,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Field, ParcelLog, Section } from "@/components/dashboard/page/history/ParcelLog";
import { pickupOrders } from "@/components/dashboard/page/history/historyData";

/**
 * The pickup log — parcels a rider collected from you, as a table.
 *
 * The same `ParcelLog` the delivery log renders, so the two screens cannot
 * drift apart. What is here is what a PICKUP record holds: a weight instead of
 * the shop fields, and the collection address read as the origin rather than
 * the destination — which is also why the route column is "collect from".
 */
export function PickupLog() {
  const { t } = useLang();
  const k = (s: string) => t(`dashboard.pickup.${s}`);

  return (
    <ParcelLog
      ns="dashboard.pickup"
      icon={ArrowUpFromLine}
      orders={pickupOrders()}
      routeHeading={k("colFrom")}
      routeValue={(order) => order.collect.address || "—"}
      details={(order) => (
        <>
          <Section title={k("parcelSection")}>
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("parcelName")} value={order.parcel.name} />
            <Field icon={<Package size={13} strokeWidth={2} aria-hidden />} label={k("quantity")} value={order.parcel.quantity} />
            <Field icon={<Scale size={13} strokeWidth={2} aria-hidden />} label={k("weight")} value={order.parcel.weight} />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={k("price")} value={order.parcel.price} />
            <Field icon={<Receipt size={13} strokeWidth={2} aria-hidden />} label={k("details")} value={order.parcel.details} />
          </Section>

          <Section title={k("collectSection")}>
            <Field icon={<CalendarClock size={13} strokeWidth={2} aria-hidden />} label={k("schedule")} value={order.schedule} />
            <Field icon={<User size={13} strokeWidth={2} aria-hidden />} label={k("name")} value={order.collect.name} />
            <Field icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={k("phone")} value={order.collect.phone} />
            <Field
              icon={<MapPin size={13} strokeWidth={2} aria-hidden />}
              label={k("addressType")}
              value={t(`dashboard.address.labels.${order.collect.addressLabel}`)}
            />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("address")} value={order.collect.address} />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("landmark")} value={order.collect.landmark} />
          </Section>

          <Section title={k("dropoffSection")}>
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("shortAddress")} value={order.dropoff.shortAddress} />
            <Field icon={<MapPin size={13} strokeWidth={2} aria-hidden />} label={k("fullAddress")} value={order.dropoff.fullAddress} />
            <Field icon={<Phone size={13} strokeWidth={2} aria-hidden />} label={k("dropoffPhone")} value={order.dropoff.phone} />
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
