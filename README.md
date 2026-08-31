# Handiman

Next.js 16 App Router, fully static SPA (`output: "export"`), Tailwind v4,
against a Laravel REST backend.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Set the backend host in `.env` before anything will load data:

```bash
NEXT_PUBLIC_API_URL=https://<host>/api/v1
```

> Do **not** create `.env.local` — it silently overrides `.env` and you end up
> debugging the wrong API host.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | static export → `out/` |
| `npm run start` | custom Node server (`server.js`) — not used by the static deploy |
| `npm run lint` | eslint |
| `npx tsc --noEmit` | typecheck — must be clean before any work is done |

## Deploying

`npm run build` produces a self-contained `out/` folder: `index.html`, one
`.html` per route, `404.html`, hashed `_next/` assets and everything in
`public/`. Upload it to any static host — no Node process required.

## Architecture

Read these in order:

1. **[docs/PROJECT_BLUEPRINT.md](docs/PROJECT_BLUEPRINT.md)** — the binding spec:
   folder structure, routing, design tokens, typography, theming, i18n, the
   API layer, forms, the UI kit, image handling, and the static-export rules.
2. **[docs/SCAFFOLD_STATUS.md](docs/SCAFFOLD_STATUS.md)** — what exists today,
   what is still a placeholder, and where each incoming design or API drops in.
3. **[docs/API_INTEGRATION_GUIDE.md](docs/API_INTEGRATION_GUIDE.md)** — the
   step-by-step recipe for wiring one endpoint (Bangla).
4. **[docs/DYNAMIC_CONTENT_ON_STATIC.md](docs/DYNAMIC_CONTENT_ON_STATIC.md)** —
   serving admin-editable content from a static build (Bangla).

The one architectural rule — a component never calls axios:

```
Component  →  Hook (React Query)  →  Service (axios)  →  axios instance
  UI only      toast/navigate/cache    endpoint + shape     baseURL/token/401
```

`demo/` is the reference project: a complete worked example of every pattern
above. It is excluded from the typecheck and the lint. Read from it; never
import from it.
