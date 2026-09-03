import { z } from "zod";

/** Stable stored values; the visible names come from i18n. */
export const ADDRESS_LABELS = ["home", "work", "other"] as const;
export type AddressLabel = (typeof ADDRESS_LABELS)[number];

export const addressRequestSchema = z.object({
  /** The full postal address — the one line every consumer of this needs. */
  address: z.string().trim().min(1, "Address is required"),
  /** Flat, building or landmark. Optional: plenty of addresses do not have one. */
  landmark: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  label: z.enum(ADDRESS_LABELS, { message: "Choose where to save this" }),
  /*
   * A Google Maps link. OPTIONAL, and deliberately so — the old screen made it
   * required, which meant an address could not be saved without first going to
   * Google, finding the place and copying an embed. The rider needs the postal
   * address and a phone number; the map is a convenience on top.
   */
  mapLink: z.string().trim().url("Enter a valid link").or(z.literal("")).optional(),
  isDefault: z.boolean().optional(),
});

export type AddressRequest = z.infer<typeof addressRequestSchema>;

/** A stored address is a request plus the id the store assigns. */
export type SavedAddress = AddressRequest & { id: string };
