<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Handiman — project rules

**Read [`docs/PROJECT_BLUEPRINT.md`](docs/PROJECT_BLUEPRINT.md) before writing any
code in this repo, and [`docs/SCAFFOLD_STATUS.md`](docs/SCAFFOLD_STATUS.md) to see
what already exists.** They are binding; consistency with them matters more than
any individual preference.

`demo/` is the reference project — a complete worked example of every pattern in
the blueprint. Read from it freely. It is excluded from the typecheck
(`tsconfig.json`) and the lint (`eslint.config.mjs`); never import from it and
never edit it.

The non-negotiables:

- **Static export.** `output: "export"`. No server components fetching data, no
  route handlers, no `middleware.ts`, no ISR. Dynamic detail pages use query
  params inside `<Suspense>`, never `[id]` routes.
- **Never call axios from a component.** The chain is always
  component → hook (React Query) → service (axios) → `publicApi`/`privateApi`.
  Toasts, navigation and `invalidateQueries` live in the hook; endpoints and
  payload shapes live in the service.
- **`process.env` is read only in `src/config/env.ts`.**
- **`src/app/**` is routing only.** A `page.tsx` is metadata + guard + one
  imported component. All markup lives in `src/components`.
- **Colours come from tokens** (`text-heading`, `text-body`, `text-muted`,
  `bg-bg`, `bg-surface`, `bg-card`, `border-border`, `text-primary`). Never a raw
  `text-gray-500` / `bg-white` / hex for a themed surface. Dark mode is free —
  the tokens flip themselves.
- **Typography comes from semantic tags.** `@layer base` in
  `src/style/globals.css` already sizes `h1`–`h6`/`p`/`span`/`a`/`li` fluidly.
- **Scroll motion is declarative.** Hang `useGsapScope()` on the section root
  and tag markup with `data-anim` / `data-anim-stagger` / `data-anim-split` /
  `data-anim-parallax` / `data-anim-count`. Never import `gsap` in a component,
  and never tag an element whose design opacity or transform comes from a class.
  **Nothing above the fold** — a GSAP reveal waits for hydration, so it belongs
  to sections you have to scroll to; the hero uses the CSS `enter-*` classes,
  which start at first paint. **Never fade the LCP element** (hero headline and
  figure use `enter-rise`, transform only) — an opacity or clip entrance on it
  costs ~3s of LCP. Ambient loops stay CSS keyframes. Blueprint §6.5 has the
  traps.
- **Check what an image really is before adding it.** `images.unoptimized` ships
  the imported file byte-for-byte with no `srcset`, so a `.webp` that is really
  a 1.4 MB PNG reaches every phone. Verify format with `sharp().metadata()` and
  encode for the widest CSS box × 2. Blueprint §14.1.
- **Forms are React Hook Form + `Controller` + `zodResolver`.** Never
  `useState` per input. Use `useWatch`, not `watch()` (React Compiler is on).
- **No hard-coded user-facing string.** Everything goes through `t("key")`, with
  the key added to `src/i18n/en.json`.
- **Storage keys are `handiman_`-prefixed exported constants**, never inline
  strings.
- `npx tsc --noEmit` and `npm run build` must both be clean before work is done.
