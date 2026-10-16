"use client";

import { useSearchParams } from "next/navigation";
import { ServiceForm } from "@/components/dashboard/page/vendor/ServiceForm";

/**
 * `/vendors/dashboard/services/edit?id=…` - the id rides in the query, not the
 * path: a static export cannot prerender an `[id]` route for listings that do
 * not exist at build time. `useSearchParams` needs the route's `<Suspense>`.
 *
 * A missing or non-numeric id is passed on as -1, which the API answers with
 * "not found" and the form shows as such - rather than silently opening the
 * blank add form at an edit URL.
 */
export function ServiceEdit() {
  const raw = useSearchParams().get("id");
  const id = raw && /^\d+$/.test(raw) ? Number(raw) : -1;

  /* Keyed by id: moving from one listing's edit page to another's starts a
     fresh form instead of carrying the first one's edits across. */
  return <ServiceForm key={id} serviceId={id} />;
}
