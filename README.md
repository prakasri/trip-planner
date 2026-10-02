# Evergreen Travels

A trip planner: create a trip, add one or more destinations with date ranges, and plan activities day by day. Built spec-first — see [`specs/`](./specs) for the goal, frontend, backend, and API contract specs this app was built from.

## Architecture

Two separately deployed Next.js apps, plus a root-level E2E suite spanning both:

```
trip-planner/
├── frontend/   Next.js app (Carbon Design System) — deploys to Vercel
├── backend/    Next.js API-only app (Prisma + Postgres) — deploys to AWS Amplify
├── e2e/        Playwright tests exercising both apps together
└── specs/      goal / frontend / backend / api-contract specs
```

The frontend and backend are on different domains in production, so auth uses a cross-site session cookie (`sameSite=none`) plus an `Origin`-header CSRF check — see `backend/src/lib/cors.ts` and `specs/backend-spec.md`.

## Prerequisites

- Node.js 20+
- PostgreSQL running locally (for dev and for the test database)

## Setup

**1. Install dependencies** (each app manages its own):

```bash
cd backend && npm install
cd ../frontend && npm install
cd .. && npm install   # root deps, just Playwright for e2e
```

**2. Create local Postgres databases:**

```bash
createdb trip_planner        # used by the dev servers
createdb trip_planner_test   # used by backend integration tests and e2e
```

If Postgres isn't already running locally, the simplest route on macOS is Homebrew:

```bash
brew install postgresql@16
# Start it however you prefer — as a service that persists across reboots:
brew services start postgresql@16
# ...or just for this session, pointed at a specific port if 5432 is taken:
/opt/homebrew/opt/postgresql@16/bin/postgres -D /opt/homebrew/var/postgresql@16 -p 5433
```

**3. Configure environment variables:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env`:
- `DATABASE_URL` / `DIRECT_URL` — point both at your local `trip_planner` database (same value for both locally; Neon's pooled/direct split only matters in production — see `specs/backend-spec.md`)
- `SESSION_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `ALLOWED_ORIGIN` — `http://localhost:3000` (the frontend's dev URL)

`frontend/.env.local` just needs `NEXT_PUBLIC_API_BASE_URL` pointed at wherever you run the backend (e.g. `http://localhost:3001` — see below).

`backend/.env.test` is already checked in (it only points at local, non-secret values) — no setup needed there.

**4. Run the initial migration:**

```bash
cd backend && npm run prisma:migrate
```

## Running the app locally

The two apps need different ports:

```bash
# Terminal 1
cd backend && npm run dev -- -p 3001

# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:3000, sign up, and start planning a trip.

## Running tests

```bash
# Backend unit tests (lib/validation, lib/dayCount, lib/serializers) — fast, no DB needed
cd backend && npm test

# Backend integration tests — builds and runs a real server against trip_planner_test
cd backend && npm run test:integration:migrate   # once, to apply migrations to the test DB
cd backend && npm run test:integration

# Frontend component tests (Vitest + React Testing Library)
cd frontend && npm test

# End-to-end tests (Playwright) — builds and runs both apps against trip_planner_test
npm run test:e2e
```

## Deployment

See `specs/backend-spec.md` and `specs/frontend-spec.md` for the intended production setup: frontend on Vercel, backend on AWS Amplify Hosting, database on Neon Postgres.
