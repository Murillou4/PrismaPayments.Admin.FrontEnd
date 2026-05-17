# Architecture Research — Payment Admin Panel

**Project:** PrismaPayments Admin Frontend
**Researched:** 2026-03-24
**Confidence:** HIGH — based on direct codebase analysis, not external assumptions

---

## SSR Auth Pattern in SvelteKit

### The Current Bug

`hooks.server.ts` checks `event.cookies.get('access_token')` but `AuthService.login()` calls
`tokenStorage.setTokens()` which writes only to `sessionStorage`. The cookie is never written.
Every request except `/login` gets a 303 redirect. This must be fixed before any other feature
can be tested.

### Correct Two-Layer Auth Architecture

The intended pattern (documented in Key Decisions) requires two separate stores for the same token:

| Layer | Storage | Written by | Read by |
|-------|---------|-----------|---------|
| SSR guard | HttpOnly cookie `access_token` | Server-side SvelteKit action or `+page.server.ts` | `hooks.server.ts` |
| Client-side | `sessionStorage` (existing) | `tokenStorage.setTokens()` (existing) | `apiClient.ts`, `adminGuard.ts` |

### Fix Pattern

The login POST must flow through a SvelteKit server action so the server can `Set-Cookie`:

```
src/routes/login/+page.server.ts   ← new file
```

```typescript
// +page.server.ts (login route)
import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData();
    const email = String(data.get('email'));
    const password = String(data.get('password'));

    // Call backend directly from server
    const res = await fetch(`${env.apiBaseUrl}/api/v1/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const body = await res.json();

    if (!body || body.responseType !== 'Success') {
      return fail(401, { error: body.message ?? 'Credenciais inválidas' });
    }

    // Write HttpOnly cookie — this is what hooks.server.ts reads
    cookies.set('access_token', body.data.accessToken, {
      httpOnly: true,
      secure: true,          // toggle off for dev if needed
      sameSite: 'strict',
      path: '/',
      maxAge: body.data.expiresIn
    });

    // Optionally store refresh token in a separate cookie
    cookies.set('refresh_token', body.data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    throw redirect(303, '/dashboard');
  }
};
```

The existing `LoginPage.svelte` + `authController.svelte.ts` must be adapted to use `use:enhance`
with a `<form method="POST">` instead of calling `service.login()` directly in JavaScript.
`tokenStorage.setTokens()` is still called client-side from the form's `onResult` callback so
`apiClient` can read the token from `sessionStorage` without round-trips to the server.

### hooks.server.ts — Minimal Extension for Role Forwarding

The current `hooks.server.ts` only checks token presence. Extend it to forward the token into
`event.locals` so server-side `+page.server.ts` files can run role checks without decoding JWT
again:

```typescript
// hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  const isPublic = PUBLIC_ROUTES.some(r => path.startsWith(r));

  if (!isPublic) {
    const token = event.cookies.get('access_token');
    if (!token) throw redirect(303, '/login');
    event.locals.accessToken = token; // forward for page.server.ts use
  }

  return resolve(event);
};
```

Add to `src/app.d.ts`:
```typescript
declare global {
  namespace App {
    interface Locals {
      accessToken: string | undefined;
    }
  }
}
```

### Do NOT Use sessionStorage for SSR Checks

`sessionStorage` is browser-only — it returns `null` on the server. `tokenStorage` already guards
with `typeof window === 'undefined'`, which is why the hook fails silently. The cookie approach is
the only correct answer for SSR.

---

## RBAC Implementation

### Existing Infrastructure — Use It

`adminGuard.ts` is complete and correct. The numeric hierarchy (`VIEWER=1 … SUPER_ADMIN=4`) and
`hasPermission()` are the right primitives. The gap is that `requireRole()` is never called in
any route.

### Server-Side Role Guard (New Pattern)

For routes that need role protection at the server level, create thin `+page.server.ts` files
inside the route group:

```typescript
// src/routes/(admin)/admin-users/+page.server.ts
import type { PageServerLoad } from './$types';
import { decodeJwtPayload } from '$appmod/services/storage/tokenStorage'; // expose helper
import { hasPermission } from '$app/shared/guards/adminGuard';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // locals.accessToken set by hooks.server.ts
  const payload = decodeJwtPayload(locals.accessToken!);
  const role = payload?.role as string ?? null;

  if (!hasPermission(role, 'SUPER_ADMIN')) {
    throw error(403, 'Acesso negado');
  }

  return {}; // page component handles data fetching client-side
};
```

Note: `decodeJwtPayload` is currently private inside `tokenStorage.ts`. Export it, or duplicate
a server-safe version that does not use `atob` (use `Buffer.from(b64, 'base64').toString()` on
the Node.js side in `+page.server.ts`).

### Client-Side Role Guard — Call requireRole in onMount

For features where SSR role checking is not critical (most admin pages, given data is loaded
client-side anyway), call `requireRole()` in `onMount` inside the page component or controller:

```typescript
// Inside a controller or page onMount
import { requireRole } from '$app/shared/guards/adminGuard';

onMount(() => {
  requireRole('SUPPORT'); // redirects if insufficient role
  // then fetch data
});
```

This pattern works because SvelteKit's `redirect()` thrown inside `onMount` is caught by the
framework and triggers client-side navigation to `/login` or `/dashboard`.

### UI Conditional Rendering

Use `hasPermission()` reactively in templates. Role comes from `tokenStorage.getAdminRole()`:

```svelte
<script lang="ts">
  import { hasPermission } from '$app/shared/guards/adminGuard';
  import { tokenStorage } from '$appmod/services/storage/tokenStorage';

  const userRole = tokenStorage.getAdminRole() as AdminRole;
</script>

{#if hasPermission(userRole, 'ADMIN')}
  <button>Criar Merchant</button>
{/if}
```

This is synchronous — no async needed since the JWT is already in sessionStorage.

### Role-to-Route Matrix

| Route | Minimum Role |
|-------|-------------|
| `/dashboard` | VIEWER |
| `/merchants` | VIEWER |
| `/merchants/[id]` | VIEWER |
| `/merchants/[id]/kyc` | SUPPORT |
| `/transactions/*` | VIEWER |
| `/disputes` | SUPPORT |
| `/fees` | VIEWER |
| `/fees` (write) | ADMIN |
| `/admin-users` | SUPER_ADMIN |
| `/audit` | ADMIN |
| `/providers` | VIEWER |
| `/diagnostics` | ADMIN |
| `/config` | ADMIN |

---

## Token Refresh Pattern

### Current State

`apiClient.ts` has no refresh logic. It appends the token and fires the request. If the server
returns 401, the repository maps it to `UnauthorizedFailure` and the page shows an error — the
user must log in again manually.

### Recommended: Interceptor in apiClient

The simplest correct approach is to wrap the `request()` function with a single retry that
attempts a refresh before giving up. Do not add per-repository retry logic — centralize it.

```typescript
// src/app/services/api/apiClient.ts (extended pattern)
import { tokenStorage } from '../storage/tokenStorage';
import { env } from '$core/config/env';
import type { ApiResponse } from './apiResponse';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const body = await res.json() as ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>;
    if (body.responseType === 'Success' && body.data) {
      tokenStorage.setTokens(body.data.accessToken, body.data.refreshToken);
      // Also update the HttpOnly cookie via a lightweight server endpoint
      // (see note below on cookie sync)
      return body.data.accessToken;
    }
  } catch {
    // refresh failed
  }
  return null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  // ... existing logic ...
  const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json() as ApiResponse<T>;

  // Auto-refresh on 401
  if (response.status === 401 && !options.skipAuth && !options._isRetry) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        // Drain queue
        refreshQueue.forEach(cb => cb(newToken));
        refreshQueue = [];
        // Retry original request once
        return request<T>(path, { ...options, _isRetry: true });
      } else {
        // Refresh failed — clear tokens and redirect
        tokenStorage.clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return data;
      }
    } else {
      // Another request already refreshing — queue this one
      return new Promise(resolve => {
        refreshQueue.push(async (token: string) => {
          const retryOptions = { ...options, _isRetry: true };
          resolve(await request<T>(path, retryOptions));
        });
      });
    }
  }

  return data;
}
```

Add `_isRetry?: boolean` to `RequestOptions` to prevent infinite refresh loops.

### Cookie Sync After Refresh

The HttpOnly cookie will be stale after a refresh because JavaScript cannot write HttpOnly
cookies. Add a minimal server endpoint that accepts the new access token from the client and
re-sets the cookie:

```
POST /api/internal/sync-token
Body: { accessToken: string }
```

```typescript
// src/routes/api/internal/sync-token/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { accessToken } = await request.json();
  cookies.set('access_token', accessToken, {
    httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 3600
  });
  return json({ ok: true });
};
```

Call this endpoint (fire-and-forget) immediately after `tokenStorage.setTokens()` during refresh.
This keeps the SSR guard in sync without requiring a page reload.

### API_PATHS Entry

`AUTH_REFRESH: '/api/v1/auth/refresh'` already exists in `apiPaths.ts` — use it.

---

## Shared DataTable Architecture

### Problem

Five+ features (Merchants, Payments, Withdrawals, Disputes, Admin Users, Diagnostics, Audit)
need a paginated, filterable table. Each has different columns, different row types, different
actions, and different filter sets.

### Recommended: Generic Typed DataTable with Column Definitions

Use a single `DataTable.svelte` component in `src/app/shared/widgets/` driven by a column
definition array. This follows the established pattern of `AdminLayout.svelte` being in shared
widgets.

**Column definition type** (place in `src/app/shared/types/dataTable.ts`):

```typescript
export type ColumnAlign = 'left' | 'center' | 'right';

export interface ColumnDef<T> {
  key: keyof T | string;           // property path on row, or arbitrary key for custom
  label: string;                   // header text
  align?: ColumnAlign;
  width?: string;                  // e.g. '120px', '20%'
  sortable?: boolean;
  render?: (value: unknown, row: T) => string; // transform to display string
  // For cells needing Svelte markup (badges, buttons), use a named slot keyed by column.key
}
```

**DataTable component signature:**

```svelte
<!-- src/app/shared/widgets/DataTable.svelte -->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { ColumnDef } from '../types/dataTable';
  import type { PaginatedResult } from '../entities/PaginatedResult';

  interface Props {
    columns: ColumnDef<T>[];
    result: PaginatedResult<T> | null;
    loading?: boolean;
    onPageChange?: (page: number) => void;
    onSort?: (key: string, dir: 'asc' | 'desc') => void;
    rowKey?: keyof T; // for keyed each blocks
  }

  let { columns, result, loading = false, onPageChange, onSort, rowKey }: Props = $props();
</script>
```

**Named snippet pattern for custom cell content** (Svelte 5):

```svelte
<!-- Usage in MerchantsListPage.svelte -->
<DataTable {columns} {result} {loading} {onPageChange}>
  {#snippet cell(column, row)}
    {#if column.key === 'status'}
      <StatusBadge status={row.status} />
    {:else if column.key === 'actions'}
      <a href="/merchants/{row.id}">Ver</a>
    {:else}
      {row[column.key]}
    {/if}
  {/snippet}
</DataTable>
```

This avoids the need for per-feature DataTable variants. The `render` function handles simple
string transformations (dates, currency); the `{#snippet cell}` handles anything needing
component markup.

### Pagination

`PaginatedResult<T>` already exists with `items`, `total`, `skip`, `limit`. The DataTable
should derive current page and total pages from these:

```
currentPage = Math.floor(skip / limit) + 1
totalPages  = Math.ceil(total / limit)
```

Expose a `Pagination.svelte` sub-component in shared widgets, used by DataTable internally.

### Empty / Loading States

DataTable owns its own skeleton rows (loading) and empty state slot so each feature does not
re-implement these.

---

## State Management

### Current Pattern — Keep It

The codebase uses Svelte 5 `$state` rune exclusively — local reactive state in controller files
(`.svelte.ts`) or inline in page components. There are no Svelte stores, no external state
managers. This is the correct pattern for an admin panel where:

- Each page manages its own data lifecycle
- There is no meaningful cross-page shared state (other than the auth token, already in sessionStorage)
- Pages are not composed simultaneously (sidebar nav, not tabs)

**Do not introduce Svelte stores or any global state library.** The overhead is unjustified and
breaks the existing pattern.

### Controller Pattern — Prefer It for All New Features

The dashboard uses inline `$state` directly in the `.svelte` file. Auth uses a dedicated
`authController.svelte.ts`. The controller pattern is superior for new features because:

- Keeps `.svelte` files as pure templates
- Makes the controller independently testable (no DOM required)
- Matches what the codebase documents as the intended pattern

Every new feature should produce a `<FeatureName>Controller.svelte.ts` file.

### Controller State Shape Pattern

```typescript
// src/app/features/merchants/management/presentation/controllers/merchantsController.svelte.ts
import type { Merchant } from '../../domain/entities/Merchant';
import type { PaginatedResult } from '$app/shared/entities/PaginatedResult';

interface MerchantsState {
  loading: boolean;
  error: string | null;
  result: PaginatedResult<Merchant> | null;
  filters: MerchantFilters;
  sortKey: string;
  sortDir: 'asc' | 'desc';
}

function createMerchantsController() {
  let state = $state<MerchantsState>({
    loading: false,
    error: null,
    result: null,
    filters: { status: null, verificationStatus: null, search: '' },
    sortKey: 'createdAt',
    sortDir: 'desc'
  });

  const service = new MerchantService(new MerchantRepository());

  async function load(page = 1): Promise<void> {
    state.loading = true;
    state.error = null;

    const result = await service.list({
      ...state.filters,
      skip: (page - 1) * 20,
      limit: 20
    });

    if (!result.ok) {
      state.error = result.failure.message;
    } else {
      state.result = result.value;
    }

    state.loading = false;
  }

  return {
    get state() { return state; },
    load,
    setFilter(key: keyof MerchantFilters, value: unknown) {
      (state.filters as any)[key] = value;
      load(1); // reset to page 1 on filter change
    }
  };
}

export { createMerchantsController };
```

### What Not to Do

- Do not use `writable()` Svelte stores for page-local state — `$state` is simpler and faster
- Do not put merchant list data in a store shared between pages — the list is always fresh on mount
- Do not use `$derived` for computed values that are already derivable in the template — only use it when the derivation is expensive or needed in multiple places

---

## Shared Filter Components

### Problem

Merchants, Payments, Withdrawals, Disputes, Diagnostics, and Audit all need filter bars with
different filter fields but the same interaction pattern: inputs change state, a "Buscar" button
(or debounced onChange) triggers a reload, a "Limpar" button resets.

### Recommended: Composable Primitive Filters + Feature-Specific FilterBar

Do not build a single god-component `FilterBar.svelte` that accepts all possible filter types.
Instead, build small, reusable filter primitives and compose them in a feature-specific wrapper.

**Primitives in `src/app/shared/widgets/filters/`:**

```
SearchInput.svelte       — text input with debounce
SelectFilter.svelte      — <select> with label + options prop
DateRangeFilter.svelte   — two date inputs (from / to)
StatusFilter.svelte      — shortcut: SelectFilter pre-wired with common status options
```

**Each primitive interface:**

```svelte
<!-- SelectFilter.svelte -->
<script lang="ts">
  interface Option { label: string; value: string }
  interface Props {
    label: string;
    options: Option[];
    value: string | null;
    onChange: (v: string | null) => void;
    placeholder?: string;
  }
  let { label, options, value, onChange, placeholder = 'Todos' }: Props = $props();
</script>
```

**Feature-specific filter bar:**

```svelte
<!-- src/app/features/merchants/management/presentation/components/MerchantFilters.svelte -->
<script lang="ts">
  import SelectFilter from '$app/shared/widgets/filters/SelectFilter.svelte';
  import SearchInput from '$app/shared/widgets/filters/SearchInput.svelte';

  interface Props {
    filters: MerchantFilters;
    onChange: (key: keyof MerchantFilters, value: unknown) => void;
    onReset: () => void;
  }
  let { filters, onChange, onReset }: Props = $props();

  const statusOptions = [
    { label: 'Ativo', value: 'ACTIVE' },
    { label: 'Suspenso', value: 'SUSPENDED' },
    // ...
  ];
</script>

<div class="filter-bar">
  <SearchInput value={filters.search} onChange={v => onChange('search', v)} />
  <SelectFilter label="Status" options={statusOptions} value={filters.status} onChange={v => onChange('status', v)} />
  <button onclick={onReset}>Limpar</button>
</div>
```

This keeps `DataTable.svelte` unaware of filter internals, puts domain-specific filter options
inside the feature, and reuses the same primitive inputs everywhere without coupling them.

---

## Feature Structure Template

Every new feature follows this directory layout, derived from the existing auth and dashboard
patterns:

```
src/app/features/<domain>/<sub-feature>/
  domain/
    entities/
      <Entity>.ts                  -- plain TS interfaces, no dependencies
    repositories/
      I<Entity>Repository.ts       -- interface only, returns Either<Failure, T>
  data/
    repositories/
      <Entity>Repository.ts        -- implements domain interface, calls apiClient
  services/
    <Entity>Service.ts             -- orchestrates repo, validation, tokenStorage if needed
  presentation/
    controllers/
      <entity>Controller.svelte.ts -- $state rune + service calls; exported as createXController()
    pages/
      <Entity>ListPage.svelte      -- thin template, delegates to controller
      <Entity>DetailPage.svelte    -- thin template, delegates to controller
    components/
      <Feature>Filters.svelte      -- feature-specific filter bar using shared primitives
      <Entity>Row.svelte           -- optional, for complex row markup extracted from DataTable
```

### Entity Interface Template

```typescript
// domain/entities/Merchant.ts
export interface Merchant {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'REJECTED';
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNVERIFIED';
  createdAt: string;
  updatedAt: string;
}
```

### Repository Interface Template

```typescript
// domain/repositories/IMerchantRepository.ts
import type { Either, Failure } from '$core/error/Failure';
import type { Merchant } from '../entities/Merchant';
import type { PaginatedResult } from '$app/shared/entities/PaginatedResult';

export interface MerchantListParams {
  status?: string | null;
  verificationStatus?: string | null;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface IMerchantRepository {
  list(params: MerchantListParams): Promise<Either<Failure, PaginatedResult<Merchant>>>;
  getById(id: string): Promise<Either<Failure, Merchant>>;
  updateStatus(id: string, status: string): Promise<Either<Failure, void>>;
}
```

### Repository Implementation Template

```typescript
// data/repositories/MerchantRepository.ts
import type { Either, Failure } from '$core/error/Failure';
import { left, right, NetworkFailure, ServerFailure, UnauthorizedFailure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { isSuccess, isUnauthorized } from '$appmod/services/api/apiResponse';
import { API_PATHS } from '$core/constants/apiPaths';
import type { IMerchantRepository, MerchantListParams } from '../../domain/repositories/IMerchantRepository';
import type { Merchant } from '../../domain/entities/Merchant';
import type { PaginatedResult } from '$app/shared/entities/PaginatedResult';

export class MerchantRepository implements IMerchantRepository {
  async list(params: MerchantListParams): Promise<Either<Failure, PaginatedResult<Merchant>>> {
    try {
      const response = await apiClient.get<PaginatedResult<Merchant>>(
        API_PATHS.ADMIN_MERCHANTS,
        params as Record<string, string | number | boolean | undefined | null>
      );

      if (isSuccess(response) && response.data) return right(response.data);
      if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
      return left(new ServerFailure(response.message, response.extendedResultCode));
    } catch {
      return left(new NetworkFailure());
    }
  }

  async getById(id: string): Promise<Either<Failure, Merchant>> {
    try {
      const response = await apiClient.get<Merchant>(API_PATHS.ADMIN_MERCHANT(id));
      if (isSuccess(response) && response.data) return right(response.data);
      if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
      return left(new ServerFailure(response.message, response.extendedResultCode));
    } catch {
      return left(new NetworkFailure());
    }
  }

  async updateStatus(id: string, status: string): Promise<Either<Failure, void>> {
    try {
      const response = await apiClient.put<void>(API_PATHS.ADMIN_MERCHANT_STATUS(id), { status });
      if (isSuccess(response)) return right(undefined);
      if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
      return left(new ServerFailure(response.message, response.extendedResultCode));
    } catch {
      return left(new NetworkFailure());
    }
  }
}
```

---

## Build Order Recommendations

Dependencies determine order. Shared infrastructure must exist before features that consume it.

### Phase 1 — Fix Auth and Shared Infrastructure (blocks everything)

These have no feature-level dependencies and are blocking all other work:

1. **Fix auth cookie bug** — `+page.server.ts` for login route, writing `access_token` HttpOnly
   cookie. This is the single highest-priority item: nothing else can be tested without it.
2. **Token refresh interceptor** — Extend `apiClient.ts` with the retry/queue pattern + cookie
   sync endpoint. Build this before features so all feature repositories get refresh for free.
3. **`DataTable.svelte`** — Generic paginated table. Every list feature depends on it.
4. **Pagination.svelte** — Internal to DataTable but extractable.
5. **Filter primitives** — `SearchInput`, `SelectFilter`, `DateRangeFilter` in shared/widgets/filters/.
6. **`StatusBadge.svelte`** — Used in Merchants, Transactions, Disputes, Disputes.
7. **`ConfirmDialog.svelte`** — Used in any destructive action (status change, deletion).
8. **`Toast.svelte`** / toast store — Used in every write operation.
9. **`+error.svelte`** global error boundary — Catch-all for unhandled SvelteKit errors.
10. **Activate `adminGuard` in routes** — Add `requireRole()` calls to at least the SUPER_ADMIN
    protected routes (`/admin-users`). Other routes can be wired as features are built.

### Phase 2 — Merchants Feature (highest business value, most complex)

Merchants is the most complex feature (list, detail, KYC, create) and has the most API paths
already defined. Build it first as the template for all other features.

Order within Merchants:
1. Domain entities (`Merchant`, `MerchantDetails`, `KycDocument`)
2. `IMerchantRepository` interface
3. `MerchantRepository` implementation
4. `MerchantService`
5. `MerchantsListPage` + controller (uses DataTable, filter primitives)
6. `MerchantDetailPage` + controller (uses shared StatusBadge, ConfirmDialog)
7. `MerchantKycPage` + controller (document preview, approve/reject)
8. `CreateMerchantPage` + form (ADMIN+ guard)

### Phase 3 — Transactions (Payments + Withdrawals)

Both are read-heavy list pages with filters. Very similar to Merchants list but simpler (no
detail page with mutations). Build Payments first, then Withdrawals as a near-copy.

### Phase 4 — Disputes

Requires ConfirmDialog (from Phase 1) and StatusBadge. List + resolution modal. SUPPORT+ guard.

### Phase 5 — Fees (CRUD + Simulator)

Two sub-features: fee rules CRUD (ADMIN+) and fee simulator (form + display). Fee rules are
independent of Merchants data. Simulator is a standalone form page.

### Phase 6 — Admin Users

SUPER_ADMIN only. Standard CRUD. Simpler than Merchants. Build after Fees so the route guard
pattern is already proven.

### Phase 7 — Audit and Diagnostics

Both are read-only, filter-heavy list pages with detail expansion. High column density.
Diagnostics has trace view (nested log grouping) — build Audit first as the simpler pattern.

### Phase 8 — Providers and Platform Config

Both are read-only snapshots. Providers is a card grid (not a table). Config is a key-value
display. Lowest complexity — good final polish items.

### Dependency Graph Summary

```
Auth fix
  └── All features (nothing works without it)
Token refresh
  └── All features (better UX, build early)
DataTable + Pagination
  └── Merchants list, Payments, Withdrawals, Disputes, Admin Users, Audit, Diagnostics
Filter primitives
  └── Merchants, Payments, Withdrawals, Disputes, Diagnostics, Audit
StatusBadge
  └── Merchants, Transactions, Disputes
ConfirmDialog
  └── Merchants status change, KYC approve/reject, Disputes resolution, Admin Users delete
Toast
  └── All write operations across all features
Merchants (full feature)
  └── Template pattern for all subsequent features
```

---

## Cross-Cutting Notes

### Naming Conventions (derived from existing code)

- Entities: PascalCase interface, no `I` prefix (`Merchant`, not `IMerchant`)
- Repository interfaces: `I` prefix (`IMerchantRepository`)
- Repository classes: no `I` prefix (`MerchantRepository`)
- Services: feature name + `Service` (`MerchantService`)
- Controllers: camelCase factory function export (`createMerchantsController`)
- API paths: already centralized in `apiPaths.ts` — add new paths there, never inline strings

### Brazilian Locale

All formatters are already in `formatters.ts`. Use them consistently:
- Dates: `formatBrazilianDate()`
- Currency: `formatBRL()`
- Documents: `formatCPF()` / `formatCNPJ()`

Do not introduce a new date/currency formatting pattern in feature code.

### Tailwind vs Inline Styles

`AdminLayout.svelte` uses inline styles; some components may use Tailwind classes. Tailwind v4
is configured. For all new components, prefer Tailwind utility classes over inline styles to
ensure consistency and easier dark-mode readiness later. Do not mix both in the same component.

---

*Architecture research: 2026-03-24. Based on direct analysis of codebase, not external assumptions. Confidence: HIGH.*
