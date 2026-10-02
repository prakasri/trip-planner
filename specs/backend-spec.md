# Backend Spec

## Tech Stack
<!-- Language, framework, runtime -->
- Language: TypeScript
- Framework: Next.js API routes (App Router Route Handlers, `app/api/**/route.ts`) — its own app/repo, containing no page routes (API-only)
- Runtime: Node.js (AWS Lambda, via AWS Amplify Hosting's managed Next.js API compute)

## Architecture
<!-- Monolith, microservices, serverless, etc. -->
Two separately deployed apps:
- **Frontend**: Next.js pages (App Router), deployed on Vercel — see `frontend-spec.md`.
- **Backend**: this app — an API-only Next.js app (Route Handlers under `app/api/`, no pages) implementing the REST contract in `api-contract-spec.md` — deployed on AWS Amplify Hosting.

The two communicate over HTTPS as a cross-origin client/server pair (different domains), which has two consequences handled below: CORS must be configured on the backend to allow the frontend's origin(s), and the session cookie must be usable cross-site (see Authentication & Authorization, Security Considerations).

## Data Model / Database Schema
<!-- Entities, fields, relationships -->
### Entities

**User**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| username | string | Unique, not null |
| passwordHash | string | bcrypt hash, never exposed via API |
| createdAt | timestamp | |

**Trip**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| userId | UUID | FK → User.id |
| name | string | Not null |
| tripType | enum | `solo` \| `couple` \| `family` \| `group` |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Destination**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tripId | UUID | FK → Trip.id |
| name | string | Not null (e.g. "Paris") |
| startDate | date | Not null |
| endDate | date | Not null, must be ≥ startDate |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Activity**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| destinationId | UUID | FK → Destination.id |
| dayNumber | integer | 1-indexed; must be between 1 and the Destination's day count (`endDate - startDate + 1`) |
| description | string | Not null |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Relationships
- `User` 1 — N `Trip` (a Trip has exactly one owning User)
- `Trip` 1 — N `Destination`
- `Destination` 1 — N `Activity`
- Deletes cascade downward: deleting a Trip deletes its Destinations and their Activities; deleting a Destination deletes its Activities.

## Database
<!-- DB engine, hosting, migrations strategy -->
- Engine: PostgreSQL
- Hosting: Neon (serverless Postgres, free tier) — connection pooled for serverless function usage
- ORM: Prisma — schema lives in `prisma/schema.prisma`, migrations via `prisma migrate dev` / `prisma migrate deploy`

## Business Logic / Core Rules
<!-- Key domain rules, validations, edge cases -->
- A Destination's `endDate` must be on or after its `startDate`.
- An Activity's `dayNumber` must be between 1 and the day count derived from its Destination's `startDate`/`endDate` (recomputed server-side on every write — never trust a client-supplied bound).
- A Trip's `tripType` must be one of the four defined values (`solo`, `couple`, `family`, `group`); reject anything else with a validation error.
- `username` must be unique (case-insensitive) at signup; attempting to register an existing username returns a validation error, not a 500.
- `username` must be 3–30 characters, alphanumeric plus underscore/hyphen only.
- `password` must be at least 8 characters (no other strength requirement for v1).
- No maximum number of Trips/Destinations/Activities per user for v1 (personal-use scale, no abuse/cost concern).
- All reads/writes to a Trip (and its nested Destinations/Activities) are scoped to the authenticated User who owns that Trip — see Authentication & Authorization.

## Authentication & Authorization
<!-- Auth method, roles/permissions, session handling -->
- **Method**: username + password. Passwords hashed with bcrypt (`bcryptjs`, to avoid native-binding issues in serverless) before storage; plaintext passwords are never stored or logged.
- **Session**: stateless, signed + encrypted session cookie (`iron-session`) containing the User's id. No server-side session table needed. Cookie flags: `httpOnly`, `secure` (required), `sameSite: none` — `none` is required because the frontend (Vercel) and backend (AWS Amplify) are different domains, so the cookie must be sent cross-site; this requires HTTPS everywhere, which both platforms provide by default.
- **CORS**: the backend must respond with `Access-Control-Allow-Origin: <frontend origin>` (not a wildcard — wildcards are incompatible with credentialed requests) and `Access-Control-Allow-Credentials: true` on every response, and handle `OPTIONS` preflight requests. The frontend's `fetch` calls must use `credentials: 'include'` for the cookie to be sent/received.
- **Authorization**: no roles/permissions tiers — every User can only read/write their own Trips. Every API route that touches a Trip, Destination, or Activity must verify the resource's owning Trip's `userId` matches the session's user id; mismatches return `404` (not `403`, to avoid confirming a resource's existence to a non-owner).
- **Route protection**: all `/api/trips/**` routes require a valid session; `/api/auth/login` and `/api/auth/signup` do not.

## External Services / Integrations
<!-- Maps API, weather API, email, payments, etc. -->
None for v1. PDF export is generated entirely client-side (see `frontend-spec.md`), so no backend rendering service is needed.

## Background Jobs / Async Processing
<!-- Any scheduled tasks, queues, webhooks -->
None for v1 — all operations are synchronous request/response.

## Error Handling & Logging
- Every Route Handler wraps its logic in try/catch and returns the standard error envelope defined in `api-contract-spec.md` (`{ success: false, error: { code, message } }`) with an appropriate HTTP status (`400` validation, `401` unauthenticated, `404` not found/not owned, `500` unexpected).
- Unexpected errors are logged server-side (`console.error`, captured by Amplify Hosting's CloudWatch Logs) with enough context to debug (route, user id if known, error stack) — never leaked to the client response body.
- Validation errors (via `zod`) are caught and mapped to field-level messages in the error response.

## Security Considerations
<!-- Input validation, rate limiting, secrets management -->
- All request bodies validated server-side with `zod` schemas — never trust client-side validation alone (defense in depth with the frontend's own `zod` validation).
- Ownership checks (see Authorization) on every resource access to prevent IDOR (one user accessing another user's Trip/Destination/Activity by guessing an id).
- Rate limiting on `/api/auth/login` and `/api/auth/signup`: 10 requests per IP per minute (via `@upstash/ratelimit`), to deter brute-force credential guessing.
- Secrets (`DATABASE_URL`, session encryption key) stored as environment variables (`.env.local` locally, AWS Amplify Hosting environment variables in production) — never committed to the repo.
- Session cookie is `httpOnly` + `secure`, mitigating XSS cookie theft. Because cross-origin hosting requires `sameSite: none`, the cookie's `SameSite` attribute no longer provides CSRF protection (as it would same-site) — every mutating route (`POST`/`PATCH`/`DELETE`) must explicitly check the request's `Origin` header matches the known frontend origin(s) and reject otherwise.
- CORS is locked down to an explicit allowlist of frontend origin(s) (never `Access-Control-Allow-Origin: *`, which is both insecure and incompatible with credentialed cookies).

## Non-Functional Requirements
<!-- Scalability, performance, uptime -->
- Scale target: single-user-at-a-time usage pattern (personal project), not designed for high concurrency — Neon + AWS Amplify's managed serverless compute scale adequately without extra work.
- Typical API response time target: < 300ms for reads/writes on this data size (a handful of Trips/Destinations/Activities per user).
- Uptime: best-effort, relying on AWS Amplify/Neon platform availability — no custom HA/failover work for v1.

## Deployment / Infra
<!-- Hosting, CI/CD, environments -->
- Hosting: AWS Amplify Hosting, this API-only Next.js app, in its own repo separate from the frontend (which is deployed on Vercel — see `frontend-spec.md`)
- Database: Neon Postgres, provisioned separately (not AWS-native), connected via `DATABASE_URL` — Neon's built-in connection pooling suits Lambda-based serverless compute better than a direct RDS connection would
- Cross-origin config: an `ALLOWED_ORIGIN` environment variable holds the frontend's current origin, used for both the CORS `Access-Control-Allow-Origin` header and the `Origin`-check CSRF defense (see Security Considerations). This must be updated per environment — see below.
- Environments:
  - `development`: local backend (`.env.local` + a dev Neon branch), `ALLOWED_ORIGIN=http://localhost:3000` (local frontend dev server)
  - `production`: Amplify environment variables + production Neon branch, `ALLOWED_ORIGIN=<frontend's production domain>`
- CI/CD: AWS Amplify's built-in Git integration — push to `main` auto-builds and deploys to production via an `amplify.yml` build spec. No separate CI pipeline needed for v1.
- Migrations: run `prisma migrate deploy` as a build step in `amplify.yml` (before `next build`) so schema changes land before the new code that depends on them.

## Open Questions
None — resolved: no preview environment for v1 (test against production/localhost only), no per-user resource limits, username is 3–30 chars alphanumeric/underscore/hyphen, password minimum 8 characters (see Business Logic / Core Rules).
