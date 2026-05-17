# Codebase Concerns

**Analysis Date:** 2026-03-24

---

## Incomplete Features — Stub Pages ("Em implementação...")

The single largest concern in the codebase is that 9 of the 10 feature pages are empty stubs. Every page below renders only a static header and the placeholder text "Em implementação..." with no data, no logic, and no components.

**Stub pages (zero functional implementation):**

- `src/app/features/admin_users/presentation/pages/AdminUsersPage.svelte` — Admin user management
- `src/app/features/audit/presentation/pages/AuditPage.svelte` — Platform audit log
- `src/app/features/diagnostics/presentation/pages/DiagnosticsPage.svelte` — HTTP logs and debugging
- `src/app/features/disputes/presentation/pages/DisputesListPage.svelte` — Chargeback / dispute management
- `src/app/features/fees/presentation/pages/FeesListPage.svelte` — Fee rules management
- `src/app/features/merchants/management/presentation/pages/MerchantsListPage.svelte` — Merchant list
- `src/app/features/merchants/management/presentation/pages/MerchantDetailPage.svelte` — Merchant detail (accepts `merchantId` prop but displays nothing)
- `src/app/features/providers/presentation/pages/ProvidersPage.svelte` — Payment providers
- `src/app/features/transactions/payments/presentation/pages/PaymentsListPage.svelte` — Cross-merchant payments
- `src/app/features/transactions/withdrawals/presentation/pages/WithdrawalsListPage.svelte` — Cross-merchant withdrawals

**Impact:** The application is essentially non-functional for all features except the dashboard and login. All the supporting infrastructure (API paths, domain entities, repositories, services) for these features does not exist yet — it needs to be built alongside the pages.

**Missing supporting layers for stub features:**
Each stub feature is missing its entire data layer:
- No domain entities (models)
- No repository interfaces or implementations
- No service classes
- No controllers / state management
- No shared components (tables, filters, pagination, detail panels)

The only feature with a complete vertical slice is **auth** (login) and a partial slice for **dashboard** (fetch + display metrics, but no refresh, no period filtering).

---

## Architecture Gaps

**Service Locator declared but never used:**
- `src/core/service_locator/serviceLocator.ts` exports the `sl` singleton with `registerLazySingleton`, `registerSingleton`, and `get` methods.
- No file in the codebase calls `sl.registerLazySingleton`, `sl.registerSingleton`, or `sl.get`.
- Services and repositories are instantiated directly with `new` inside pages and controllers (e.g., `new DashboardService(new DashboardRepository())` in `DashboardPage.svelte`).
- This creates a dead abstraction: the DI infrastructure exists but is bypassed everywhere. Either the service locator should be adopted consistently or removed.

**No shared interface for repositories beyond auth:**
- `IAuthRepository` in `src/app/features/auth/domain/repositories/IAuthRepository.ts` is the only repository interface.
- `DashboardRepository` is a concrete class with no interface — `DashboardService` depends on the concrete type, not an abstraction (`import type { DashboardRepository }`).
- This makes the dashboard repository impossible to mock in tests and violates the dependency inversion pattern used in auth.

**DashboardService is a pass-through with no value:**
- `src/app/features/dashboard/services/DashboardService.ts` contains a single method that calls `this.repo.getMetrics()` and returns the result unchanged with no business logic.
- This adds a layer of indirection without benefit at this stage.

**Root redirect via HTML meta refresh:**
- `src/routes/+page.svelte` uses `<meta http-equiv="refresh" content="0; url=/dashboard" />` instead of a SvelteKit server redirect or `goto()`.
- HTML meta refreshes are not immediate, cause a flash before redirect, and are not intercepted by the SvelteKit router.

**`adminGuard.ts` is client-side only and never called:**
- `src/app/shared/guards/adminGuard.ts` exports `requireAuth()` and `requireRole()` which call `tokenStorage.getAccessToken()` — a `sessionStorage` read.
- These functions are never invoked in any route page, layout, or `+page.ts` load function.
- The `(admin)` layout group (`src/routes/(admin)/+layout.svelte`) has no guard call and no `+layout.server.ts`.
- Role-based access control is entirely absent from the running application.

---

## Security Concerns

**Dual token storage with a critical synchronization gap:**
- `src/hooks.server.ts` checks `event.cookies.get('access_token')` to guard all non-public routes (server-side).
- `src/app/services/storage/tokenStorage.ts` stores tokens in `sessionStorage` under `prisma_admin_access_token` and `prisma_admin_refresh_token` (client-side).
- `src/app/features/auth/services/AuthService.ts` calls `tokenStorage.setTokens(...)` after login — writing only to `sessionStorage`.
- The cookie `access_token` is **never written** anywhere in the codebase. No `document.cookie` assignment, no server action, no SvelteKit `+page.server.ts` sets this cookie.
- **Result:** After a successful login, the server-side hook will always redirect back to `/login` because the cookie it checks never exists. The server guard and the client token store are completely disconnected and the auth flow is broken end-to-end.

**Token not validated on the server — only presence is checked:**
- `src/hooks.server.ts` only checks `if (!token)` — it does not verify the JWT signature, expiry, or any claims.
- Any non-empty string in the `access_token` cookie would bypass the guard.

**JWT decoded client-side without verification:**
- `src/app/services/storage/tokenStorage.ts` decodes the JWT payload with `atob` and `JSON.parse` to extract the `role` claim.
- There is no signature verification. The role extracted this way cannot be trusted for access control decisions.

**Role-based guard never enforced:**
- `adminGuard.requireRole()` exists but is never called from any page, layout, or server load function (see Architecture Gaps above).
- All authenticated routes are accessible to any role, including `VIEWER`, for operations that should require `SUPER_ADMIN`.

**No CSRF protection:**
- All state-mutating operations will use `fetch` from the client with `Authorization: Bearer` headers. No CSRF token mechanism is present or referenced.

**No token refresh mechanism:**
- `API_PATHS.AUTH_REFRESH` is defined in `src/core/constants/apiPaths.ts` but there is no refresh logic anywhere in the codebase.
- When the access token expires, requests will silently fail with 401 errors. The `DashboardRepository` maps 401 to `UnauthorizedFailure` with the server's message but does not trigger a refresh or redirect to login.
- The `AuthTokens` entity includes `expiresIn` but it is never read or stored.

---

## Missing Error Handling

**No global error boundary:**
- There is no `src/routes/+error.svelte` file. Unhandled SvelteKit errors will use the default framework error page, which is unstyled and out of context with the admin UI.

**API client does not handle non-JSON responses:**
- `src/app/services/api/apiClient.ts` calls `await response.json()` unconditionally.
- If the server returns a non-JSON response (e.g., a 502 gateway error returning HTML, a network timeout, or a CORS error), this will throw an unhandled `SyntaxError`.
- The `catch` blocks in repositories catch this as a `NetworkFailure`, but the distinction is lost and the error message will be the generic "Falha de rede" rather than a useful diagnostic.

**No loading state reset on navigation:**
- `src/app/features/auth/presentation/controllers/authController.svelte.ts`: `state.loading` is never reset to `false` on successful login before `goto('/dashboard')` is called. If navigation fails, the button stays permanently disabled.

**401 responses do not trigger logout or redirect:**
- `DashboardRepository` returns `UnauthorizedFailure` on 401 but `DashboardPage.svelte` only displays `result.failure.message` as a string. The user is not redirected to `/login` and the expired session is not cleared.

**`routeMessages.ts` is defined but never used:**
- `src/app/shared/messages/routeMessages.ts` exports `fromApiResponse()` as a utility for toast/flash messaging.
- No component, page, or layout currently uses it.

---

## Performance Concerns

**Inline styles throughout — no CSS extraction:**
- Every page and component uses inline `style="..."` strings with hardcoded hex colors, pixel values, and repeated patterns.
- Tailwind CSS 4 is installed (`@tailwindcss/vite`) but used only partially (a few utility classes like `flex`, `min-h-screen`, `gap-4` in `LoginPage.svelte`; all layout and color styling is inline).
- Inline styles cannot be cached by the browser, cannot be shared across components, and produce larger HTML payloads.
- The color palette (`#070707`, `#0F0F18`, `#0A0A0F`, `#1A1A28`, `#F6F6FF`, `#9090A8`, `#FF00FF`, `#01FAFB`) is duplicated across every file with no central design token system.

**No pagination implementation:**
- `PaginatedResult<T>` entity exists in `src/app/shared/entities/PaginatedResult.ts` but is not used anywhere.
- When list pages are implemented, there is no existing pagination component or pattern to follow.

**Dashboard metrics not refreshed:**
- `DashboardPage.svelte` loads metrics once in `onMount` with no polling, no manual refresh button, and no cache-busting. Stale data is displayed indefinitely.

---

## Technical Debt

**No tests exist:**
- There are no `*.test.ts`, `*.spec.ts`, `*.test.svelte`, or `*.spec.svelte` files anywhere in the project.
- No test runner is configured (`vitest`, `jest`, `playwright` are absent from `package.json`).
- The `authValidator.ts` logic and `Failure` hierarchy are the most testable units, but neither has tests.

**`LoginPayload` interface is unused:**
- `src/app/features/auth/payloads/LoginPayload.ts` defines `LoginPayload` but `AuthRepository.login` takes `(email: string, password: string)` parameters directly. The payload type is never referenced.

**Adapter is non-specific:**
- `svelte.config.js` uses `@sveltejs/adapter-auto`, which selects an adapter at build time based on deployment environment detection.
- For a production admin panel, a specific adapter (`adapter-node` or `adapter-vercel`) should be pinned to guarantee deterministic builds and avoid surprising auto-selection behavior.

**No `.env` file present:**
- No `.env`, `.env.example`, or `.env.local` file exists in the project root.
- `src/core/config/env.ts` imports `PUBLIC_API_BASE_URL` from `$env/static/public` with a fallback of `http://localhost:5000`.
- Without a committed `.env.example`, new developers have no documentation of what environment variables are required.

**`docs/` directory not linked to code:**
- `docs/FRONTEND_ADMIN_DOC.md`, `docs/FRONTEND_PLAN.md`, `docs/StyleGuide.md`, `docs/murillo's-architecture-frontend.md`, and `docs/rules.md` exist but are not referenced from any code or configuration.
- There is no `.planning/` directory structure yet (being created by this analysis).

**Merchant detail route params are accessed incorrectly:**
- `src/routes/(admin)/merchants/[id]/+page.svelte` accesses the dynamic segment via `let { params } = $props<{ params: { id: string } }>()` and passes `params.id`.
- In SvelteKit 2 with Svelte 5, dynamic route parameters in `+page.svelte` are accessed through `data` from a `+page.ts` load function, not through a `params` prop directly on the page component. The current pattern may not receive the `id` value correctly and needs a `+page.ts` or `+page.server.ts` load function.

---

## Dependency Concerns

- **`lucide-svelte ^0.475.0`** is the only runtime dependency. It is installed but not imported in any current file. Dead dependency until icon components are used in stub pages.
- All framework packages (`@sveltejs/kit`, `svelte`, `vite`, `tailwindcss`) use `^` ranges. This is appropriate for active development but should be locked to exact versions before any production deployment.
- No security audit tooling (`npm audit` integration, Dependabot, Snyk) is configured.

---

## Summary — Priority Order

| Priority | Concern |
|----------|---------|
| Critical | Auth cookie never set — login flow is broken end-to-end |
| Critical | 9 of 10 feature pages are empty stubs with no data layer |
| High | No role-based access control enforced anywhere |
| High | Token refresh missing — sessions expire silently |
| High | `adminGuard` never called — all routes unprotected after cookie gap is fixed |
| High | No global error boundary (`+error.svelte` missing) |
| Medium | Service locator declared but never used — DI inconsistency |
| Medium | No tests at any layer |
| Medium | Inline styles at scale — no design token system |
| Medium | Root redirect via meta refresh instead of SvelteKit redirect |
| Low | `LoginPayload` unused |
| Low | `lucide-svelte` installed but not imported |
| Low | No `.env.example` for onboarding |

---

*Concerns audit: 2026-03-24*
