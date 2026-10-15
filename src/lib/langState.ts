/**
 * The active language, as plain storage access.
 *
 * This is the half of `hooks/useLang.tsx` that has no React in it. It lives on
 * its own because `lib/axios.ts` has to stamp `?lang=` onto every customer API
 * call, and importing the provider would drag five JSON dictionaries plus React
 * into the bottom of the request stack — and open an import cycle besides.
 *
 * `useLang.tsx` re-exports these, so `LANG_STORAGE_KEY` still reads as "declared
 * with the language code" from a component's point of view. Same arrangement as
 * `TOKEN_KEY`, which is declared in `authState.ts` and re-exported by `axios.ts`.
 */

/** localStorage key for the chosen language code. */
export const LANG_STORAGE_KEY = "handiman_lang";

export const DEFAULT_LANG = "en";

export type LangCode = "en" | "es" | "ar" | "fr" | "hi";

export const LANG_CODES: LangCode[] = ["en", "es", "ar", "fr", "hi"];

/**
 * The language the API should answer in. Falls back to English on the server
 * and in private mode, which is also what the backend defaults to — the two
 * agreeing is the point.
 */
export function readLang(): LangCode {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    return LANG_CODES.includes(saved as LangCode) ? (saved as LangCode) : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}
