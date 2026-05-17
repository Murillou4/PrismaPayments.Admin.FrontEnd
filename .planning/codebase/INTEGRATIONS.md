# External Integrations

**Analysis Date:** 2026-03-24

## APIs & External Services

**Prisma Payments Backend API:**
- A single internal REST API is the only external data source
- Base URL: configured via `PUBLIC_API_BASE_URL` env var (default: `http://localhost:5000`)
- All requests are JSON over HTTP using the native browser `fetch` API
- No third-party data APIs, analytics endpoints, or external SaaS APIs detected
- API client: `src/app/services/api/apiClient.ts`
- API path constants: `src/core/constants/apiPaths.ts`

**API versioning:**
- All endpoints are under `/api/v1/`

**API endpoint groups (from `src/core/constants/apiPaths.ts`):**

| Group | Endpoints |
|---|---|
| Auth | `POST /api/v1/auth/admin/login`, `POST /api/v1/auth/refresh` |
| Admin Users | `GET/POST /api/v1/admin/users`, `GET/PUT/DELETE /api/v1/admin/users/:id` |
| Merchants | CRUD + status, verification, settings, credentials sub-resources |
| Payments | `GET /api/v1/admin/payments`, `GET /api/v1/admin/payments/:id` |
| Withdrawals | `GET /api/v1/admin/withdrawals`, `GET /api/v1/admin/withdrawals/:id` |
| Disputes | `GET /api/v1/admin/disputes`, `GET /api/v1/admin/disputes/:id` |
| Fees | Rules CRUD, simulation, merchant-specific rules |
| Audit | `GET /api/v1/admin/audit` |
| Providers | `GET /api/v1/admin/providers` |
| Config | `GET /api/v1/admin/config` |
| Diagnostics | Logs, trace lookup, stats |
| Dashboard | `GET /api/v1/dashboard/admin` |

## Authentication & Identity

**Auth Provider:** Custom JWT — no third-party auth provider (no Auth0, Supabase, Firebase, Clerk, etc.)

**Implementation:**
- Login endpoint: `POST /api/v1/auth/admin/login` (email + password)
- Backend returns `accessToken` + `refreshToken` in response `data`
- Tokens stored in browser `sessionStorage` (cleared on tab/window close)
  - Keys: `prisma_admin_access_token`, `prisma_admin_refresh_token`
  - Implementation: `src/app/services/storage/tokenStorage.ts`
- All authenticated requests send `Authorization: Bearer <accessToken>` header
  - Applied in: `src/app/services/api/apiClient.ts` (`request()` function)
  - Bypass available via `skipAuth: true` option (used for login call via `postPublic()`)

**Role-based access control:**
- Roles decoded from JWT payload: `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `VIEWER`
- Hierarchical permission levels (VIEWER=1 → SUPER_ADMIN=4)
- Guard functions in `src/app/shared/guards/adminGuard.ts`:
  - `requireAuth()` — redirects to `/login` if no token
  - `requireRole(role)` — redirects to `/dashboard` if insufficient role
- Route protection is enforced client-side via SvelteKit layout guards

**Token refresh:**
- `POST /api/v1/auth/refresh` endpoint exists in `API_PATHS`
- Automatic refresh logic not yet detected in `apiClient.ts` (endpoint defined but interceptor not implemented)

## Backend Connection

**HTTP Client:**
- Native browser `fetch` — no Axios, ky, or other HTTP library
- Client wrapper: `src/app/services/api/apiClient.ts`
- Methods exposed: `get`, `post`, `put`, `delete`, `postPublic`
- Query string params serialized manually (null/undefined values filtered out)
- Request body serialized as JSON (`JSON.stringify`)

**Response contract:**
- Standardized envelope defined in `src/app/services/api/apiResponse.ts`:
  ```typescript
  interface ApiResponse<T> {
    responseType: ResponseType;  // 'OK' | 'CREATED' | 'NO_CONTENT' | ...
    message: string;
    title: string;
    status: number;
    data: T | null;
    extendedResultCode: string;
    date: string;
  }
  ```
- Helper predicates: `isSuccess()`, `isUnauthorized()`, `isBadRequest()`, `isNotFound()`, `isServerError()`, etc.

**Error handling:**
- Repository layer maps HTTP errors to typed `Failure` classes (`src/core/error/Failure.ts`):
  - `NetworkFailure` — fetch threw (no connection)
  - `UnauthorizedFailure` — 401
  - `ForbiddenFailure` — 403
  - `NotFoundFailure` — 404
  - `ValidationFailure` — 400 or client-side validation
  - `ServerFailure` — 5xx, includes `extendedResultCode`
- Error messages in Brazilian Portuguese (pt-BR)

## Data Storage

**Databases:** None — frontend only; all persistence is in the backend API

**Client-side storage:**
- `sessionStorage` — JWT tokens only (see Authentication section above)
- No `localStorage` usage detected
- No IndexedDB, cookies (application-level), or service workers detected

**File Storage:** Not applicable — no file uploads or downloads implemented

**Caching:** None — no HTTP caching layer, SWR, React Query equivalent, or service worker cache

## Monitoring & Observability

**Error Tracking:** None detected — no Sentry, Datadog, LogRocket, or similar SDK

**Analytics:** None detected

**Logs:** No client-side logging library; errors surface via the `Either<Failure, T>` return type pattern and are displayed in UI state

## Third-Party Services

**No third-party SaaS services detected.** The application integrates only with its own backend API.

- No payment SDK (Stripe, Braintree, etc.) — this is an admin panel, not a checkout
- No mapping services
- No email/SMS services
- No feature flags
- No A/B testing

## CI/CD & Deployment

**Hosting:** Not determined — `adapter-auto` will auto-select between Vercel, Netlify, Cloudflare Pages, or Node server at build time

**CI Pipeline:** Not detected — no `.github/workflows/`, `.gitlab-ci.yml`, or similar config found

## Environment Configuration

**Required environment variables:**

| Variable | Description | Default |
|---|---|---|
| `PUBLIC_API_BASE_URL` | Base URL of the Prisma Payments backend API | `http://localhost:5000` |

- Prefixed with `PUBLIC_` — SvelteKit exposes this to the browser via `$env/static/public`
- Consumed in: `src/core/config/env.ts`
- Example file: `.env.example` (contains only `PUBLIC_API_BASE_URL=http://localhost:5000`)
- Actual `.env` file is present — contents not read

**SvelteKit env module usage:**
```typescript
// src/core/config/env.ts
import { PUBLIC_API_BASE_URL } from '$env/static/public';
export const env = {
  apiBaseUrl: PUBLIC_API_BASE_URL ?? 'http://localhost:5000'
} as const;
```

## Webhooks & Callbacks

**Incoming:** None — no webhook receiver endpoints (SvelteKit server routes not implemented)

**Outgoing:** None — all communication is request/response, no event-driven outbound calls

---

*Integration audit: 2026-03-24*
