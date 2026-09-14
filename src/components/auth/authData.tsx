// Content for the auth screens: the provider marks, and the faces and dates
// on the brand panel's floating cards.
//
// The provider marks are drawn verbatim: lucide has no brand glyphs, and the
// Google G is only recognisable in its four official colours, so it is the one
// mark here that does not take `currentColor`.

import type { ReactNode } from "react";
import avatar1 from "@public/assets/testimonials/avatar-1.webp";
import avatar2 from "@public/assets/testimonials/avatar-2.webp";
import avatar3 from "@public/assets/testimonials/avatar-3.webp";
import avatar4 from "@public/assets/testimonials/avatar-4.webp";

export type SocialProvider = { key: string; mark: ReactNode };

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    key: "google",
    mark: (
      <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.9 10.9 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.83z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
        />
      </svg>
    ),
  },
  {
    key: "apple",
    mark: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.05 12.54c.02 2.6 2.28 3.47 2.31 3.48-.02.06-.36 1.25-1.2 2.47-.72 1.06-1.47 2.11-2.66 2.13-1.16.02-1.54-.69-2.87-.69-1.33 0-1.75.67-2.85.71-1.14.04-2.01-1.14-2.74-2.19-1.5-2.18-2.65-6.16-1.11-8.85.77-1.34 2.14-2.18 3.63-2.2 1.12-.02 2.17.75 2.85.75.68 0 1.96-.93 3.3-.79.56.02 2.14.2 3.15 1.53-.08.05-1.85 1.08-1.83 3.22M14.9 4.6c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.55 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.57-1.23" />
      </svg>
    ),
  },
  {
    key: "x",
    mark: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.53 3h3.2l-6.99 7.99L21.75 21h-6.42l-4.4-5.76L5.87 21H2.66l7.28-8.32L2.25 3h6.58l4.13 5.46L17.53 3z" />
      </svg>
    ),
  },
];

/** How many digits every code screen asks for (email OTP and authenticator). */
export const OTP_LENGTH = 6;

/** Seconds the OTP screen makes the user wait before offering a fresh code. */
export const RESEND_SECONDS = 60;

/**
 * The faces on the panel's floating cards — the testimonial avatars, reused.
 * 96px square originals, drawn at 44px and 26px, so even the large ones are
 * above 2x; `images.unoptimized` ships them byte for byte, and at 1-2KB each
 * the whole set costs less than one hero crop.
 */
export const AUTH_CARD_FACES = [avatar1, avatar2, avatar3, avatar4];

/**
 * The week strip across the middle of the panel.
 *
 * Fixed dates, never computed from the clock: this site is a static export,
 * so a generated week would be burned into the HTML at build time and then
 * disagree with the client on the first render after midnight — a hydration
 * mismatch, for decoration.
 */
export const AUTH_WEEK = [
  { key: "auth.aside.week.sun", date: 22 },
  { key: "auth.aside.week.mon", date: 23 },
  { key: "auth.aside.week.tue", date: 24 },
  { key: "auth.aside.week.wed", date: 25 },
  { key: "auth.aside.week.thu", date: 26 },
  { key: "auth.aside.week.fri", date: 27 },
  { key: "auth.aside.week.sat", date: 28 },
];
