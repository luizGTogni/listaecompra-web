@AGENTS.md

## Project structure

Folders under `src/` are created only when first needed. Import with the `@/` alias (`@/*` -> `src/*`).

- `app/` — Next.js App Router: routes, `layout.tsx`, `providers.tsx`. This replaces the `pages/`, `App.tsx` and `main.tsx` of a Vite app.
- `components/` — reusable, generic components. `components/ui/` holds the design-system base (Button, Input, Modal).
- `features/<domain>/` — one module per domain (e.g. `auth`, `lists`), each with `components/`, `hooks/`, `api.ts`, `types.ts`.
- `hooks/` — global hooks (`useDebounce`, `useMediaQuery`).
- `layouts/` — page structure pieces (`Header` exists; Sidebar, Footer later).
- `services/` — HTTP client and API configuration.
- `styles/` — `globals.css` is the single source of design tokens (see Styling).
- `assets/` — images, fonts, icons. `assets/logo/` holds the logo SVG sources.
- `utils/` — pure helper functions (`cn` for merging class names).
- `types/` — shared types.
- `test/` — test helpers (`renderWithProviders`, `mockPrefersDark`).

Do NOT create `src/pages/`: Next.js treats it as the legacy Pages Router and it would conflict with `app/`.

Conventions: English for code/comments/commits, tests next to the code (`*.test.tsx`).

## Styling

- Tailwind CSS v4 + shadcn/ui (Radix) + Phosphor icons (`@phosphor-icons/react`). Config in `components.json`; add components with `npx shadcn@latest add <name>`.
- Tokens (colors, radius, breakpoints, font) are defined only in `src/styles/globals.css`. Never hardcode colors or breakpoints elsewhere; use utilities (`bg-primary`, `text-muted-foreground`, `md:...`).
- Mobile-first: unprefixed classes target small screens; `sm:` (640), `md:` (768), `lg:` (1024), `xl:` (1280) apply upwards. There is no `2xl`.
- Reset: Tailwind preflight (included by `@import "tailwindcss"`). Do not add a custom reset.
- Dark mode: class-based via `next-themes` (`Providers`). Follows `prefers-color-scheme`; `useTheme().setTheme` overrides it. Every color token needs a `.dark` value.
- Font: Roboto, self-hosted with `@fontsource-variable/roboto` (font-display: swap).
- Accessibility: WCAG AA. `src/styles/tokens.test.ts` fails if any token pair drops below 4.5:1 (text) or 3:1 (borders/rings). Keep visible focus states and respect `prefers-reduced-motion`.
- `prettier-plugin-tailwindcss` sorts classes (also inside `cn(...)` and `cva(...)`); run `npm run format`.

## Logo and PWA

- Brand: a shopping-list sheet with a checked first item (orange tile, cream sheet, green check). The logo keeps fixed brand colors in both themes; this is the one place hardcoded hex values are fine.
- Sources are the SVGs in `src/assets/logo/` (`mark`, `mark-maskable`, and the simplified `mark-small` used for favicons). Edit them, then run `npm run icons` and commit the output: `public/icons/*`, `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png`.
- `LogoMark` / `Logo` in `components/logo.tsx` inline the same mark for the header; keep it in sync with `mark.svg`.
- `src/app/manifest.ts` is the web manifest (icons, splash `background_color`). `src/app/theme-colors.ts` repeats the `--background` values for the manifest and `viewport.themeColor`; a test fails if they drift from `globals.css`.
- Not done yet: iOS splash images (`apple-touch-startup-image`) and a service worker (offline).
