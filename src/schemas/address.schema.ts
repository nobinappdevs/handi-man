import { z } from "zod";

/*
 * Saved addresses — `/user/address*`.
 *
 * Field names are the API's, not ours: `mobile` (not phone), `address_type`
 * (not label), `google_map` (not mapLink). They were the friendlier names while
 * this screen ran on a localStorage stand-in; now that a real endpoint is behind
 * it, one vocabulary beats a translation layer nobody remembers to update.
 */

/** Stable stored values; the visible names come from i18n. */
export const ADDRESS_TYPES = ["home", "work", "other"] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export const addressRequestSchema = z.object({
  /** The full postal address — the one line every consumer of this needs. */
  address: z.string().trim().min(1, "Address is required"),
  /** Flat, building or landmark. Optional: plenty of addresses do not have one. */
  landmark: z.string().trim().optional(),
  mobile: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  address_type: z.enum(ADDRESS_TYPES, { message: "Choose where to save this" }),
  /*
   * A Google Maps link. OPTIONAL, and deliberately so — requiring it means an
   * address cannot be saved without first going to Google, finding the place
   * and copying a link. The courier needs the postal address and a phone
   * number; the map is a convenience on top.
   *
   * Not `.url()`: the API's own sample stores free text here ("jh vbc vkb"),
   * so rejecting anything but a URL would refuse records the backend accepts.
   */
  google_map: z.string().trim().optional(),
});

export type AddressRequest = z.infer<typeof addressRequestSchema>;

/** A row as `/user/address` returns it. `id` is a number here, not a string. */
export type SavedAddress = AddressRequest & {
  id: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
};
