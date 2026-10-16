import { z } from "zod";

/* ─────────────────────────── Vendor service listing ───────────────────────────
 * The vendor dashboard's add / edit service form, sent to
 * `POST /vendors/service/store` and `/update` as multipart (the thumbnail).
 *
 * `state`, `city` and `category` hold ids, as strings - the `Select` value type
 * and what the form data carries anyway.
 *
 * `item` is free text ("1 hour", "1 day", "1 book"). It used to be a fixed unit
 * list, but the API stores whatever the vendor typed, and every existing
 * listing is in that shape - a fixed list would refuse to open them for edit.
 */

/** Up to two decimals, no thousands separators. */
const MONEY = /^\d{1,7}(\.\d{1,2})?$/;

/** 2MB. Thumbnails are shown in a ~360px card; anything larger is waste. */
export const THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;

export const THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Characters of TEXT in the description - the markup around it is not counted. */
export const DETAILS_MAX = 5000;
/** A ceiling on the HTML itself, so a pasted page cannot be sent as a description. */
const DETAILS_HTML_MAX = 60000;

/** The words in a rich-text description, without its tags or entities. */
export const detailsText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z#0-9]+;/gi, "x")
    .replace(/\s+/g, " ")
    .trim();

const thumbnailFile = z
  .instanceof(File, { message: "Add a thumbnail" })
  .refine((f) => f.size <= THUMBNAIL_MAX_BYTES, "That image is over 2MB")
  .refine((f) => (THUMBNAIL_TYPES as readonly string[]).includes(f.type), "Use a JPG, PNG or WebP image");

const fields = {
  state: z.string().min(1, "Choose a state"),
  city: z.string().min(1, "Choose a city"),
  category: z.string().min(1, "Choose a category"),
  name: z
    .string()
    .trim()
    .min(4, "Give the service a name customers will recognise")
    .max(120, "Keep the name under 120 characters"),
  item: z.string().trim().min(1, "Say what the price is for, e.g. 1 hour").max(50, "Keep it short"),
  /* A string, not a coerced number: an empty numeric input becomes `NaN` and
     reports "expected number, received nan" at the user. */
  price: z
    .string()
    .trim()
    .min(1, "Enter a price")
    .refine((v) => MONEY.test(v) && Number(v) > 0, "Enter an amount like 24.99"),
  /* HTML from the rich-text editor; the limits read its text. */
  details: z
    .string()
    .max(DETAILS_HTML_MAX, "The description is too long")
    .refine((v) => detailsText(v).length >= 10, "Describe what is included")
    .refine((v) => detailsText(v).length <= DETAILS_MAX, `Keep the description under ${DETAILS_MAX} characters`),
};

/** Create: a new listing needs its image. */
export const serviceCreateSchema = z.object({ ...fields, thumbnail: thumbnailFile });

/** Edit: no new file keeps the current image. */
export const serviceUpdateSchema = z.object({ ...fields, thumbnail: thumbnailFile.optional() });

export type ServiceListingRequest = z.infer<typeof serviceUpdateSchema>;

/**
 * The blank form. `thumbnail` is genuinely absent rather than a placeholder, so
 * the create resolver reports "Add a thumbnail" instead of a type error.
 */
export const BLANK_SERVICE_LISTING: ServiceListingRequest = {
  state: "",
  city: "",
  category: "",
  name: "",
  item: "",
  price: "",
  thumbnail: undefined,
  details: "",
};
