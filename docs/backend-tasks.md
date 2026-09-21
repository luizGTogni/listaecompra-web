# Backend tasks (for the `listadecompra` API)

Things the frontend needs or works around. Each task says what the frontend does today, so it can be simplified once the backend catches up. Tick a box when it is done in the backend.

## Open

### [ ] 1. CORS blocks `PATCH` and `DELETE`

**Found:** the preflight for `Origin: http://localhost:3001` answers `access-control-allow-methods: GET,HEAD,POST`. `@fastify/cors` only allows those by default, but the API has `PATCH` (toggle purchased, quantity, close list, accept invite, change password) and `DELETE` (delete list, remove item/member, decline invite) routes. From a browser those requests will be refused before they reach the API.

**Proposal:** in `app.ts`, `app.register(cors, { methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'], origin: ... })`. It does not affect the screens built so far (sign-up, sign-in, code), only the shopping-list screens.

### [ ] 2. Unknown verification code answers 404 instead of `CodeInvalid`

`VerifyUserService` throws `ResourceNotFound` (404) when the code does not exist, but `CodeInvalid` (400) when it exists and was already used or replaced. To the user both mean "wrong code". Suggest throwing `CodeInvalid` in both cases.

**Frontend today:** shows the same "wrong code" message for `CodeInvalid` and `ResourceNotFound` (`getVerifyMessage`).

### [ ] 3. `POST /shoppers` accepts any title, even an empty one

**Found:** `createShopperListBodySchema` is `{ title: z.string(), description: z.string().default('') }`. An empty or whitespace-only title creates a list with no visible name, and there is no length limit.

**Proposal:** mirror what the frontend enforces: `title: z.string().trim().min(1).max(60)`, `description: z.string().trim().max(200).default('')` (the limits 60/200 are the frontend's own choice, change them in `features/lists/schemas.ts` if you prefer others). Also give the duplicate-title 409 its own name (e.g. `ShopperListTitleAlreadyExists`) instead of the generic `ResourceAlreadyExists`, like the sign-up errors.

**Frontend today:** enforces the limits itself and maps any 409 on this endpoint to "you already have a list with this name" under the title field.

### [ ] 4. Before deploying

- CORS accepts only `localhost` origins (`app.ts`); add the production frontend origin.
- PRD `RN15` says login must be blocked for unverified users, but `POST /session` allows it (and the sign-up > code flow depends on that). Update the PRD or the rule.
- Optional: httpOnly-cookie session instead of a Bearer token in `localStorage` (see "Auth flow" in `CLAUDE.md`).

## Done

- [x] `GET /users/me` (`verifiedAt`). The frontend uses it after sign-in and in the route guard (`features/auth/verification.ts`, `require-verified.tsx`); the old probe on `GET /shoppers` is gone.
- [x] Validation errors answer `400 ValidationError` with `fields: [{ field, code, message }]` instead of a 500. The sign-up form marks each field.
- [x] Verification code is 6 characters (letters + digits); `codeValue` is trimmed and upper-cased by the backend. `CodeInvalid` is 400 and `CodeExpired` is 422 (no longer 401, so a wrong code no longer looks like an expired session).
- [x] `POST /code/resend` has a 60 s cooldown: `429 TooManyRequests` with `Retry-After`. The frontend locks the button for 60 s (also right after sign-up, since that code counts) and follows `Retry-After` when it asks too early.
- [x] Sign-up 409 is split into `EmailAlreadyExists` and `UsernameAlreadyExists`; each message shows under its own field.
