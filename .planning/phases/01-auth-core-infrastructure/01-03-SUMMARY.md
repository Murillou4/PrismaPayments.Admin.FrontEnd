---
phase: 01-auth-core-infrastructure
plan: 03
subsystem: shared-components
tags: [svelte5, components, routing, error-boundary, statusbadge, confirmdialog, vitest]
dependency_graph:
  requires:
    - 01-01 (vitest configured, $appmod alias, formatters.ts)
    - 01-02 (admin layout, svelte-sonner installed)
  provides:
    - Server-side redirect from / to /dashboard (no meta refresh flash)
    - Global error boundary +error.svelte with PT-BR copy
    - StatusBadge component with complete 15-status color map
    - ConfirmDialog component with native <dialog> and requiresReason prop
    - 3 passing formatCurrency unit tests (INFRA-08)
  affects:
    - src/routes/ (page.server.ts + page.svelte + error.svelte)
    - src/app/shared/widgets/ (StatusBadge, ConfirmDialog — used by Phase 2+ features)
tech_stack:
  added: []
  patterns:
    - SvelteKit +page.server.ts redirect(302) pattern for root route
    - Svelte 5 $props() + $derived() + $effect() + $state() in components
    - Native <dialog> element with $effect showModal/close control
    - CSS @keyframes animation for pulsing time-sensitive indicators (MED status)
    - Inline style props for dynamic color values in Svelte components
key_files:
  created:
    - src/routes/+page.server.ts
    - src/routes/+error.svelte
    - src/app/shared/widgets/StatusBadge.svelte
    - src/app/shared/widgets/ConfirmDialog.svelte
  modified:
    - src/routes/+page.svelte (removed meta refresh)
    - src/lib/components/__tests__/components.test.ts (added 3 passing formatCurrency tests)
decisions:
  - "Native <dialog> element used for ConfirmDialog (no external modal library needed — browser-native Escape handling, backdrop, focus trap)"
  - "Inline style props used for StatusBadge dynamic colors (avoids dynamic class generation; Svelte scoped CSS doesn't support runtime values)"
  - "$effect for dialog showModal/close ensures correct lifecycle coordination with Svelte 5 reactivity"
  - "formatCurrency tests use $appmod alias directly (confirmed working via sveltekit vite plugin in vitest)"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 2
---

# Phase 1 Plan 03: Redirect + Error Boundary + Shared Components Summary

**One-liner:** Server-side redirect from / to /dashboard, global +error.svelte error boundary, StatusBadge with 15-status color map, ConfirmDialog with native dialog and requiresReason prop, 3 formatCurrency tests passing.

## What Was Built

Phase 2+ features require shared components and correct routing infrastructure. This plan delivers:

1. **Root redirect without flash**: `+page.server.ts` throws `redirect(302, '/dashboard')` server-side, eliminating the previous meta-refresh HTML that caused a visible flash before navigation. The `+page.svelte` is now just a comment.

2. **Global error boundary**: `+error.svelte` displays a full-page card with the HTTP status code in Space Grotesk danger red, "Algo deu errado" heading, the error message from `$page.error.message`, and a ghost "Voltar" button. Follows the UI-SPEC design tokens (color-background, color-surface, color-danger, shadow-lg, radius-2xl).

3. **StatusBadge**: Svelte 5 component with complete 15-status mapping (ACTIVE/APPROVED/RESOLVED → green #00E676; PENDING/PENDING_REVIEW/OPEN/UNDER_REVIEW/REFUND_REQUEST/CHARGEBACK → amber #FFB300; SUSPENDED/REJECTED/BLOCKED → danger #FF3B5C; INACTIVE/UNVERIFIED → muted #9090A8; MED → danger with pulsing left border animation). Accepts lowercase input via `status.toUpperCase()`. Unknown statuses fall back to muted color.

4. **ConfirmDialog**: Native `<dialog>` element controlled via `$effect` with `showModal()`/`close()`. `requiresReason` prop shows a labeled textarea and disables the confirm button until text is entered. `destructive` prop changes button styling to red. Escape closes natively. Backdrop at `rgba(0, 0, 0, 0.70)`.

5. **formatCurrency verified (INFRA-08)**: 3 unit tests confirm `formatCurrency(1000)` returns string containing "R$" and "10", zero returns "R$" and "0", 100000 returns "1" and "000" — all passing green.

## Tasks Completed

| # | Task | Commit | Key Output |
|---|------|--------|-----------|
| 1 | Redirect de / e error boundary +error.svelte | 9aff2ed | +page.server.ts redirect(302), +page.svelte cleaned, +error.svelte with full PT-BR error UI |
| 2 (test) | TDD RED: formatCurrency tests + component stubs | 6803103 | components.test.ts with 3 passing formatCurrency tests and todos for INFRA-03/04/05/06/07 |
| 2 (impl) | StatusBadge e ConfirmDialog components | b08c743 | StatusBadge.svelte 15-status map, ConfirmDialog.svelte native dialog with requiresReason |

## Deviations from Plan

None — plan executed exactly as written.

The `$appmod` alias resolved correctly in vitest (confirmed working via sveltekit plugin integration), consistent with the decision from plan 01-01.

## Verification Results

```
npx vitest run --reporter=verbose
Test Files  3 passed | 1 skipped (4)
Tests       12 passed | 27 todo (39)
Duration    2.04s
```

Skipped file: `src/routes/(admin)/dashboard/__tests__/dashboard.test.ts` — pre-existing skip from plan 01 Wave 0 stubs (expected).

Additional verifications:
- `grep "redirect(302" src/routes/+page.server.ts` → FOUND
- `grep "STATUS_MAP" src/app/shared/widgets/StatusBadge.svelte` → FOUND (15 entries)
- `grep "showModal" src/app/shared/widgets/ConfirmDialog.svelte` → FOUND
- `grep "meta http-equiv" src/routes/+page.svelte` → 0 (removed)

## Known Stubs

None — all files implement real logic. The `it.todo()` entries in components.test.ts are intentional Wave 0 stubs for StatusBadge/ConfirmDialog/Toast/error-boundary UI tests that require testing-library/svelte DOM rendering (deferred to a future test-focused plan or implemented alongside Phase 2 features).

## Self-Check: PASSED

Files verified:
- src/routes/+page.server.ts: FOUND
- src/routes/+error.svelte: FOUND
- src/app/shared/widgets/StatusBadge.svelte: FOUND
- src/app/shared/widgets/ConfirmDialog.svelte: FOUND
- src/lib/components/__tests__/components.test.ts: FOUND (modified)

Commits verified:
- 9aff2ed: FOUND (feat(01-03): redirect de / e error boundary)
- 6803103: FOUND (test(01-03): add formatCurrency tests)
- b08c743: FOUND (feat(01-03): StatusBadge e ConfirmDialog)
