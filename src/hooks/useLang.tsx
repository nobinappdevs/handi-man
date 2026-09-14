"use client";

// Lightweight i18n (no external library). Translations are plain JSON imported
// at build time. The provider persists the choice to localStorage("handiman_lang")
// and exposes a `t(key)` lookup plus the language list for the switcher.
//
// To keep server and client first-render identical (no hydration mismatch),
// we start at the default language and apply the saved/browser language in a
// post-mount effect. Arabic switches the document to RTL automatically.

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { LANG_STORAGE_KEY, DEFAULT_LANG, type LangCode } from "@/lib/langState";

import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import ar from "@/i18n/ar.json";
import fr from "@/i18n/fr.json";
import hi from "@/i18n/hi.json";

/*
 * The code itself, the storage key and the reader live in `lib/langState.ts` —
 * `lib/axios.ts` needs them to stamp `?lang=` onto every customer API call, and
 * cannot import this file to get them (React + five dictionaries, and a cycle).
 * Re-exported here so components keep importing them from the language hook.
 */
export { LANG_STORAGE_KEY, DEFAULT_LANG, readLang } from "@/lib/langState";
export type { LangCode } from "@/lib/langState";

export type Dir = "rtl" | "ltr";

type Language = { code: LangCode; name: string; flag: string };

// Native names are intentional — a language menu should read in its own tongue.
export const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
];

// JSON dictionaries are deeply nested with mixed value types; an opaque record
// keeps the lookup flexible without fighting each file's exact shape.
type Dict = Record<string, unknown>;

const DICTIONARIES: Record<string, Dict> = { en, es, ar, fr, hi };
const RTL_LANGS: LangCode[] = ["ar"];

type LangContextValue = {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: string) => string;
  languages: Language[];
  dir: Dir;
};

const LangContext = createContext<LangContextValue | null>(null);

function lookup(dict: Dict, key: string): unknown {
  return key.split(".").reduce<unknown>(
    (node, part) => (node == null ? undefined : (node as Dict)[part]),
    dict
  );
}

function applyDocumentLang(code: LangCode) {
  const el = document.documentElement;
  el.setAttribute("lang", code);
  el.setAttribute("dir", RTL_LANGS.includes(code) ? "rtl" : "ltr");
}

function detectInitialLang(): LangCode {
  let saved: string | null;
  try {
    saved = window.localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    saved = null;
  }
  const browser = window.navigator.language?.split("-")[0];
  return ([saved, browser, DEFAULT_LANG].find(
    (code) => code && DICTIONARIES[code]
  ) ?? DEFAULT_LANG) as LangCode;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG as LangCode);

  useEffect(() => {
    const initial = detectInitialLang();
    applyDocumentLang(initial);
    startTransition(() => setLangState(initial));
  }, []);

  function setLang(code: LangCode) {
    if (!DICTIONARIES[code]) return;
    setLangState(code);
    applyDocumentLang(code);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, code);
    } catch {
      // Ignore storage errors.
    }
  }

  // Resolve a dotted key against the active dictionary, falling back to English
  // and finally the key itself so missing strings are visible, not blank.
  function t(key: string): string {
    const active = DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LANG];
    return (lookup(active, key) ?? lookup(DICTIONARIES[DEFAULT_LANG], key) ?? key) as string;
  }

  const value: LangContextValue = {
    lang,
    setLang,
    t,
    languages: LANGUAGES,
    dir: RTL_LANGS.includes(lang) ? "rtl" : "ltr",
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used inside a <LangProvider>");
  }
  return ctx;
}
