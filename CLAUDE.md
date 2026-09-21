@AGENTS.md

## Project structure

Folders under `src/` are created only when first needed. Import with the `@/` alias (`@/*` -> `src/*`).

- `app/` — Next.js App Router: routes, `layout.tsx`, `providers.tsx`. This replaces the `pages/`, `App.tsx` and `main.tsx` of a Vite app. Route groups split layouts without changing URLs: `(main)/` has the app header, `(auth)/` has the split-screen auth layout (`/sign-up`, `/sign-in`, `/verify`).
- `components/` — reusable, generic components. `components/ui/` holds the design-system base (Button, Input, Modal).
- `features/<domain>/` — one module per domain (e.g. `auth`, `lists`), each with `components/`, `hooks/`, `api.ts`, `types.ts`.
- `hooks/` — global hooks (`useIsClient`, `useSecondsUntil`; later `useDebounce`, `useMediaQuery`).
- `layouts/` — page structure pieces (`Header` exists; Sidebar, Footer later).
- `services/` — HTTP client (`apiFetch`, `ApiError`, `NetworkError`) and API configuration.
- `styles/` — `globals.css` is the single source of design tokens (see Styling).
- `assets/` — images, fonts, icons. `assets/logo/` holds the logo SVG sources.
- `utils/` — pure helper functions (`cn` for merging class names).
- `types/` — shared types.
- `test/` — test helpers (`renderWithProviders`, `mockPrefersDark`, `mockFetch`/`mockApi`, `resetAuthStore`/`signInAs`).

Do NOT create `src/pages/`: Next.js treats it as the legacy Pages Router and it would conflict with `app/`.

Conventions: English for code/comments/commits, tests next to the code (`*.test.tsx`). User-facing UI text is pt-BR (`<html lang="pt-BR">`).

Package manager: pnpm. Dev server runs on port 3001 (`pnpm dev`) because the backend owns 3000.

## Styling

- Tailwind CSS v4 + shadcn/ui (Radix) + Phosphor icons (`@phosphor-icons/react`). Config in `components.json`; add components with `pnpm dlx shadcn@latest add <name>`.
- Tokens (colors, radius, breakpoints, font) are defined only in `src/styles/globals.css`. Never hardcode colors or breakpoints elsewhere; use utilities (`bg-primary`, `text-muted-foreground`, `md:...`).
- Mobile-first: unprefixed classes target small screens; `sm:` (640), `md:` (768), `lg:` (1024), `xl:` (1280) apply upwards. There is no `2xl`.
- Reset: Tailwind preflight (included by `@import "tailwindcss"`). Do not add a custom reset.
- Dark mode: class-based via `next-themes` (`Providers`). Follows `prefers-color-scheme`; `useTheme().setTheme` overrides it. Every color token needs a `.dark` value.
- Font: Roboto, self-hosted with `@fontsource-variable/roboto` (font-display: swap).
- Accessibility: WCAG AA. `src/styles/tokens.test.ts` fails if any token pair drops below 4.5:1 (text) or 3:1 (borders/rings). Keep visible focus states and respect `prefers-reduced-motion`.
- `prettier-plugin-tailwindcss` sorts classes (also inside `cn(...)` and `cva(...)`); run `pnpm format`.

## Logo and PWA

- Name: always written `Lista&Compra` (no spaces). In JSX the wordmark is `Lista<span>{"&"}</span>Compra`; inside SVG/XML files it must be `&amp;`.
- Brand: a shopping-list sheet with a checked first item (orange tile, cream sheet, green check). The logo keeps fixed brand colors in both themes; this is the one place hardcoded hex values are fine.
- Sources are the SVGs in `src/assets/logo/` (`mark`, `mark-maskable`, and the simplified `mark-small` used for favicons). Edit them, then run `pnpm icons` and commit the output: `public/icons/*`, `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png`.
- `LogoMark` / `Logo` in `components/logo.tsx` inline the same mark for the header; keep it in sync with `mark.svg`.
- `src/app/manifest.ts` is the web manifest (icons, splash `background_color`). `src/app/theme-colors.ts` repeats the `--background` values for the manifest and `viewport.themeColor`; a test fails if they drift from `globals.css`.
- Not done yet: iOS splash images (`apple-touch-startup-image`) and a service worker (offline).

## Backend integration and forms

- Backend: the sibling `listadecompra` project (Fastify), base URL from `NEXT_PUBLIC_API_URL` (see `.env.example`, copy it to `.env.local`). Its CORS accepts any `localhost` origin only.
- All requests go through `apiFetch` in `services/api.ts`. Non-2xx throws `ApiError` (status + body); no answer throws `NetworkError`.
- Each feature keeps its calls in `features/<domain>/api.ts`, its hooks (`useMutation`/`useQuery`) in `hooks/`, and maps errors to user messages in a pure function (`errors.ts`) so it can be unit-tested.
- Forms: react-hook-form + zod (`@hookform/resolvers/zod`). The zod schema mirrors the backend's body schema; the backend stays the source of truth. Use `z.string().trim().pipe(z.email())`, not `z.email().trim()` (zod 4 validates the format before trimming).
- Form fields use the shadcn `Field`/`FieldLabel`/`FieldError` parts, `aria-invalid`, and the right `autoComplete`/`inputMode` for mobile keyboards. Inputs and buttons are 44px tall (touch target).
- Tests stub `fetch` with `mockFetch` (no MSW yet).

## Auth flow

Sign up > (silent sign in) > `/verify` (6-character code) > `/`. Sign in > `/` if verified, `/verify` if not.

- The session is `{ token, email }` in the Zustand store `features/auth/store.ts`, persisted in `localStorage` (key `auth`). The backend has no cookie session, only `POST /session` returning a 7-day JWT. localStorage is readable by any script on the page, so this trades some security for simplicity; a BFF with an httpOnly cookie would be the upgrade.
- Requests behind login use `authFetch` (adds the Bearer token). It clears the session only for `name === "Unauthorized"`: a wrong verification code is also a 401 and must not sign the user out.
- Guards are client-side (the server cannot read localStorage): `RequireToken` (needs a token: `/verify`) and `RequireVerified` (token + verified: the whole `(main)` group). Anything reading the store must wait for `useIsClient()` to avoid hydration mismatches.
- "Is the user verified?" comes from `GET /users/me` (`verifiedAt`), cached under `currentUserQuery`. `resolvePostAuthRoute` (after sign-in) and `RequireVerified` (the guard) both read it. After a successful code check the cached user is removed, so the guard fetches a fresh one instead of bouncing back to `/verify`.
- Resending the code is limited by the backend to once per 60 s (`429 TooManyRequests` + `Retry-After`), counting from the code sent at sign-up. `resendAvailableAt` (epoch ms) lives in the auth store, so the countdown survives reloads; `useSecondsUntil` turns it into seconds.
- Signing out (or a rejected token) empties the whole TanStack Query cache (`ClearCacheOnSignOut`), so the next user never sees the previous user's data.
- Tests that render components using `useRouter` mock it: `vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }))`.

## Backend tasks

Anything the frontend needs that the backend lacks (missing routes, wrong status codes) is written down in `docs/backend-tasks.md`, with the workaround the frontend uses meanwhile. Add a task there instead of working around silently.

## Navigation

- Mobile: a fixed bottom bar (`layouts/bottom-nav.tsx`): Início, Histórico, **Lista** (featured, raised, shopping-bag icon, in the middle), Convites, Perfil. From `md` the same links show in the header (`desktop-nav.tsx`). Both read `NAV_ITEMS` in `layouts/nav-items.ts`: add a tab there and a route under `app/(main)/`. Keep the featured item in the middle (odd number of items).
- `layouts/new-list-button.tsx` is the floating "+" (green `contrast` token) linking to `/lists/new`; hidden on `/lists/new` and `/profile`.
- `(main)/layout.tsx` renders them only after `RequireVerified` confirms the user, and pads the page (`pb-32`) so content is not hidden behind the bar. "Sair" is in the header on desktop and on the Perfil screen on mobile.
- Screens still to build (`ComingSoon` placeholders): Início, Lista, Histórico, Convites, Perfil. Nova lista is done.

## Shopping lists

- `features/lists/`: `POST /shoppers` (`createShopperList`), the `newListSchema` (title 1-60, description up to 200: the frontend's own limits, the backend has none), and `shopperListsKey`, the cache key any list change must invalidate.
- After creating a list the app shows a toast (`sonner`, `<Toaster position="top-center" />` in `Providers`: the bottom belongs to the navigation bar) and replaces the route with `/lists`. `replace`, so "Back" does not return to a filled-in form.
- Submit buttons stay disabled while pending AND after success (until the redirect happens), so a double tap cannot send two requests.
- Messages every screen shares (offline, 429, generic) live in `services/error-messages.ts`; each feature handles its own errors first and falls back to it.
