# Backend tasks (for the `listadecompra` API)

Things the frontend needs or works around. Each task says what the frontend does today, so it can be simplified once the backend catches up. Tick a box when it is done in the backend.

## Open

### [~] 1. A pending invite carries no list title or inviter, and cannot even be looked up

**Wanted:** the accept/decline screen (`/invites`) shows which list the invite is for, and who sent it.

**In progress on the backend:** `GET /users/shoppers/invites` now includes `shopperList: { title, user: { name, username } }` per invite (`FindAllShopperListInviteService`, `ShopperListMemberWithList`). Two things to double check before it's done:

- The response **schema** (`find-all-shopper-list-invite.schema.ts`) currently names the field `userId: z.object({ name, username })`, but the Prisma query actually returns it as `shopperList.user` (matching the `ShopperListMemberWithList` TS type), not `shopperList.userId`. As written, Fastify's response serialization will not find `userId` and the field will likely come out empty/stripped — rename the schema field to `user` to match.
- `InMemoryShopperListMemberRepository.findAllByMemberId` still returns `shopperList: { title, userId: string }` (the plain owner id, no `user` object) — inconsistent with the Prisma repository and the updated `ShopperListMemberWithList` type; fix it to match, or in-memory-backed tests will disagree with the real (Prisma) behavior.

**Frontend:** updated to expect `shopperList: { title, user: { name, username } }` on `GET /users/shoppers/invites` only (`features/lists/types.ts`'s `MyInvite`, distinct from the plain `ShopperListMember` returned by `GET /shoppers/:id/members`, which is unchanged). `InviteRow` shows the title, "Convite de {name} (@{username}) em {date}". Still open: `GetShopperListAccessService` still refuses `GET /shoppers/:id` for a pending (not yet accepted) member — accepting is still a leap of faith regarding the list's items/description, just not its title/owner anymore.

### [~] 2. Inviting someone needs their user id, and there is no way to find it

**In progress on the backend:** `POST /shoppers/:id/members/invite` now takes `{ username }` in the body (no `memberId` in the URL); `GetUserFoundByUsernameService` does an exact `findByUsername`. The frontend already uses it: the invite form asks for a username, normalizes `@Maria` to `maria` (sign-up stores usernames in lower case, and the lookup is exact), and the Profile screen shows the user's name and `@username` with a copy button (`MyUsername`).

**Done:** `GET /shoppers/:id/members` now sends `user: { name, username }` per member; `MemberRow` shows "Maria (@maria)" and falls back to `Usuário 1b9d6bcd` when `user` is missing (older build).

**Note:** `find-all-shopper-list-invite.schema.ts` now uses `user` (fixed), matching the Prisma query. The frontend also tolerates an invite that comes without `shopperList` (an older build), instead of crashing.

### [ ] 3. `POST /password/forgot` reveals which e-mails have an account

It answers `404 ResourceNotFound` for an unknown e-mail and `204` for a known one, so anyone can probe which addresses are registered (sign-in is careful to avoid exactly that).

**Proposal:** answer `204` in both cases (and just skip sending the e-mail when there is no account). Frontend meanwhile: `useForgotPassword` treats the 404 as success and goes on to the code screen anyway, so the screen itself never reveals it; the backend still does.

Also worth a look: `POST /password/reset` finds the account by the code alone (no e-mail), so a 6-character code has to be unguessable and the route should be rate limited.

## Done

- [x] `GET /users/me` returns the authenticated user, `verifiedAt` included.
- [x] Validation errors answer `400 ValidationError` with `fields: [{ field, code, message }]`.
- [x] Verification code is 6 characters, normalized server-side (`.trim().toUpperCase()`). `CodeInvalid` is 400, `CodeExpired` is 422, and a missing/unknown code is also `CodeInvalid` (no more 404).
- [x] `POST /code/resend` has a 60 s cooldown (`429 TooManyRequests` + `Retry-After`).
- [x] Sign-up 409 is split into `EmailAlreadyExists` and `UsernameAlreadyExists`.
- [x] Session is an httpOnly cookie: `POST /session` (204, sets the cookie) and `POST /session/logout` (204, clears it) replace the JWT-in-the-body flow. `authenticate` still also accepts a Bearer header, kept for API clients other than this frontend.
- [x] CORS allows `PATCH`/`DELETE` and sends credentials for the exact `FRONTEND_URL` origin (not "any localhost", now that cookies are involved).
- [x] `POST /shoppers` validates `title` (1-60) and `description` (up to 200).
- [x] `GET /shoppers` paginates properly: `{ shopperLists, page, perPage, total }`, newest first, with a `status=open|closed` filter and `limit` (10 or 25).
- [x] `GET /shoppers` returns lists the user was invited to (accepted membership), not just owned ones.
- [x] PRD `RN15` (block login before verification) removed to match the sign-up > code flow, which needs login to work for unverified accounts.

- [x] `GET /shoppers` and `GET /shoppers/:id` include the owner as `user: { name, username }` (guest lists say whose they are). `GET /shoppers/:id` also renamed `items` to `shopperItems`.

## Note for local testing

The frontend's `apiFetch` now always sends `credentials: "include"` and expects the cookie contract above. If a locally running backend still answers `POST /session` with `{ token }` and `200` instead of a `Set-Cookie` header and `204`, it is running an older build — rebuild/restart it (`pnpm build && pnpm start`, or `pnpm start:dev`) against the latest commit.
