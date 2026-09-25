@AGENTS.md

## Project structure

Folders under `src/` are created only when first needed. Import with the `@/` alias (`@/*` -> `src/*`).

- `app/` — Next.js App Router: routes, `layout.tsx`, `providers.tsx`. This replaces the `pages/`, `App.tsx` and `main.tsx` of a Vite app. Route groups split layouts without changing URLs: `(main)/` has the app header, `(auth)/` has the split-screen auth layout (`/sign-up`, `/sign-in`, `/verify`).
- `components/` — reusable, generic components. `components/ui/` holds the design-system base (Button, Input, Modal).
- `features/<domain>/` — one module per domain (e.g. `auth`, `lists`), each with `components/`, `hooks/`, `api.ts`, `types.ts`.
- `hooks/` — global hooks (`useSecondsUntil`, `useDebounce`; later `useMediaQuery`).
- `layouts/` — page structure pieces (`Header` exists; Sidebar, Footer later).
- `services/` — HTTP client (`apiFetch`, `ApiError`, `NetworkError`) and API configuration.
- `styles/` — `globals.css` is the single source of design tokens (see Styling).
- `assets/` — images, fonts, icons. `assets/logo/` holds the logo SVG sources.
- `utils/` — pure helper functions (`cn` for merging class names).
- `types/` — shared types.
- `test/` — test helpers (`renderWithProviders`, `mockPrefersDark`, `mockFetch`/`mockApi`, `listsReply`/`meReply`, `resetAuthStore`/`signInAs`, fixtures).

Do NOT create `src/pages/`: Next.js treats it as the legacy Pages Router and it would conflict with `app/`.

Conventions: English for code/comments/commits, tests next to the code (`*.test.tsx`). User-facing UI text is pt-BR (`<html lang="pt-BR">`).

Package manager: pnpm. Dev server runs on port 3001 (`pnpm dev`) because the backend owns 3000.

## Styling

- Tailwind CSS v4 + shadcn/ui (Radix) + Phosphor icons (`@phosphor-icons/react`). Config in `components.json`; add components with `pnpm dlx shadcn@latest add <name>`.
- Tokens (colors, radius, breakpoints, font) are defined only in `src/styles/globals.css`. Never hardcode colors or breakpoints elsewhere; use utilities (`bg-primary`, `text-muted-foreground`, `md:...`).
- Mobile-first: unprefixed classes target small screens; `sm:` (640), `md:` (768), `lg:` (1024), `xl:` (1280) apply upwards. There is no `2xl`.
- Reset: Tailwind preflight (included by `@import "tailwindcss"`). Do not add a custom reset. It also resets `<button>` to `cursor: default`, so `components/ui/button.tsx`'s base classes add `cursor-pointer` (and `disabled:cursor-not-allowed`) back for every variant/size.
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
- Splash: Android builds it from the manifest (`background_color` + icon + name), light only (a manifest has no dark variant). iOS needs one PNG per device: `pnpm icons` renders `public/splash/{light,dark}-WxH.png` (background token + centered `mark.svg`) from the device list in `src/assets/splash-devices.json`, and `layout.tsx` links them through `appleWebApp.startupImage` with exact media queries. Portrait only. New iPhone/iPad sizes: add a line to the JSON and rerun `pnpm icons`.
- Not done yet: a service worker (offline).

## Backend integration and forms

- Backend: the sibling `listadecompra` project (Fastify), base URL from `NEXT_PUBLIC_API_URL` (see `.env.example`, copy it to `.env.local`). Its CORS only allows the exact `FRONTEND_URL` it is configured with (its own `.env`, defaults to `http://localhost:3001`), because credentialed requests cannot use a wildcard or origin-matching origin.
- All requests go through `apiFetch` in `services/api.ts`, which always sends `credentials: "include"` (the session cookie). Non-2xx throws `ApiError` (status + body + `retryAfter`); no answer throws `NetworkError`.
- Each feature keeps its calls in `features/<domain>/api.ts`, its hooks (`useMutation`/`useQuery`) in `hooks/`, and maps errors to user messages in a pure function (`errors.ts`) so it can be unit-tested.
- Forms: react-hook-form + zod (`@hookform/resolvers/zod`). The zod schema mirrors the backend's body schema; the backend stays the source of truth. Use `z.string().trim().pipe(z.email())`, not `z.email().trim()` (zod 4 validates the format before trimming).
- Form fields use the shadcn `Field`/`FieldLabel`/`FieldError` parts, `aria-invalid`, and the right `autoComplete`/`inputMode` for mobile keyboards. Inputs and buttons are 44px tall (touch target).
- Tests stub `fetch` with `mockFetch` (no MSW yet).

## Auth flow

Sign up > (silent sign in) > `/verify` (6-character code) > `/`. Sign in > `/` if verified, `/verify` if not.

- The session itself is an **httpOnly cookie** (`POST /session` sets it, 7 days; `POST /session/logout` clears it). JavaScript never sees the token: `apiFetch` just sends `credentials: "include"` and the browser does the rest. There is no `authFetch` wrapper and no bearer header.
- `features/auth/store.ts` (Zustand, persisted in `localStorage`, key `auth`) only keeps what the UI needs and is allowed to see: `email` (shown on the verify screen) and `resendAvailableAt`. It is not the source of truth for "signed in" — the cookie is, and the frontend cannot read it either.
- "Signed in?" and "verified?" both come from `GET /users/me` (`verifiedAt`), through `currentUserQuery` and the hook `useSessionStatus()` (`"loading" | "error" | "unauthenticated" | "unverified" | "verified"`). `RequireToken` (`/verify`: any of the last three states) and `RequireVerified` (the whole `(main)` group: only `"verified"`) are thin wrappers around it. `resolvePostAuthRoute` (after sign-in) reads the same query via `fetchQuery`.
- After a successful code check the cached current user is removed (`queryClient.removeQueries`), so the guard fetches a fresh one instead of bouncing back to `/verify`.
- Resending the code is limited by the backend to once per 60 s (`429 TooManyRequests` + `Retry-After`), counting from the code sent at sign-up. `resendAvailableAt` (epoch ms) lives in the auth store, so the countdown survives reloads; `useSecondsUntil` turns it into seconds.
- Signing out (`useSignOut`, a mutation calling `POST /session/logout`) clears the store and the whole TanStack Query cache, so the next person on this browser never sees the previous user's data.
- Session-wide 401 handling lives in `app/providers.tsx`: `QueryCache`/`MutationCache` `onError` call `notifySessionInvalid()` (`features/auth/session-events.ts`, a plain pub-sub outside React) whenever `ApiError.body.name === "Unauthorized"` (checked by `isUnauthorizedError`) — a wrong verification code is also a 401 but a different `name`, and must not trigger this. `Providers` itself is the only subscriber, and invalidates `currentUserQuery` in an effect, which is what makes the guards redirect. The pub-sub (not a `ref`, not closing over the `QueryClient` state variable) exists because the React Compiler forbids a `useState`-created `QueryClient` from referencing itself, and forbids touching a `ref` from code that runs during render.
- Tests simulate "signed in" by mocking `GET /users/me` (`meReply` in `test/fetch.ts`), not by touching the store. `resetAuthStore`/`signInAs` (`test/auth.ts`) only manage the store's `email`. Tests that render components using `useRouter` mock it: `vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }))`.

### Forgot, reset and change password

- Forgot: `/sign-in` (link "Esqueci minha senha") > `/forgot-password` (`POST /password/forgot`, `{ email }`) > `/reset-password` (`POST /password/reset`, `{ codeValue, newPassword }`; the code alone identifies the account, no e-mail needed) > toast + `/sign-in`. Both are in the `(auth)` group.
- `useForgotPassword` treats `404` (unknown e-mail) as success so the screen does not reveal which accounts exist (`docs/backend-tasks.md` task 3: the backend should do the same). Reset errors: `CodeInvalid`/`ResourceNotFound` = wrong code, `CodeExpired` = expired.
- Change: `ChangePasswordForm` on `/profile` (`PATCH /users/password/change`, `{ currentPassword, newPassword }`). A wrong current password is `401 InvalidCredentials` (not `Unauthorized`, so it does not trigger the session-wide logout) and goes under that field; `400 SamePassword` goes under the new one. The session cookie stays valid.
- No "confirm password" field, on purpose: `PasswordInput` has a show/hide toggle instead.
- Hooks in `features/auth/hooks/use-password.ts`, errors in `errors.ts` (`getResetPasswordMessage`, `getChangePasswordFeedback`), schemas in `schemas.ts`.

## Backend tasks

Anything the frontend needs that the backend lacks (missing routes, wrong status codes) is written down in `docs/backend-tasks.md`, with the workaround the frontend uses meanwhile. Add a task there instead of working around silently.

## Navigation

- Mobile: a fixed bottom bar (`layouts/bottom-nav.tsx`): Início, Histórico, **Lista** (featured, raised, shopping-bag icon, in the middle), Convites, Perfil. From `md` the same links show in the header (`desktop-nav.tsx`). Both read `NAV_ITEMS` in `layouts/nav-items.ts`: add a tab there and a route under `app/(main)/`. Keep the featured item in the middle (odd number of items).
- `layouts/new-list-button.tsx` is the floating "+" (green `contrast` token). It opens a chooser (Radix `Dialog`: a bottom sheet on mobile, a centered card from `md`) with "Lista vazia" (link to `/lists/new`, the default path) and "Criar com IA" (link to `/lists/new/ai`); shown only on `/lists` and `/history` (an allowlist, exact match), where "add one more" is the obvious next action.
- `(main)/layout.tsx` renders them only after `RequireVerified` confirms the user, and pads the page (`pb-32`) so content is not hidden behind the bar. "Sair" is in the header on desktop and on the Perfil screen on mobile only (`md:hidden` there).
- Every screen is built: Início, Lista, Histórico, Nova lista, the detail of one list (`/lists/[id]`), its members (`/lists/[id]/members`), Convites and Perfil.
- Início (`HomeView`): greeting, "Nova lista", a banner when there are pending invites (`myInvitesQuery`), and the 3 most recent open lists (the same cache entry as page 1 of `/lists`) with "Ver todas".

## Shopping lists

- `features/lists/`: `POST /shoppers` (`createShopperList`), the `newListSchema` (title 1-60, description up to 200: the frontend's own limits, the backend has none), and `shopperListsKey`, the cache key any list change must invalidate.
- After creating a list the app shows a toast (`sonner`, `<Toaster position="top-right" />` in `Providers`: the bottom belongs to the navigation bar) and replaces the route with `/lists`. `replace`, so "Back" does not return to a filled-in form.
- Submit buttons stay disabled while pending AND after success (until the redirect happens), so a double tap cannot send two requests.
- Messages every screen shares (offline, 429, generic) live in `services/error-messages.ts`; each feature handles its own errors first and falls back to it.
- `ListsView` powers both `/lists` (`status="open"`) and `/history` (`status="closed"`): search box + list cards + Anterior/Próxima. The search is debounced (`useDebounce`, 300 ms) and sent as `query` (the backend matches title or description); the page number is stored together with the search it belongs to, so a new search returns to page 1 without an effect. State is local (not in the URL). Each `{ query, page, status }` is its own TanStack Query cache entry (`shopperListsQuery(filters)`), all under the `shopperListsKey` prefix, so invalidating that prefix (after creating a list) refreshes every page. `placeholderData: keepPreviousData` keeps the old results on screen while the next ones load. The empty state differs by status (Lista offers "criar minha primeira lista"; Histórico just says none are done yet).
- `GET /shoppers` returns `{ shopperLists, page, perPage, total }` (newest first), filtered by `status=open|closed`, and already includes lists the user was invited to (member with an accepted invite), alongside the ones they own. `totalPages = Math.ceil(total / perPage)` drives `ListsPagination` ("Página X de Y", both buttons disabled correctly); the `EmptyState` "no more lists" branch stays as a fallback for a page emptied out from under the user (e.g. deleted concurrently).
- Guest lists: a list whose `userId` (owner) is not the current user (`currentUserQuery`) gets a "Convidado" badge in `ListCard`. Both list endpoints send the owner as `user: { name, username }`, so tapping the "Convidado" badge (`GuestBadge`, a popover: a `title` never shows on touch) says whose list it is (optional in the type: an older backend build omits it, and the badge is then plain text).
- `ListCard` uses the "stretched link" pattern: the link sits on the title with an `after:absolute after:inset-0` covering the card, and the badges are above it (`relative z-10`), because a badge can be a button and a button cannot live inside a link. Tests find a card with `heading.closest("li")`, not `closest("a")`.
- `ListCard`'s "Concluída" badge (`showClosedBadge`, default on) is turned off on `/history`: every card there is already closed, so the tag would just repeat what the screen title already says. `/lists` never shows it either way, since an open-status query never returns a closed list.
- Test helpers: `mockApi` routes can be a function of the URL (`(url) => reply`); `listsReply`/`meReply`/`listDetailReply` in `test/fetch.ts` build response bodies, `makeList`/`makeLists`/`makeItem` in `test/fixtures.ts` build the objects themselves.

### List detail (`/lists/[id]`)

- `ShopperListDetailView` reads `shopperListQuery(listId)` (`GET /shoppers/:id`, cache key `shopperListDetailKey`, separate from `shopperListsKey`: item changes never need to invalidate the list screens, only closing/deleting the list does — see `useInvalidateListEverywhere`). `GET /shoppers/:id` returns the items as `shopperItems` (the view tolerates it missing). It shows the title/description, an owner-only "Concluir lista"/"Reabrir lista" toggle and a delete confirmation (`AlertDialog`), the add-item form, and the items (unpurchased first).
- Access mirrors the backend: the owner (`shopperList.userId === currentUserQuery`) sees the close/reopen and delete actions; a guest (accepted member) gets the "Convidado" badge and can still add/check/resize/remove items, but not close or delete the list — the backend answers `404 ResourceNotFound` for either a non-owner or a list that truly does not exist, so `getListActionMessage` cannot and does not try to tell them apart.
- On an open list, `AiSuggestButton` (a floating round orange button, bottom right, like the new-list "+": icon-only on mobile, with label from `md`) opens the AI chat in a bottom sheet. `components/ui/bottom-sheet.tsx` (`BottomSheetContent`) is the shared sheet (bottom sheet on mobile, centered card from `md`), also used by the new-list chooser. The chat itself is `features/ai/`, see "AI chat" below.
- A closed list disables every item control and hides the add-item form (`ShopperItemRow`'s `disabled` prop); the backend would refuse those calls with `409 ShopperListClosed` anyway, this just avoids a pointless round trip. A purchased item also can't have its quantity changed (`400 ShopperItemAlreadyPurchased`), so the stepper is disabled per item regardless of the list's own status.
- Each item mutation (`features/lists/hooks/use-shopper-list-detail.ts`) lives in its own `useMutation` call _inside_ `ShopperItemRow`, so `mutation.isPending`/`isError` are naturally scoped to that row — no manual "which item is busy" tracking needed.
- A purchased item shows "Comprado por {name}" ("você" for the current user) from `purchasedBy: { name, username } | null` (typed optional: an older backend omits it, and items bought before the backend tracked the author have `null`, so no text).
- The quantity stepper never goes below 1; removing an item is the trash button, not "quantity to 0" (the backend supports that shortcut, the UI does not use it, to keep one action per button).
- The list's own page (`app/(main)/lists/[id]/page.tsx`) is an async Server Component only to unwrap `params` (`PageProps<"/lists/[id]">`); the server `<title>` stays the static "Lista" and `ShopperListDetailView` overrides it client-side with `useDocumentTitle` (`hooks/`) once the list loads (a server `generateMetadata` would need the session cookie forwarded via `next/headers`).
- After adding a route under a dynamic segment (e.g. `lists/[id]/members`), run `npx next typegen` (or a build) once to regenerate `.next/types/routes.d.ts` — `PageProps<"...">` for the new route does not exist until then, and `tsc` fails with "does not satisfy the constraint 'AppRoutes'".

### Members and invites (`/lists/[id]/members`, `/invites`)

- `GET /shoppers/:id/members` (`ShopperListMember`) sends `user: { name, username }` per member (typed optional: an older backend build omits it). `MemberRow` shows "Maria (@maria)", "Você" for the current user, and falls back to a truncated id (`Usuário ${id.slice(0, 8)}`) without `user`. `GET /users/shoppers/invites` (`MyInvite`) extends the same type and adds the list's title and inviter.
- `MembersView` (`GET /shoppers/:id/members`, owner or accepted member) renders the owner (from the list itself, with its real `user` name/username, not the members array — the owner is never a row in `shopperListMembers`) above the member rows, which include pending invites (`acceptedAt: null`, tagged "Convite pendente"). Only the owner sees `InviteMemberForm`, and only while the list is open.
- Inviting is by **username** (`POST /shoppers/:id/members/invite`, body `{ username }`; the backend lookup is exact and usernames are stored lower case, so `inviteMemberSchema` strips a leading `@` and lower-cases before validating). `MyUsername` on `/profile` shows the signed-in user's name and `@username` with a copy button, to be shared with whoever will invite them.
- `MemberRow` calls one of two hooks depending on whose row it is: `useRemoveMember` (owner removing someone else, only invalidates the members list) or `useLeaveList` (the current user removing themselves — same endpoint, `DELETE .../members/:memberId/remove`, but it also invalidates `shopperListsKey`, drops the list's own cached detail/members, and redirects to `/lists`, since they lose access).
- `/invites` (`InvitesView`, `GET /users/shoppers/invites`) lists the current user's own pending invites and lets them accept or decline. Each invite (`MyInvite`) carries `shopperList: { title, user: { name, username } }` (typed optional: a backend build from before that change omits it, and `InviteRow` falls back to a generic title instead of crashing with "Cannot read properties of undefined (reading 'title')"), so `InviteRow` shows the list's title and "Convite de {name} (@{username}) em {date}" (`formatDate`, `src/utils/format-date.ts`, also used by `ListCard`). `GetShopperListAccessService` still refuses `GET /shoppers/:id` for a _pending_ member, so an invite's items/description remain unseen until accepted (`docs/backend-tasks.md` task 2, partly done).

### Share code (`/lists`, `/join/[code]`)

- `GET /shoppers/:id` sends `shareCode` (typed optional). The owner of an open list sees "Compartilhar" (`ShareListSheet`): the code with a copy button, a QR code (`qrcode.react`, encodes the link, always on white), "Compartilhar link" (`navigator.share`, falls back to copying) and "Gerar novo código" (`PATCH /shoppers/:id/share-code/reset`, behind a confirmation: the old code and link stop working).
- `POST /shoppers/members/enter` (`{ shareCode }`) joins as an accepted member, no invite step. "Entrar com código" on `/lists` (`JoinByCodeButton`, a sheet) accepts the bare code or a pasted link (`extractShareCode`). The shared link is `/join/<code>` (`JoinByLinkView`, inside `(main)`): it joins on open and redirects to the list. Errors in `getJoinByCodeMessage`.
- Known gap: a signed-out person who opens the link lands on `/sign-in` and the link is lost (the guards do not keep a return path yet).

## AI chat

- `features/ai/`: `AiChat` powers both `/lists/new/ai` (no list yet: it creates one, then opens its detail) and the sheet opened by `AiSuggestButton` on a list (`shopperListId` set: it edits that list). Text is pt-BR, quantities are integers.
- The model runs in the **backend** (NVIDIA NIM, keys `NVIDIA_NIM_API_KEY_1`/`NVIDIA_NIM_API_KEY_2` tried in order, plus `NVIDIA_NIM_MODEL` and `NVIDIA_NIM_API_URL`). `POST /ai/chat` (`{ shopperListId?, messages }`, 20/min per client) returns `{ reply, proposal | null }` and changes nothing; `POST /ai/apply` (`{ shopperListId?, title?, description?, addItems, removeItemIds }`) is what changes data, and only runs when the person taps "Aplicar"/"Criar lista". A proposal is `{ title?, description?, addItems, removeItems: [{ id, title }] }`.
- The backend guards the model's output (`ai-output-guard.ts`): item titles must look like list items (2-60 chars, one line, at most 8 words, no links or markup). When most of them do not, the answer is a plain reply ("Não consegui montar essa lista…") with `proposal: null`, which the chat already shows as ordinary text.
- No streaming (a "pensando" indicator while the request runs) and no saved history: the conversation lives in the component's state, the last 12 messages are sent with each request, and closing the screen starts over.
- Errors: `getAiChatMessage`/`getAiApplyMessage` in `features/ai/errors.ts`. `503 AiUnavailable` = no NIM key worked; a guest cannot rename (`403 Forbbiden`); a new list whose title is taken becomes "Título (2)" on the backend instead of failing.
- Tests stub `POST /ai/chat` and `/ai/apply` with `mockApi`; the backend has a `MockAiDriver` for its own tests.
