import { z } from "zod";

/* ─────────────────────────── Vendor service listing ───────────────────────────
 * The vendor dashboard's "add a service" form.
 *
 * Field names are a first guess at the Laravel payload — confirm them against
 * the Handiman API collection when the vendor-service endpoint is documented,
 * then add `services/vendorService.service.ts` + `hooks/useVendorService.ts`
 * behind it. The thumbnail makes this a `multipart/form-data` request, not JSON.
 */

/**
 * The billing unit, as a fixed list rather than the free text the old screen
 * used ("Enter days,houes,week,piece,rooms etc" — typo included).
 *
 * Free text there is how a catalogue ends up with "day", "Days", "per day" and
 * "1day" all meaning the same thing, and nothing can group or sort by it.
 */
export const SERVICE_UNITS = ["hour", "day", "week", "piece", "room", "visit"] as const;

export type ServiceUnit = (typeof SERVICE_UNITS)[number];

/** Up to two decimals, no thousands separators. */
const MONEY = /^\d{1,7}(\.\d{1,2})?$/;

/** 2MB. Thumbnails are shown in a ~360px card; anything larger is waste. */
export const THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;

export const THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const DETAILS_MAX = 1200;

export const serviceListingSchema = z.object({
  state: z.string().min(1, "Choose a state"),
  city: z.string().min(1, "Choose a city"),
  category: z.string().min(1, "Choose a category"),
  name: z
    .string()
    .trim()
    .min(4, "Give the service a name customers will recognise")
    .max(80, "Keep the name under 80 characters"),
  unit: z.enum(SERVICE_UNITS, { message: "Choose what you charge per" }),
  /* A string, not a coerced number: an empty numeric input becomes `NaN` and
     reports "expected number, received nan" at the user, which is not a
     sentence anyone should read. */
  price: z
    .string()
    .trim()
    .min(1, "Enter a starting price")
    .refine((v) => MONEY.test(v) && Number(v) > 0, "Enter an amount like 24.99"),
  thumbnail: z
    .instanceof(File, { message: "Add a thumbnail" })
    .refine((f) => f.size <= THUMBNAIL_MAX_BYTES, "That image is over 2MB")
    .refine(
      (f) => (THUMBNAIL_TYPES as readonly string[]).includes(f.type),
      "Use a JPG, PNG or WebP image",
    ),
  details: z
    .string()
    .trim()
    .min(40, "Describe what is included — at least a couple of sentences")
    .max(DETAILS_MAX, `Keep the description under ${DETAILS_MAX} characters`),
});

export type ServiceListingRequest = z.infer<typeof serviceListingSchema>;

/**
 * The blank form.
 *
 * `thumbnail` is genuinely absent rather than a placeholder value, so the
 * resolver reports "Add a thumbnail" instead of a type error, and `unit` is
 * unset so the vendor has to choose rather than silently accepting "hour".
 */
export const BLANK_SERVICE_LISTING = {
  state: "",
  city: "",
  category: "",
  name: "",
  unit: undefined,
  price: "",
  thumbnail: undefined,
  details: "",
} as const;
