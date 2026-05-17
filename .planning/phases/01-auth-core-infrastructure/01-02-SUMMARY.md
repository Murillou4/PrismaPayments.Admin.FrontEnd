---
phase: 01-auth-core-infrastructure
plan: 02
subsystem: auth
tags: [auth, rbac, apiClient, token-refresh, svelte-context, lucide-svelte, vitest]
dependency_graph:
  requires:
    - 01-01 (tokenStorage with jwt-decode, logout route, +layout.server.ts adminRole, sync-token endpoint)
  provides:
    - apiClient with 401 interceptor + concurrency queue
    - Role available globally via setContext/getContext in admin layout
    - RBAC-controlled sidebar menu (SUPER_ADMIN item absent from DOM for lower roles)
    - Toaster svelte-sonner mounted once in admin layout
    - Logout via form action (cookie-clearing server-side)
    - 6 passing RBAC tests (hasPermission all cases)
  affects:
    - src/app/services/api/apiClient.ts (all API requests now have 401 auto-refresh)
    - src/routes/(admin)/** (all children now have setContext adminRole)
    - src/app/shared/widgets/AdminLayout.svelte (RBAC menu, Lucide icons)
tech_stack:
  added: []
  patterns:
    - Module-level isRefreshing flag + refreshQueue array for concurrency control
    - fire-and-forget fetch to /api/internal/sync-token after successful refresh
    - _isRetry flag on RequestOptions prevents infinite refresh loop
    - setContext/getContext for role propagation in SvelteKit layout tree
    - $derived for reactive RBAC menu filtering
key_files:
  created: []
  modified:
    - src/app/services/api/apiClient.ts
    - src/routes/(admin)/+layout.svelte
    - src/app/shared/widgets/AdminLayout.svelte
    - src/lib/auth/__tests__/auth.test.ts
    - src/lib/rbac/__tests__/rbac.test.ts
decisions:
  - "rbac.test.ts imports adminGuard via relative path (not $appmod alias) — consistent with auth.test.ts pattern from plan 01 to avoid vitest alias config changes"
  - "logout route +page.server.ts was already created in plan 01 — no change needed"
  - "logout +page.svelte from plan 01 already has auto-submit on mount — superior to plan spec, kept as-is"
metrics:
  duration_minutes: 8
  completed_date: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 5
---

# Phase 1 Plan 02: Token Refresh Interceptor + RBAC Wiring Summary

**One-liner:** apiClient gains 401 interceptor with concurrency queue + sync-token callback; admin layout wires role via setContext and filters sidebar menu by SUPER_ADMIN permission.

## What Was Built

After plan 01 fixed the cookie login blocker, this plan adds the two remaining security layers:

1. **Token refresh with concurrency queue** — `apiClient.ts` now intercepts 401 responses. When `isRefreshing=false`, it calls `refreshAccessToken()` which POSTs to `/api/v1/auth/refresh`, stores new tokens in sessionStorage, and fires a fire-and-forget POST to `/api/internal/sync-token` to re-sync the HttpOnly cookie. Any concurrent 401s while a refresh is in flight are queued in `refreshQueue[]` and resolved with the new token once the single refresh completes. If refresh fails, `clearTokens()` is called and `window.location.href = '/login'` redirects the user.

2. **RBAC role propagation** — `(admin)/+layout.svelte` calls `setContext('adminRole', role)` using `data.adminRole` (from SSR `+layout.server.ts`) falling back to `tokenStorage.getAdminRole()` for SPA navigations. The `Toaster` from `svelte-sonner` is mounted once here (not per-page).

3. **RBAC-controlled sidebar** — `AdminLayout.svelte` receives `role` as a prop and uses `$derived` to compute `navItems`. The `/admin-users` (Admins) item is only included when `hasPermission(role, 'SUPER_ADMIN')` returns `true` — it is completely absent from the DOM for VIEWER/SUPPORT/ADMIN roles. Emoji icons replaced with Lucide Svelte components. Logout is a `form method="POST" action="/logout" use:enhance` (not an anchor tag).

## Tasks Completed

| # | Task | Commit | Key Output |
|---|------|--------|-----------|
| 1 | apiClient refresh interceptor (AUTH-03) | 74ef44c | apiClient.ts with isRefreshing, refreshQueue, refreshAccessToken, sync-token call |
| 2 | RBAC wiring — setContext, menu, Toaster (AUTH-05, RBAC-01 to RBAC-04) | fbfa241 | +layout.svelte with setContext+Toaster, AdminLayout.svelte with hasPermission filter, 6 RBAC tests passing |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written with one minor observation:

**Observation: logout route already existed from plan 01**
- Plan 02 specified creating `src/routes/logout/+page.server.ts` and `+page.svelte` (PASSO C)
- Both files were already created in plan 01 with a better implementation (auto-submit on mount)
- No changes made — existing files satisfy all acceptance criteria

## Verification Results

```
npx vitest run --reporter=verbose
Test Files  2 passed | 2 skipped (4)
Tests       9 passed | 28 todo (37)
Duration    2.15s
```

- src/app/services/api/apiClient.ts contains `let isRefreshing = false`: YES (line 17)
- src/app/services/api/apiClient.ts contains `let refreshQueue`: YES (line 18)
- src/app/services/api/apiClient.ts contains `refreshAccessToken`: YES (line 20)
- src/app/services/api/apiClient.ts contains `/api/internal/sync-token`: YES (line 34)
- src/app/services/api/apiClient.ts contains `_isRetry`: YES (line 13)
- src/app/services/api/apiClient.ts contains `window.location.href = '/login'`: YES (line 123)
- src/routes/(admin)/+layout.svelte contains `setContext`: YES
- src/routes/(admin)/+layout.svelte contains `import { Toaster } from 'svelte-sonner'`: YES
- src/routes/(admin)/+layout.svelte contains `<Toaster`: YES
- src/app/shared/widgets/AdminLayout.svelte contains `import { hasPermission`: YES
- src/app/shared/widgets/AdminLayout.svelte contains `hasPermission(role`: YES
- src/app/shared/widgets/AdminLayout.svelte does NOT contain `href="/login"`: CONFIRMED
- src/app/shared/widgets/AdminLayout.svelte contains `import { LogOut } from 'lucide-svelte'`: YES
- src/app/shared/widgets/AdminLayout.svelte contains `min-height: 44px`: YES (lines 67 + 87)
- src/routes/logout/+page.server.ts contains `cookies.delete('access_token'`: YES

## Known Stubs

None — all implementations are complete. The 28 `it.todo()` entries in test files are intentional Wave 0 stubs for future plans that will test integration-level behavior (cookie writing, SSR redirect, etc.).

## Self-Check: PASSED

Files verified:
- src/app/services/api/apiClient.ts: FOUND (modified)
- src/routes/(admin)/+layout.svelte: FOUND (modified)
- src/app/shared/widgets/AdminLayout.svelte: FOUND (modified)
- src/lib/auth/__tests__/auth.test.ts: FOUND (modified)
- src/lib/rbac/__tests__/rbac.test.ts: FOUND (modified)

Commits verified:
- 74ef44c: FOUND (feat(01-02): interceptor de refresh com fila de concorrência no apiClient)
- fbfa241: FOUND (feat(01-02): RBAC wiring — setContext role, menu condicional, Lucide icons, Toaster)
