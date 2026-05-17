# Codebase Structure

**Analysis Date:** 2026-03-24

## Directory Layout

```
PrismaPayments.Admin.FrontEnd/
├── src/
│   ├── app/                        # Application code (alias: $appmod)
│   │   ├── features/               # Feature modules (one dir per domain area)
│   │   │   ├── admin_users/        # Admin user management feature
│   │   │   ├── audit/              # Audit log feature
│   │   │   ├── auth/               # Authentication feature (most complete)
│   │   │   ├── dashboard/          # Dashboard / metrics feature
│   │   │   ├── diagnostics/        # System diagnostics feature
│   │   │   ├── disputes/           # Payment disputes feature
│   │   │   ├── fees/               # Fee rules feature
│   │   │   ├── merchants/          # Merchant management feature
│   │   │   │   └── management/     # Sub-feature: merchant list + detail
│   │   │   ├── providers/          # Payment provider feature
│   │   │   └── transactions/       # Transactions container
│   │   │       ├── payments/       # Payments sub-feature
│   │   │       └── withdrawals/    # Withdrawals sub-feature
│   │   ├── services/               # Shared infrastructure services
│   │   │   ├── api/                # HTTP client + response helpers
│   │   │   └── storage/            # Token persistence (sessionStorage)
│   │   └── shared/                 # Cross-feature shared code
│   │       ├── entities/           # Shared data shapes (PaginatedResult)
│   │       ├── guards/             # Auth + RBAC guard functions
│   │       ├── messages/           # API → UI message mapping
│   │       ├── utils/              # Pure utility functions (formatters)
│   │       └── widgets/            # Shared Svelte UI components
│   ├── core/                       # Framework-agnostic foundation (alias: $core)
│   │   ├── config/                 # Environment configuration
│   │   ├── constants/              # API path constants
│   │   ├── error/                  # Failure types + Either monad
│   │   └── service_locator/        # DI container (ServiceLocator)
│   ├── routes/                     # SvelteKit file-based routes
│   │   ├── (admin)/                # Route group — applies AdminLayout
│   │   │   ├── admin-users/
│   │   │   ├── audit/
│   │   │   ├── dashboard/
│   │   │   ├── diagnostics/
│   │   │   ├── disputes/
│   │   │   ├── fees/
│   │   │   ├── merchants/
│   │   │   │   └── [id]/           # Dynamic merchant detail route
│   │   │   ├── providers/
│   │   │   └── transactions/
│   │   │       ├── payments/
│   │   │       └── withdrawals/
│   │   └── login/                  # Public auth route (no admin layout)
│   ├── hooks.server.ts             # SvelteKit server hook (auth gate)
│   └── app.css                     # Global styles
├── svelte.config.js                # SvelteKit config + path aliases
├── vite.config.ts                  # Vite config (Tailwind CSS + SvelteKit plugins)
└── package.json
```

## Directory Purposes

**`src/app/features/<feature>/`**
- Purpose: Complete vertical slice for one domain area; self-contained
- Internal structure (when fully built, exemplified by `auth`):
  - `domain/entities/` — plain TypeScript interfaces (no framework)
  - `domain/repositories/` — repository interface (contract)
  - `data/repositories/` — concrete repository class implementing the interface
  - `services/` — business logic class; receives repository via constructor
  - `presentation/pages/` — Svelte page component (the UI)
  - `presentation/controllers/` — optional `.svelte.ts` controller using Svelte 5 runes
  - `payloads/` — request payload interfaces (optional, seen in `auth`)
  - `validators/` — pure validation functions returning error objects (optional)

**`src/app/services/api/`**
- Purpose: Single HTTP client shared by all repository implementations
- Key files:
  - `apiClient.ts` — `fetch` wrapper with Bearer auth injection; methods: `get`, `post`, `put`, `delete`, `postPublic`
  - `apiResponse.ts` — `ApiResponse<T>` shape and status predicate helpers

**`src/app/services/storage/`**
- Purpose: Token persistence abstraction over `sessionStorage`
- Key file: `tokenStorage.ts` — stores `prisma_admin_access_token` and `prisma_admin_refresh_token`; decodes JWT to expose `getAdminRole()`

**`src/app/shared/`**
- Purpose: Reusable code shared across features; not tied to any single feature
- `entities/PaginatedResult.ts` — `PaginatedResult<T>` generic interface (`items`, `total`, `skip`, `limit`)
- `guards/adminGuard.ts` — `AdminRole` type, `hasPermission()`, `requireAuth()`, `requireRole()`
- `utils/formatters.ts` — `formatCurrency()`, `formatDate()`, `formatDocument()`, `formatBasisPoints()`, `formatPercentage()`
- `widgets/AdminLayout.svelte` — sidebar + main content shell; drives primary navigation
- `messages/routeMessages.ts` — `RouteMessage` type, `fromApiResponse()` helper

**`src/core/`**
- Purpose: Zero-dependency foundation; imported by every layer
- `config/env.ts` — exports `env.apiBaseUrl` sourced from `PUBLIC_API_BASE_URL`
- `constants/apiPaths.ts` — all backend API paths as a typed `const` object
- `error/Failure.ts` — `Failure` abstract class, six subtypes, `Either<F,S>` type, `left()`/`right()` constructors
- `service_locator/serviceLocator.ts` — `ServiceLocator` class with lazy/eager singleton registration; exported as `sl`

**`src/routes/`**
- Purpose: SvelteKit file-based routing shell; contains minimal logic
- Convention: Every `+page.svelte` file imports exactly one feature page component and renders it — no business logic in route files
- `(admin)/` — route group applying the admin layout to all protected routes
- `login/` — standalone public route, no admin layout applied

## Feature Modules List

| Feature Directory | Domain Area | Route(s) |
|---|---|---|
| `auth` | Login / logout / token management | `/login` |
| `dashboard` | Platform metrics overview | `/dashboard` |
| `merchants/management` | Merchant list + detail management | `/merchants`, `/merchants/[id]` |
| `transactions/payments` | Payment transaction list | `/transactions/payments` |
| `transactions/withdrawals` | Withdrawal transaction list | `/transactions/withdrawals` |
| `disputes` | Payment dispute management | `/disputes` |
| `fees` | Fee rule configuration | `/fees` |
| `audit` | Audit log viewing | `/audit` |
| `providers` | Payment provider management | `/providers` |
| `diagnostics` | System diagnostics / log inspection | `/diagnostics` |
| `admin_users` | Admin user management | `/admin-users` |

## Route Structure

All routes except `/login` are inside the `(admin)` route group and are protected by `hooks.server.ts`.

```
/                               → meta-refresh to /dashboard (src/routes/+page.svelte)
/login                          → LoginPage (public)
/dashboard                      → DashboardPage
/merchants                      → MerchantsListPage
/merchants/[id]                 → MerchantDetailPage (receives merchantId prop)
/transactions/payments          → PaymentsListPage
/transactions/withdrawals       → WithdrawalsListPage
/disputes                       → DisputesListPage
/fees                           → FeesListPage
/audit                          → AuditPage
/providers                      → ProvidersPage
/diagnostics                    → DiagnosticsPage
/admin-users                    → AdminUsersPage
```

**Layout hierarchy:**
```
+layout.svelte (root)            ← applies app.css
  └── (admin)/+layout.svelte     ← wraps in AdminLayout.svelte (sidebar nav)
        └── <feature>/+page.svelte  ← renders single feature component
```

**Server-side guard:** `src/hooks.server.ts` checks for `access_token` cookie on every non-`/login` request; redirects to `/login` if absent.

## Path Aliases

Configured in `svelte.config.js`:

| Alias | Resolves To | Usage |
|---|---|---|
| `$appmod` | `./src/app` | Import anything from the app layer |
| `$core` | `./src/core` | Import error types, constants, config |
| `$app` | SvelteKit built-in | `$app/navigation`, `$app/stores` |
| `$env` | SvelteKit built-in | `$env/static/public` for env vars |

## Where to Add New Code

**New feature:**
1. Create `src/app/features/<feature_name>/` with subdirectories: `domain/entities/`, `domain/repositories/`, `data/repositories/`, `services/`, `presentation/pages/`
2. Add domain entity interface in `domain/entities/<EntityName>.ts`
3. Add repository interface in `domain/repositories/I<Feature>Repository.ts`
4. Implement repository in `data/repositories/<Feature>Repository.ts` — use `apiClient` and return `Either`
5. Add paths to `src/core/constants/apiPaths.ts`
6. Create service class in `services/<Feature>Service.ts`
7. Create page component in `presentation/pages/<Feature>Page.svelte`
8. Create route file `src/routes/(admin)/<feature>/+page.svelte` — import and render the page component only
9. Add nav link in `src/app/shared/widgets/AdminLayout.svelte` `navItems` array

**New shared utility:**
- Pure functions → `src/app/shared/utils/formatters.ts` (or new file in `src/app/shared/utils/`)
- Shared Svelte component → `src/app/shared/widgets/`
- Shared entity/type → `src/app/shared/entities/`

**New API endpoint path:**
- Add to `src/core/constants/apiPaths.ts` in the appropriate comment section

**New Failure type:**
- Extend `Failure` abstract class in `src/core/error/Failure.ts`

## Special Directories

**`src/routes/(admin)/`:**
- Purpose: SvelteKit route group; groups all protected admin pages under `AdminLayout.svelte`
- Generated: No
- Committed: Yes
- Note: The `(admin)` parentheses syntax means this directory name is NOT part of the URL path

**`.planning/`:**
- Purpose: GSD planning documents (architecture analysis, phase plans)
- Generated: Yes (by GSD tooling)
- Committed: Yes

---

*Structure analysis: 2026-03-24*
