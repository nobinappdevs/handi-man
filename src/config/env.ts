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

export const env = {
  apiUrl,

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
