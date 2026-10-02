# Frontend Spec

## Tech Stack
<!-- Framework, language, styling, state management, build tool -->
- Framework: Next.js (React, App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: React Context (auth/session) + local component state; no global store (Redux/Zustand) needed at this scale
- Build Tool: Next.js built-in (Turbopack/Webpack)

## Pages / Routes
<!-- List each page/route and its purpose -->
| Route | Purpose | Auth Required |
|-------|---------|----------------|
| `/login` | Log in with username + password | No |
| `/signup` | Create a new account | No |
| `/trips` | List the current user's Trips (home page after login) | Yes |
| `/trips/new` | Create a new Trip (name, Trip Type) | Yes |
| `/trips/[tripId]` | Trip detail: Trip header, list of Destinations, add/edit Destinations, export itinerary as PDF | Yes |
| `/trips/[tripId]/destinations/[destinationId]` | Day-by-day Activity planner for one Destination (Day 1 through Day N) | Yes |

## Key Components
<!-- Reusable components and what they do -->
- `AuthForm` — shared form shell for Login/Signup (username, password, submit, inline error)
- `AppHeader` — nav bar with app name, link to Trips list, logout action (shown only when authenticated)
- `TripCard` — summary of one Trip in the Trips list (name, Trip Type, date range, destination count)
- `TripForm` — create/edit a Trip (name, Trip Type)
- `DestinationCard` — summary of one Destination within a Trip (name, start/end dates, link into its day-by-day planner)
- `DestinationForm` — add/edit a Destination (name, start date, end date)
- `DayPlanner` — renders Day 1 through Day N for a Destination, derived from its start/end dates
- `DayCard` — one Day, listing its Activities and an "add Activity" control
- `ActivityForm` — add/edit a single Activity on a Day (description, optional time)
- `ExportItineraryButton` — triggers client-side PDF generation of the Trip's full Itinerary
- `ProtectedLayout` — layout wrapper that redirects unauthenticated users to `/login`

## User Flows
<!-- Step-by-step walkthroughs of key journeys, e.g. "Create a trip" -->
**Sign up / log in**
1. User lands on `/login` (or `/signup`), submits credentials
2. On success, redirected to `/trips`

**Create a trip and plan it**
1. From `/trips`, user clicks "New Trip" → `/trips/new`, enters name + Trip Type → redirected to `/trips/[tripId]`
2. On the Trip detail page, user adds one or more Destinations via `DestinationForm` (name, start/end dates)
3. User opens a Destination → `/trips/[tripId]/destinations/[destinationId]`, which renders Day 1..N
4. User adds Activities to each Day
5. User repeats for each Destination in the Trip

**Export**
1. From the Trip detail page, user clicks "Export as PDF"
2. Frontend assembles the full Itinerary (all Destinations, Days, Activities) and generates a PDF client-side for download

## State Management Details
<!-- What global state exists, where it lives, how it's updated -->
- **Auth/session**: the backend sets an httpOnly session cookie on login/signup; a thin `AuthContext` on the frontend holds the current user (id, username) fetched once on app load for UI purposes (e.g. showing username in the header). Route protection is enforced server-side (Next.js middleware checking the session cookie), not just client-side state.
- **Trip/Destination/Activity data**: not held in global state. Each page fetches what it needs (see Data Fetching Strategy) and passes data down via props.
- **Form state**: local to each form component (React Hook Form), not lifted to global state.

## Data Fetching Strategy
<!-- REST/GraphQL, client-side vs server-side, caching, loading/error states -->
- All data comes from the REST API defined in `api-contract-spec.md`.
- Initial reads (Trips list, Trip detail, Destination day plan) are fetched in Next.js Server Components on each route, forwarding the session cookie to the backend.
- Mutations (create/edit Trip, Destination, Activity; login/signup) are done from Client Components using `fetch`, then the current route is revalidated/refreshed to reflect the change.
- Loading states: per-route `loading.tsx` (skeleton UI) for initial Server Component fetches; inline spinners/disabled submit buttons for in-flight mutations.
- Error states: per-route `error.tsx` boundary for failed initial fetches; inline form error messages (from the API's error response) for failed mutations.

## Responsive / Device Support
<!-- Mobile, tablet, desktop breakpoints -->
- Mobile-first layout using Tailwind's default breakpoints: base (< 640px, phones), `md:` (≥ 768px, tablets), `lg:` (≥ 1024px, desktop).
- Nav collapses to a simple top bar with a menu button below `md:`.
- Day-by-day planner: single-column stacked Day cards on mobile; multi-column or list+detail layout at `lg:` and above.
- Minimum supported width: 375px.

## Accessibility Requirements
- All form inputs have associated `<label>` elements.
- All interactive elements (including icon-only buttons like delete/edit) are keyboard-reachable and have accessible names (`aria-label` where no visible text).
- Visible focus states on all interactive elements.
- Color contrast meets WCAG AA for text and interactive elements.

## Third-Party Libraries / Integrations
- `react-hook-form` + `zod` — form state and validation
- `swr` — client-side data fetching/caching for mutation-triggered refetches where Server Component revalidation isn't a good fit
- `@react-pdf/renderer` — client-side PDF generation for itinerary export
- `date-fns` — date range math (deriving Day 1..N from a Destination's start/end dates)

## Non-Functional Requirements
<!-- Performance targets, bundle size, SEO, etc. -->
- Pages should be interactive within ~2s on a typical broadband connection; rely on Next.js route-level code splitting (no manual bundle tuning needed at this scope).
- No SEO requirements — the app is entirely behind authentication except `/login` and `/signup`.

## Open Questions
- Is a "forgot password" flow needed in v1, or is username/password recovery out of scope entirely?
- Should the Trips list (`/trips`) support search/sort/filter once a user has many trips, or is a flat list sufficient for v1?
- Should Activities support a specific time field (for ordering within a Day), or just free-text/description with manual ordering?
