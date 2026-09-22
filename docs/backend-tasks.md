# Backend tasks (for the `listadecompra` API)

Things the frontend needs or works around. Each task says what the frontend does today, so it can be simplified once the backend catches up. Tick a box when it is done in the backend.

## Open

### [ ] 1. Guest lists do not say who owns them

`GET /shoppers` now returns lists the user was invited to alongside their own (task 5, done), but each item is still just `{ id, userId, title, description, closedAt, createdAt }`. The frontend can tell a guest list apart (`userId` differs from the current user) but cannot say whose list it is.

**Proposal:** add `owner: { id, name, username }` to each item, so the "Convidado" badge in `ListCard` can say "de Maria" instead of just "Convidado".

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

## Note for local testing

The frontend's `apiFetch` now always sends `credentials: "include"` and expects the cookie contract above. If a locally running backend still answers `POST /session` with `{ token }` and `200` instead of a `Set-Cookie` header and `204`, it is running an older build — rebuild/restart it (`pnpm build && pnpm start`, or `pnpm start:dev`) against the latest commit.
