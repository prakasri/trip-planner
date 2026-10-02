# API Contract Spec

## Conventions
<!-- Base URL, versioning, auth header, content type, naming conventions -->
- Base URL: the backend's deployed origin (e.g. `https://<app>.amplifyapp.com` or a custom domain), exposed to the frontend via `NEXT_PUBLIC_API_BASE_URL`. All paths below are relative to this origin.
- Versioning: none for v1 — all routes are unprefixed (`/api/...`, not `/api/v1/...`). See Open Questions.
- Auth: session cookie (`httpOnly`, `Secure`, `SameSite=None`), set by `/api/auth/login` and `/api/auth/signup`. No Authorization header, no JWT. The frontend must call with `credentials: 'include'` on every request; the backend must respond with CORS headers scoped to the frontend's origin (see `backend-spec.md`).
- Content-Type: `application/json` for all request and response bodies.
- Naming: resource paths are plural nouns (`/trips`, `/destinations`, `/activities`); ids are UUIDs; fields are `camelCase`.
- Resource nesting mirrors ownership: Destinations are nested under their Trip, Activities under their Destination (`/api/trips/{tripId}/destinations/{destinationId}/activities/{activityId}`). This lets the backend validate the full ownership chain from the URL itself (see `backend-spec.md` → Authorization).

## Common Response Envelope
<!-- Success / error shape used across all endpoints -->
Success:
```json
{
  "success": true,
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "fields": { "startDate": "must be on or before endDate" }
  }
}
```
`fields` is present only for `VALIDATION_ERROR` and omitted otherwise.

## Error Codes
| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Request body failed schema or business-rule validation |
| `USERNAME_TAKEN` | 400 | Signup attempted with a username that already exists |
| `INVALID_CREDENTIALS` | 401 | Login username/password did not match |
| `UNAUTHENTICATED` | 401 | No valid session cookie present |
| `FORBIDDEN_ORIGIN` | 403 | Request's `Origin` header didn't match the allowed frontend origin (CSRF defense) |
| `NOT_FOUND` | 404 | Resource doesn't exist, or exists but isn't owned by the current session's user |
| `RATE_LIMITED` | 429 | Too many requests to a rate-limited endpoint (login/signup) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Endpoints

### Auth

#### `POST /api/auth/signup`
**Description:** Create a new User account and start a session.
**Auth Required:** No
**Path Params:** —
**Query Params:** —
**Request Body:**
```json
{ "username": "jsmith", "password": "••••••••" }
```
`username`: 3–30 chars, alphanumeric/underscore/hyphen, unique case-insensitive. `password`: minimum 8 characters.
**Response (201):**
```json
{ "success": true, "data": { "user": { "id": "uuid", "username": "jsmith" } } }
```
Sets the session cookie.
**Error Responses:** `VALIDATION_ERROR`, `USERNAME_TAKEN`, `RATE_LIMITED`

---

#### `POST /api/auth/login`
**Description:** Authenticate with username + password and start a session.
**Auth Required:** No
**Request Body:**
```json
{ "username": "jsmith", "password": "••••••••" }
```
**Response (200):**
```json
{ "success": true, "data": { "user": { "id": "uuid", "username": "jsmith" } } }
```
Sets the session cookie.
**Error Responses:** `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `RATE_LIMITED`

---

#### `POST /api/auth/logout`
**Description:** End the current session.
**Auth Required:** Yes
**Response (200):**
```json
{ "success": true, "data": null }
```
Clears the session cookie.
**Error Responses:** `UNAUTHENTICATED`

---

#### `GET /api/auth/me`
**Description:** Return the current session's User. Used by `AuthContext` on app load to determine auth state.
**Auth Required:** Yes
**Response (200):**
```json
{ "success": true, "data": { "user": { "id": "uuid", "username": "jsmith" } } }
```
**Error Responses:** `UNAUTHENTICATED`

---

### Trips

#### `GET /api/trips`
**Description:** List the current user's Trips, for the Trips list page. `startDate`/`endDate` are the min/max across the Trip's Destinations (`null` if it has none yet).
**Auth Required:** Yes
**Response (200):**
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "uuid",
        "name": "Spring in Japan",
        "tripType": "couple",
        "destinationCount": 2,
        "startDate": "2027-04-01",
        "endDate": "2027-04-12",
        "createdAt": "2026-10-01T12:00:00Z"
      }
    ]
  }
}
```
**Error Responses:** `UNAUTHENTICATED`

---

#### `POST /api/trips`
**Description:** Create a new Trip.
**Auth Required:** Yes
**Request Body:**
```json
{ "name": "Spring in Japan", "tripType": "couple" }
```
`tripType` ∈ `solo` \| `couple` \| `family` \| `group`
**Response (201):**
```json
{ "success": true, "data": { "trip": { "id": "uuid", "name": "Spring in Japan", "tripType": "couple", "createdAt": "...", "updatedAt": "..." } } }
```
**Error Responses:** `VALIDATION_ERROR`, `UNAUTHENTICATED`

---

#### `GET /api/trips/{tripId}`
**Description:** Trip detail, including its Destinations, for the Trip detail page.
**Auth Required:** Yes
**Path Params:** `tripId`
**Response (200):**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "uuid",
      "name": "Spring in Japan",
      "tripType": "couple",
      "createdAt": "...",
      "updatedAt": "...",
      "destinations": [
        { "id": "uuid", "name": "Tokyo", "startDate": "2027-04-01", "endDate": "2027-04-06", "dayCount": 6 }
      ]
    }
  }
}
```
**Error Responses:** `UNAUTHENTICATED`, `NOT_FOUND`

---

#### `PATCH /api/trips/{tripId}`
**Description:** Update a Trip's name and/or Trip Type.
**Auth Required:** Yes
**Path Params:** `tripId`
**Request Body:** (all fields optional)
```json
{ "name": "Spring in Japan 2027", "tripType": "family" }
```
**Response (200):** same shape as the `trip` object in `POST /api/trips`
**Error Responses:** `VALIDATION_ERROR`, `UNAUTHENTICATED`, `NOT_FOUND`

---

#### `DELETE /api/trips/{tripId}`
**Description:** Delete a Trip and cascade-delete its Destinations and Activities.
**Auth Required:** Yes
**Path Params:** `tripId`
**Response (200):**
```json
{ "success": true, "data": null }
```
**Error Responses:** `UNAUTHENTICATED`, `NOT_FOUND`

---

### Destinations

#### `POST /api/trips/{tripId}/destinations`
**Description:** Add a Destination to a Trip.
**Auth Required:** Yes
**Path Params:** `tripId`
**Request Body:**
```json
{ "name": "Tokyo", "startDate": "2027-04-01", "endDate": "2027-04-06" }
```
**Response (201):**
```json
{ "success": true, "data": { "destination": { "id": "uuid", "name": "Tokyo", "startDate": "2027-04-01", "endDate": "2027-04-06", "dayCount": 6, "createdAt": "...", "updatedAt": "..." } } }
```
**Error Responses:** `VALIDATION_ERROR` (e.g. `endDate` before `startDate`), `UNAUTHENTICATED`, `NOT_FOUND` (trip)

---

#### `GET /api/trips/{tripId}/destinations/{destinationId}`
**Description:** Destination detail with its Activities, for the day-by-day planner page. Activities are returned flat (each tagged with `dayNumber`); the frontend groups them into Day 1..`dayCount` (days with no Activities simply have none in the list).
**Auth Required:** Yes
**Path Params:** `tripId`, `destinationId`
**Response (200):**
```json
{
  "success": true,
  "data": {
    "destination": {
      "id": "uuid",
      "name": "Tokyo",
      "startDate": "2027-04-01",
      "endDate": "2027-04-06",
      "dayCount": 6,
      "activities": [
        { "id": "uuid", "dayNumber": 1, "description": "Arrive, check into hotel", "createdAt": "...", "updatedAt": "..." }
      ]
    }
  }
}
```
**Error Responses:** `UNAUTHENTICATED`, `NOT_FOUND`

---

#### `PATCH /api/trips/{tripId}/destinations/{destinationId}`
**Description:** Update a Destination's name and/or dates. If shrinking the date range would leave an existing Activity's `dayNumber` beyond the new `dayCount`, the request is rejected rather than silently orphaning that Activity — the user must move/delete the conflicting Activities first.
**Auth Required:** Yes
**Path Params:** `tripId`, `destinationId`
**Request Body:** (all fields optional)
```json
{ "name": "Tokyo", "startDate": "2027-04-01", "endDate": "2027-04-05" }
```
**Response (200):** same shape as the `destination` object in `POST .../destinations`
**Error Responses:** `VALIDATION_ERROR` (including the orphaned-Activity case above), `UNAUTHENTICATED`, `NOT_FOUND`

---

#### `DELETE /api/trips/{tripId}/destinations/{destinationId}`
**Description:** Delete a Destination and cascade-delete its Activities.
**Auth Required:** Yes
**Path Params:** `tripId`, `destinationId`
**Response (200):**
```json
{ "success": true, "data": null }
```
**Error Responses:** `UNAUTHENTICATED`, `NOT_FOUND`

---

### Activities

#### `POST /api/trips/{tripId}/destinations/{destinationId}/activities`
**Description:** Add an Activity to a specific Day of a Destination.
**Auth Required:** Yes
**Path Params:** `tripId`, `destinationId`
**Request Body:**
```json
{ "dayNumber": 1, "description": "Visit Senso-ji Temple" }
```
**Response (201):**
```json
{ "success": true, "data": { "activity": { "id": "uuid", "dayNumber": 1, "description": "Visit Senso-ji Temple", "createdAt": "...", "updatedAt": "..." } } }
```
**Error Responses:** `VALIDATION_ERROR` (`dayNumber` outside 1..`dayCount`), `UNAUTHENTICATED`, `NOT_FOUND`

---

#### `PATCH /api/trips/{tripId}/destinations/{destinationId}/activities/{activityId}`
**Description:** Update an Activity's day and/or description.
**Auth Required:** Yes
**Path Params:** `tripId`, `destinationId`, `activityId`
**Request Body:** (all fields optional)
```json
{ "dayNumber": 2, "description": "Visit Senso-ji Temple (moved)" }
```
**Response (200):** same shape as the `activity` object in `POST .../activities`
**Error Responses:** `VALIDATION_ERROR`, `UNAUTHENTICATED`, `NOT_FOUND`

---

#### `DELETE /api/trips/{tripId}/destinations/{destinationId}/activities/{activityId}`
**Description:** Delete an Activity.
**Auth Required:** Yes
**Path Params:** `tripId`, `destinationId`, `activityId`
**Response (200):**
```json
{ "success": true, "data": null }
```
**Error Responses:** `UNAUTHENTICATED`, `NOT_FOUND`

---

## Pagination Strategy
None for v1. `GET /api/trips` returns all of the current user's Trips unpaginated, and a Destination's Activities are returned in full on `GET .../destinations/{destinationId}` — appropriate for the expected scale (a personal trip planner, not a multi-tenant SaaS product). Revisit if `backend-spec.md`'s open question about per-user resource limits lands on a high ceiling.

## Rate Limiting
`POST /api/auth/login` and `POST /api/auth/signup` are rate-limited to 10 requests per IP per minute. Responses exceeding the limit return `429` with `RATE_LIMITED`. No rate limiting on other endpoints for v1.

## Webhooks (if any)
None for v1.

## Open Questions
None — resolved: no `/api/v1/` prefix, reject (not cascade-delete) on orphaning date-range edits, 10 requests/IP/minute on auth endpoints.
