# Architecture

**Analysis Date:** 2026-03-24

## Pattern Overview

**Overall:** Feature-Sliced Clean Architecture inside a SvelteKit application

Each feature module is internally organized into three horizontal layers (domain → data → presentation), mirroring Clean Architecture. The SvelteKit file-based router is a thin shell that delegates entirely to feature-level page components. A custom Service Locator is available for dependency injection, though some features wire dependencies directly via constructors.

**Key Characteristics:**
- Features are the primary organizational unit under `src/app/features/`
- Each feature owns its own domain entities, repository interfaces, repository implementations, services, and page components
- SvelteKit route files contain no business logic — they import and render a single feature page component
- The `Either<Failure, T>` type (functional error handling) is used universally across the data and service layers
- A centralized `ServiceLocator` singleton (`sl`) supports lazy singleton and eager singleton registration, but direct constructor wiring is also used (e.g., `new DashboardService(new DashboardRepository())`)

## Layers

**Domain Layer:**
- Purpose: Define business entities and repository contracts — no framework dependencies
- Location: `src/app/features/<feature>/domain/`
- Contains: TypeScript interfaces (repository contracts) and plain TypeScript interfaces/types (entities)
- Depends on: `src/core/error/Failure` for `Either` type signatures only
- Used by: Service layer and data layer (implements interfaces)
- Examples:
  - `src/app/features/auth/domain/entities/AdminUser.ts` — `AdminUser`, `AuthTokens` interfaces
  - `src/app/features/auth/domain/repositories/IAuthRepository.ts` — repository contract
  - `src/app/features/dashboard/domain/entities/AdminMetrics.ts` — metrics entity

**Data Layer:**
- Purpose: Implement repository contracts by calling the backend API via `apiClient`
- Location: `src/app/features/<feature>/data/repositories/`
- Contains: Concrete repository classes implementing domain interfaces
- Depends on: `src/app/services/api/apiClient`, `src/core/constants/apiPaths`, `src/core/error/Failure`
- Used by: Service layer (injected via constructor)
- Pattern: Wraps every API call in try/catch; maps HTTP status codes to typed `Failure` subtypes; returns `Either<Failure, T>`
- Examples:
  - `src/app/features/auth/data/repositories/AuthRepository.ts`
  - `src/app/features/dashboard/data/repositories/DashboardRepository.ts`

**Service Layer:**
- Purpose: Orchestrate domain logic — validate inputs, coordinate repositories, manage token storage
- Location: `src/app/features/<feature>/services/`
- Contains: Plain TypeScript classes receiving repository via constructor injection
- Depends on: Domain interfaces, `src/core/error/Failure`, `src/app/services/storage/tokenStorage`
- Used by: Presentation layer (controllers or page components)
- Examples:
  - `src/app/features/auth/services/AuthService.ts` — validates credentials, calls repo, persists tokens
  - `src/app/features/dashboard/services/DashboardService.ts` — thin pass-through to repository

**Presentation Layer:**
- Purpose: Render UI, hold reactive state, orchestrate service calls
- Location: `src/app/features/<feature>/presentation/`
- Contains: Svelte page components (`.svelte`), optional controller files (`.svelte.ts` using Svelte 5 runes)
- Depends on: Service layer, `src/app/shared/`
- Pattern (two variants observed):
  1. Controller pattern — `authController.svelte.ts` creates a reactive state object using `$state` rune; page component calls controller functions
  2. Direct pattern — `DashboardPage.svelte` instantiates service directly inside `<script>` and manages `$state` variables inline (no separate controller file)
- Examples:
  - `src/app/features/auth/presentation/controllers/authController.svelte.ts`
  - `src/app/features/auth/presentation/pages/LoginPage.svelte`
  - `src/app/features/dashboard/presentation/pages/DashboardPage.svelte`

**Core Layer:**
- Purpose: Framework-agnostic foundational utilities shared across all features
- Location: `src/core/`
- Contains: Error types, API path constants, environment config, service locator
- Depends on: Nothing internal
- Used by: All layers
- Key files:
  - `src/core/error/Failure.ts` — abstract `Failure` class, six concrete subtypes, `Either<F, S>` type, `left()`/`right()` constructors
  - `src/core/constants/apiPaths.ts` — all backend API path strings as a typed `const` object
  - `src/core/config/env.ts` — reads `PUBLIC_API_BASE_URL` from SvelteKit env
  - `src/core/service_locator/serviceLocator.ts` — `ServiceLocator` class, exported as singleton `sl`

**Shared App Layer:**
- Purpose: Cross-feature utilities and UI primitives shared within the application
- Location: `src/app/shared/`
- Contains: Shared entities, guards, formatters, UI widgets, message helpers
- Key files:
  - `src/app/shared/guards/adminGuard.ts` — `hasPermission()`, `requireAuth()`, `requireRole()` functions; role hierarchy: VIEWER < SUPPORT < ADMIN < SUPER_ADMIN
  - `src/app/shared/entities/PaginatedResult.ts` — generic `PaginatedResult<T>` interface
  - `src/app/shared/utils/formatters.ts` — BRL currency, Brazilian date, CPF/CNPJ document, basis points, percentage formatters
  - `src/app/shared/widgets/AdminLayout.svelte` — sidebar navigation shell used by the admin route group layout
  - `src/app/shared/messages/routeMessages.ts` — maps `ApiResponse` to typed `RouteMessage` for UI feedback

**Infrastructure Services Layer:**
- Purpose: Provide low-level I/O capabilities (HTTP, token persistence) used by repository implementations
- Location: `src/app/services/`
- Contains: API client, API response helpers, token storage
- Key files:
  - `src/app/services/api/apiClient.ts` — typed `fetch` wrapper; injects Bearer token from `tokenStorage`; exposes `get`, `post`, `put`, `delete`, `postPublic`
  - `src/app/services/api/apiResponse.ts` — `ApiResponse<T>` interface and status-check helpers (`isSuccess`, `isUnauthorized`, etc.)
  - `src/app/services/storage/tokenStorage.ts` — reads/writes access and refresh tokens in `sessionStorage`; decodes JWT payload to extract `role` claim

## Data Flow

**Authenticated Request (e.g., Dashboard metrics load):**

1. `DashboardPage.svelte` calls `onMount` → instantiates `new DashboardService(new DashboardRepository())`
2. `DashboardService.getMetrics()` delegates directly to `DashboardRepository.getMetrics()`
3. `DashboardRepository` calls `apiClient.get(API_PATHS.DASHBOARD_ADMIN)`
4. `apiClient` reads access token from `tokenStorage` (sessionStorage), appends `Authorization: Bearer <token>` header, calls `fetch`
5. Raw `ApiResponse<AdminMetrics>` is returned to repository
6. Repository maps response to `Either<Failure, AdminMetrics>` using status-check helpers
7. `DashboardService` returns the `Either` unchanged
8. `DashboardPage.svelte` inspects `result.ok`: sets `$state` metrics or error string
9. Svelte reactivity re-renders the template

**Authentication Flow:**

1. `LoginPage.svelte` renders a form bound to `authController` state
2. On submit, `authController.login()` is invoked
3. `AuthService.login()` validates inputs via `authValidator`; on validation failure returns `left(ValidationFailure)`
4. If valid, calls `AuthRepository.login()` which POSTs to `/api/v1/auth/admin/login` (skipAuth = true)
5. On success, `AuthService` calls `tokenStorage.setTokens()` persisting tokens to `sessionStorage`
6. Controller calls `goto('/dashboard')`
7. `hooks.server.ts` guards subsequent page navigations by checking the `access_token` cookie (note: token is in sessionStorage client-side; server hook checks cookie separately)

**Route Guard Flow:**

1. `hooks.server.ts` intercepts every server-side request
2. Public routes (only `/login`) bypass the guard
3. All other routes require an `access_token` cookie; absence triggers `redirect(303, '/login')`
4. Client-side role checks use `adminGuard.ts` functions (`requireRole`) reading the role claim from the JWT stored in sessionStorage

**State Management:**
- Local reactive state only — Svelte 5 `$state` rune inside components or `.svelte.ts` controller files
- No global state store (no Svelte stores, no external state manager)
- Tokens are the only cross-page persistent state, stored in `sessionStorage`

## Key Abstractions

**Either / Failure:**
- Purpose: Represent success or typed failure without exceptions
- Location: `src/core/error/Failure.ts`
- Pattern: `Either<F extends Failure, S>` is a discriminated union `{ ok: false; failure: F } | { ok: true; value: S }`. Callers pattern-match on `result.ok`.
- Subtypes: `NetworkFailure`, `UnauthorizedFailure`, `ForbiddenFailure`, `NotFoundFailure`, `ValidationFailure`, `ServerFailure`

**IAuthRepository (Repository Interface):**
- Purpose: Decouple service layer from HTTP implementation
- Location: `src/app/features/auth/domain/repositories/IAuthRepository.ts`
- Pattern: Interface in domain layer, implementation in data layer — enables substitution for testing

**ServiceLocator:**
- Purpose: Manual dependency injection container
- Location: `src/core/service_locator/serviceLocator.ts`
- Pattern: `registerLazySingleton(key, factory)` defers construction until first `get(key)`; `registerSingleton(key, instance)` stores immediately. Exported as `sl` singleton.
- Note: Not heavily used in current codebase — features wire dependencies directly via `new`

**AdminGuard:**
- Purpose: Enforce authentication and role-based access control on the client
- Location: `src/app/shared/guards/adminGuard.ts`
- Pattern: Numeric role levels (VIEWER=1, SUPPORT=2, ADMIN=3, SUPER_ADMIN=4); `hasPermission(userRole, requiredRole)` compares levels; `requireRole()` throws SvelteKit redirect on failure

## Entry Points

**Root Route (`/`):**
- Location: `src/routes/+page.svelte`
- Triggers: Direct navigation to `/`
- Responsibilities: Meta-refresh redirect to `/dashboard` (no server-side logic)

**Server Hook:**
- Location: `src/hooks.server.ts`
- Triggers: Every SSR request
- Responsibilities: Cookie-based auth gate; redirects unauthenticated requests to `/login`

**Admin Layout:**
- Location: `src/routes/(admin)/+layout.svelte`
- Triggers: Any route inside the `(admin)` route group
- Responsibilities: Wraps all admin pages in `AdminLayout.svelte` (sidebar + main content shell)

**Root Layout:**
- Location: `src/routes/+layout.svelte`
- Triggers: All routes
- Responsibilities: Applies global CSS (`app.css`); renders child routes

## Error Handling

**Strategy:** Functional `Either` pattern — no thrown exceptions in business logic; network errors are caught and wrapped

**Patterns:**
- Repository layer: `try/catch` around `fetch`; network errors → `NetworkFailure`; HTTP status mapping → typed `Failure` subtypes
- Service layer: returns `Either` from repository unchanged, or wraps validation errors in `left(new ValidationFailure(...))`
- Presentation layer: checks `result.ok`, sets error string to reactive `$state` variable, renders inline error UI
- Route messages: `src/app/shared/messages/routeMessages.ts` provides `fromApiResponse()` to convert raw API responses to typed `RouteMessage` objects for UI display

## Cross-Cutting Concerns

**Authentication:** Two-layer — server-side cookie check in `hooks.server.ts`; client-side token check via `tokenStorage` and `adminGuard`

**Authorization:** Role-based, numeric hierarchy in `adminGuard.ts`; role extracted from JWT payload by `tokenStorage.getAdminRole()`

**API Communication:** Single `apiClient` instance in `src/app/services/api/apiClient.ts`; all paths centralized in `src/core/constants/apiPaths.ts`

**Localization:** Brazilian Portuguese UI strings and BRL/pt-BR formatting throughout (`Intl.NumberFormat`, `Intl.DateTimeFormat` with `pt-BR` locale)

**Styling:** Inline `style` attributes on most elements; Tailwind CSS v4 available via `@tailwindcss/vite` but `AdminLayout.svelte` uses inline styles; `app.css` loaded at root layout

---

*Architecture analysis: 2026-03-24*
