# Frontend Spec

## Tech Stack
<!-- Framework, language, styling, state management, build tool -->
- Framework: Next.js (React, App Router)
- Language: TypeScript
- Styling: IBM Carbon Design System (`@carbon/react` components + Carbon's Sass styles). No Tailwind — Carbon's own styling replaces it.
- State Management: React Context (auth/session) + local component state; no global store (Redux/Zustand) needed at this scale
- Build Tool: Next.js built-in (Turbopack/Webpack); `sass` added as a dev dependency since Carbon ships Sass source

## Design System
<!-- IBM Carbon Design System — theme, typography, color -->
- **Design system**: [IBM Carbon Design System](https://carbondesignsystem.com/), consumed via `@carbon/react` (components) and `@carbon/styles` (design tokens, grid, type).
- **Theme**: White (Carbon's default light theme), applied globally via Carbon's `Theme` component / `g10`→`white` CSS class on the root. No per-component theme overrides for v1.
- **Typography**: IBM Plex Sans, loaded via Carbon's default type styles (`@carbon/styles` type tokens: `heading-01`…`heading-07`, `body-01`, `body-02`, etc.). No custom font or type scale — use Carbon's tokens as-is rather than hardcoded font sizes.
- **Color**: Carbon's White theme tokens, referenced via Carbon's CSS custom properties (e.g. `var(--cds-background)`, `var(--cds-text-primary)`, `var(--cds-link-primary)`) rather than hardcoded hex values, so the app stays themeable. Key tokens:
  | Token | White theme value | Usage |
  |-------|-------------------|-------|
  | `background` | `#ffffff` | Page background |
  | `layer-01` | `#f4f4f4` | Cards/Tiles surface |
  | `text-primary` | `#161616` | Primary text |
  | `text-secondary` | `#525252` | Secondary/helper text |
  | `link-primary` / `interactive` | `#0f62fe` (Blue 60) | Primary buttons, links, focus |
  | `support-success` | `#24a148` | Success messages |
  | `support-error` | `#da1e28` | Error messages, validation |
  | `support-warning` | `#f1c21b` | Warnings |
  | `border-subtle` | `#e0e0e0` | Dividers, input borders |

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
- `AuthForm` — shared form shell for Login/Signup, built on Carbon `TextInput`/`PasswordInput`, `Button`, `InlineNotification` for errors
- `AppHeader` — Carbon `Header` with app name, link to Trips list, logout `HeaderGlobalAction` (shown only when authenticated)
- `TripCard` — Carbon `ClickableTile` summarizing one Trip in the Trips list (name, Trip Type, date range, destination count)
- `TripForm` — create/edit a Trip using Carbon `TextInput` (name) and `Dropdown` (Trip Type)
- `DestinationCard` — Carbon `Tile` summarizing one Destination within a Trip (name, start/end dates, link into its day-by-day planner)
- `DestinationForm` — add/edit a Destination using Carbon `TextInput` and `DatePicker` (range mode for start/end dates)
- `DayPlanner` — Carbon `Accordion`, one `AccordionItem` per Day (Day 1 through Day N, derived from the Destination's start/end dates)
- `DayCard` — content of one `AccordionItem`: lists that Day's Activities and an "add Activity" control
- `ActivityForm` — add/edit a single Activity on a Day, using Carbon `TextInput`/`TextArea` and `Button`
- `ExportItineraryButton` — Carbon `Button` (with `Download` icon from `@carbon/icons-react`) that triggers client-side PDF generation of the Trip's full Itinerary
- `ProtectedLayout` — layout wrapper that redirects unauthenticated users to `/login` (no Carbon UI of its own)

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
- Mobile-first layout using Carbon's grid breakpoints: `sm` (≥ 320px, phones), `md` (≥ 672px, tablets), `lg` (≥ 1056px, desktop), `xlg` (≥ 1312px).
- `AppHeader` collapses to Carbon's mobile Header pattern (hamburger/side nav) below `md`.
- Day-by-day planner: Accordion stacks full-width on mobile; at `lg` and above, use Carbon's grid to show a Destination list alongside the open Day's detail.
- Minimum supported width: 320px (Carbon's smallest breakpoint).

## Accessibility Requirements
- Carbon components are WCAG 2.1 AA compliant out of the box (labeling, keyboard support, focus states) — default to Carbon's built-in behavior rather than overriding it.
- Any custom (non-Carbon) element must still meet the same bar: associated `<label>`s on inputs, accessible names on icon-only controls, visible focus states, and AA color contrast using Carbon tokens.

## Third-Party Libraries / Integrations
- `@carbon/react` — component library (forms, navigation, tiles, accordion, notifications, etc.)
- `@carbon/icons-react` — icons (e.g. Download icon for export)
- `@carbon/styles` + `sass` — Carbon design tokens, grid, and type, compiled via Sass
- `react-hook-form` + `zod` — form state and validation, wired into Carbon form components
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
