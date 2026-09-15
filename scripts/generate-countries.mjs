/**
 * Generates `src/data/countries.ts` from the `world-countries` dataset.
 *
 * Why generate instead of importing at runtime: the package is a single 552KB
 * JSON blob, and this is a static export — importing it would put all of it in
 * the bundle to fill one <select>. The trimmed file is ~15KB and carries only
 * what the form needs, so `world-countries` stays a devDependency.
 *
 * Re-run with `node scripts/generate-countries.mjs` after bumping the package.
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

// The package ships as CJS, so `import ... with { type: "json" }` is rejected.
const countries = createRequire(import.meta.url)("world-countries");

/**
 * `idd` is split into a root and suffixes, and the join is only valid when
 * there is exactly one suffix:
 *   BD  root "+8"  suffix "80"          -> +880
 *   GB  root "+4"  suffix "4"           -> +44
 *   US  root "+1"  380 suffixes (area codes, NOT dial codes) -> +1
 *   RU  root "+7"  5 suffixes            -> +7
 * Joining a multi-suffix entry would produce "+1201", which is an area code.
 */
function dialCode({ root, suffixes }) {
  if (!root) return "";
  return suffixes?.length === 1 ? `${root}${suffixes[0]}` : root;
}

const rows = countries
  .map((c) => ({
    name: c.name.common,
    iso2: c.cca2,
    dial: dialCode(c.idd ?? {}),
    flag: c.flag,
  }))
  .filter((c) => c.name && c.iso2)
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const file = `// GENERATED FILE — do not edit by hand.
// Source: \`world-countries\` (devDependency), via \`scripts/generate-countries.mjs\`.
// Re-run that script to refresh; ${rows.length} entries.

export type Country = {
  /** English common name, e.g. "Bangladesh". */
  name: string;
  /** ISO 3166-1 alpha-2, e.g. "BD". */
  iso2: string;
  /** International dialling code with its "+", e.g. "+880". "" when unassigned. */
  dial: string;
  /** Emoji flag, for the phone-code select. */
  flag: string;
};

export const COUNTRIES: Country[] = ${JSON.stringify(rows, null, 2)};

/** Dial codes, de-duplicated (+1 covers US and CA) and sorted numerically. */
export const PHONE_CODES: { dial: string; label: string; flag: string }[] = (() => {
  const seen = new Map<string, { dial: string; label: string; flag: string }>();
  for (const c of COUNTRIES) {
    if (!c.dial) continue;
    if (!seen.has(c.dial)) seen.set(c.dial, { dial: c.dial, label: c.name, flag: c.flag });
  }
  return [...seen.values()].sort(
    (a, b) => Number(a.dial.replace("+", "")) - Number(b.dial.replace("+", "")),
  );
})();

/**
 * Coerce whatever the API stored into the same form the options use: '+880'.
 *
 * user.mobile_code comes back inconsistently - the saved collection shows
 * '+880', a live server answered '880' for the same account, and '00880' is a
 * plausible third. Any of them must select the same option, or the field
 * renders its placeholder over a value that is really there.
 */
export function normalizeDial(raw: string | null | undefined): string {
  if (!raw) return "";
  // Drop +, spaces, brackets, then any international prefix zeros (00880).
  const digits = String(raw).replace(/[^0-9]/g, "").replace(/^0+/, "");
  return digits ? "+" + digits : "";
}

/** The dial code for a country name, for keeping the two selects in step. */
export function dialForCountry(name: string): string {
  return COUNTRIES.find((c) => c.name === name)?.dial ?? "";
}
`;

writeFileSync(new URL("../src/data/countries.ts", import.meta.url), file);
console.log(`wrote src/data/countries.ts — ${rows.length} countries`);
