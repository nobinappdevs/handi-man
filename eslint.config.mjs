import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Reference material, kept for lookup only — never compiled.
    "demo/**",   // the escroc reference project
    "home/**",   // the Claude Design canvas export + its runtime
  ]),
]);

export default eslintConfig;
