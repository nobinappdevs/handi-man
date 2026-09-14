/**
 * The ONLY place `process.env` is read.
 *
 * Every browser-visible variable must be prefixed `NEXT_PUBLIC_` — this is a
 * static export, so anything not inlined at build time simply does not exist
 * at runtime. Read values from here, never from `process.env` directly.
 */

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Laravel's broadcast-auth route lives at the app root, not under /api/v1. */
const appRoot = apiUrl.replace(/\/api\/v\d+\/?$/, "");

/*
 * The vendor API is a SEPARATE root, not a path under the customer one:
 * customer calls go to `…/api/v1/user/*`, vendor calls to
 * `…/api/vendor/v1/vendors/*`. Derived from `apiUrl` so a single `.env` entry
 * still covers both hosts, and overridable for the case where it doesn't.
 */
const vendorApiUrl =
  process.env.NEXT_PUBLIC_VENDOR_API_URL || apiUrl.replace(/\/api\/v(\d+)\/?$/, "/api/vendor/v$1");

export const env = {
  apiUrl,
  vendorApiUrl,

  /*
   * Pusher Channels (realtime pub/sub) — optional, per feature.
   *
   * Treat these as OVERRIDES, deliberately empty by default: prefer having the
   * backend hand the credentials over at runtime so they stay out of the static
   * bundle and can be rotated without a rebuild. Set them in `.env` only to
   * test against a different Pusher app locally.
   */
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",

  /**
   * Auth endpoint for `private-*` channels. Pusher calls it with the socket id;
   * we attach the user's bearer token. Ignored by public channels.
   */
  pusherAuthEndpoint:
    process.env.NEXT_PUBLIC_PUSHER_AUTH_ENDPOINT ?? `${appRoot}/broadcasting/auth`,
};
