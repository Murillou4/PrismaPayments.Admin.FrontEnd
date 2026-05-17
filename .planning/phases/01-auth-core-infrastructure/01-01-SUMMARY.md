---
phase: 01-auth-core-infrastructure
plan: 01
subsystem: auth
tags: [auth, cookies, sveltekit, vitest, jwt, form-action]
dependency_graph:
  requires: []
  provides:
    - HttpOnly cookie login via SvelteKit form action
    - SSR token guard via hooks.server.ts locals injection
    - jwt-decode integration replacing atob hack
    - vitest configured with jsdom environment
    - Wave 0 test stubs for all Phase 1 requirements
  affects:
    - src/hooks.server.ts (all SSR routes now see event.locals.accessToken)
    - src/routes/(admin)/** (layout server exposes adminRole)
tech_stack:
  added:
    - jwt-decode@4.0.0
    - svelte-sonner@1.1.0
    - bits-ui@2.16.3
    - "@tanstack/table-core@8.21.3"
    - chart.js@4.5.1
    - svelte5-chartjs@1.0.0
    - "@internationalized/date@3.12.0"
    - vitest@2.1.9
    - "@vitest/coverage-v8@2.1.9"
    - "@testing-library/svelte"
    - jsdom
  patterns:
    - SvelteKit form actions for server-side cookie writing
    - use:enhance progressive enhancement pattern
    - Dual-layer token storage (HttpOnly cookie SSR + sessionStorage client)
    - jwtDecode for JWT payload extraction
key_files:
  created:
    - src/routes/login/+page.server.ts
    - src/routes/api/internal/sync-token/+server.ts
    - src/routes/logout/+page.server.ts
    - src/routes/logout/+page.svelte
    - src/routes/(admin)/+layout.server.ts
    - src/app.d.ts
    - vitest.config.ts
    - src/lib/auth/__tests__/auth.test.ts
    - src/lib/rbac/__tests__/rbac.test.ts
    - src/lib/components/__tests__/components.test.ts
    - src/routes/(admin)/dashboard/__tests__/dashboard.test.ts
  modified:
    - src/hooks.server.ts
    - src/app/features/auth/presentation/pages/LoginPage.svelte
    - src/routes/login/+page.svelte
    - src/app/services/storage/tokenStorage.ts
    - src/app/shared/widgets/AdminLayout.svelte
    - package.json
decisions:
  - "Logout via form POST to /login?/logout action (keeps logout cookie-clearing server-side)"
  - "tokenStorage imported via relative path in vitest tests (alias not resolved by vitest without extra config)"
  - "jsdom installed as devDep to resolve vitest environment dependency"
metrics:
  duration_minutes: 5
  completed_date: "2026-03-25"
  tasks_completed: 3
  tasks_total: 3
  files_created: 11
  files_modified: 6
---

# Phase 1 Plan 01: Auth Core Infrastructure — Cookie HttpOnly + SSR Guards Summary

**One-liner:** SvelteKit form action login writes HttpOnly cookies server-side, hooks.server.ts injects JWT locals, vitest configured with Wave 0 stubs across 4 test files.

## What Was Built

The critical auth blocker is resolved. Before this plan, `AuthService` saved tokens only to `sessionStorage` — `hooks.server.ts` checked for a cookie that was never written, causing every post-login navigation to redirect back to `/login`.

After this plan:
1. Login submits via SvelteKit `form action` — the server writes `access_token` and `refresh_token` as `HttpOnly` cookies, then returns the tokens in the response for the `use:enhance` callback to also save to `sessionStorage` before navigating to `/dashboard`.
2. `hooks.server.ts` reads the cookie on every SSR request, injects `event.locals.accessToken` and decodes role via `jwtDecode` into `event.locals.adminRole`.
3. `(admin)/+layout.server.ts` exposes `adminRole` via `data` to all admin pages.
4. Logout form action deletes both cookies server-side and redirects to `/login`.
5. `sync-token` endpoint allows client-side refresh cycles to re-sync the cookie after obtaining a new access token.
6. `tokenStorage.ts` now uses `jwt-decode` v4 instead of the fragile `atob` hack.

## Tasks Completed

| # | Task | Commit | Key Output |
|---|------|--------|-----------|
| 1 | Install deps + vitest + Wave 0 stubs | 275c46c | vitest.config.ts, 4 test stub files, 38 todos passing |
| 2 | Form action login + sync-token + logout | 6f92859 | +page.server.ts, LoginPage.svelte with use:enhance, sync-token endpoint, logout route |
| 3 | hooks.server.ts locals + layout.server.ts | 9db93aa | app.d.ts, updated hooks.server.ts, (admin)/+layout.server.ts, tokenStorage with jwt-decode |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] jsdom not installed for vitest jsdom environment**
- **Found during:** Task 1 verification
- **Issue:** vitest config set `environment: 'jsdom'` but jsdom package was not installed, causing 4 unhandled errors and test runner failure
- **Fix:** `npm install -D jsdom`
- **Files modified:** package.json, package-lock.json
- **Commit:** 275c46c

**2. [Rule 3 - Blocking] vitest could not pin @vitest/coverage-v8 to version 2.x**
- **Found during:** Task 1 install
- **Issue:** `npm install @vitest/coverage-v8` resolved to v4.1.1 which has a peer dep conflict with vitest@2.1.9
- **Fix:** Pinned `@vitest/coverage-v8@2.1.9` to match vitest version
- **Files modified:** package.json
- **Commit:** 275c46c

**3. [Rule 1 - Bug] tokenStorage tests used require() with wrong relative path**
- **Found during:** Task 2 test verification
- **Issue:** Plan suggested `require('../../app/services/storage/tokenStorage')` but path from `src/lib/auth/__tests__/` to `src/app/` requires `../../../app/...` and vitest ESM doesn't support require() for aliases
- **Fix:** Changed to ES `import` with correct relative path `../../../app/services/storage/tokenStorage`
- **Files modified:** src/lib/auth/__tests__/auth.test.ts
- **Commit:** 6f92859

## Verification Results

```
npx vitest run --reporter=verbose
Test Files  1 passed | 3 skipped (4)
Tests       2 passed | 36 todo (38)
Duration    2.08s
```

- `src/routes/login/+page.server.ts` contains `cookies.set('access_token'`: YES
- `src/routes/login/+page.server.ts` contains `cookies.delete('access_token'`: YES
- `src/routes/api/internal/sync-token/+server.ts` contains `export const POST`: YES
- `src/hooks.server.ts` contains `event.locals.accessToken`: YES
- `src/routes/(admin)/+layout.server.ts` contains `export const load`: YES
- jwt-decode in node_modules: YES
- svelte-sonner in node_modules: YES

## Known Stubs

None — all files created/modified implement real logic. Wave 0 test stubs are intentional `it.todo()` entries that will be implemented in their respective plans.

## Self-Check: PASSED

Files verified:
- src/routes/login/+page.server.ts: FOUND
- src/routes/api/internal/sync-token/+server.ts: FOUND
- src/hooks.server.ts: FOUND (updated)
- src/routes/(admin)/+layout.server.ts: FOUND
- src/app.d.ts: FOUND
- vitest.config.ts: FOUND

Commits verified:
- 275c46c: FOUND (chore(01-01): install Phase 1 deps)
- 6f92859: FOUND (feat(01-01): form action login)
- 9db93aa: FOUND (feat(01-01): hooks.server.ts locals)
