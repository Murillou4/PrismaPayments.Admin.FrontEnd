---
phase: 04-disputes
plan: 01
subsystem: disputes
tags: [disputes, domain, data, repository, service, controller, list, filter, MED-highlight]
dependency_graph:
  requires: [03-transactions]
  provides: [Dispute entity, IDisputeRepository, DisputeRepository, DisputeService, createDisputeListController, DisputesListPage]
  affects: [DataTable.svelte, StatusBadge.svelte]
tech_stack:
  added: []
  patterns: [Clean Architecture, Either<Failure T>, Svelte 5 $state, createXxxController, dual-shape API response handling]
key_files:
  created:
    - src/app/features/disputes/domain/entities/Dispute.ts
    - src/app/features/disputes/domain/repositories/IDisputeRepository.ts
    - src/app/features/disputes/data/repositories/DisputeRepository.ts
    - src/app/features/disputes/services/DisputeService.ts
    - src/app/features/disputes/presentation/controllers/disputeListController.svelte.ts
    - src/app/features/disputes/presentation/pages/DisputesListPage.svelte
  modified:
    - src/app/shared/widgets/DataTable.svelte
    - src/app/shared/widgets/StatusBadge.svelte
    - src/routes/(admin)/disputes/+page.svelte
decisions:
  - SelectFilter uses placeholder (not label) prop — adapted from reading real component API
  - MerchantAutocomplete uses onChange (not onselect) — confirmed from component interface
  - DisputeRepository uses dual-shape response handling (Array.isArray check) for API flexibility
metrics:
  duration: ~3 min
  completed_date: "2026-04-16"
  tasks: 2/2
  files: 9
requirements:
  - DISP-01
  - DISP-04
---

# Phase 04 Plan 01: Disputes List — Domain + Data + List Page Summary

Disputes Clean Architecture foundation with full working DisputesListPage replacing stub, including MED row highlight and DataTable/StatusBadge shared component extensions.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Domain + Data layer (entities, repository, service, controller) | 8c8b436 | 5 created |
| 2 | DisputesListPage + DataTable rowClass + StatusBadge ACCEPTED | 14af489 | 4 files (1 created, 3 modified) |

## What Was Built

### Task 1: Domain + Data Layer

- **`Dispute.ts`** — entity type with `DisputeType` (MED/CHARGEBACK/REFUND_REQUEST), `DisputeStatus` (OPEN/UNDER_REVIEW/ACCEPTED/REJECTED/RESOLVED), `Dispute`, `PaginatedDisputes`, `ListDisputesParams`, `ResolveDisputePayload`
- **`IDisputeRepository.ts`** — contract with `listDisputes`, `getById`, `resolveDispute`
- **`DisputeRepository.ts`** — concrete implementation with dual-shape response handling (`Array.isArray(raw)` for API flexibility), URLSearchParams for filters, apiClient.get/put
- **`DisputeService.ts`** — thin orchestration layer delegating to repository
- **`disputeListController.svelte.ts`** — `createDisputeListController()` with Svelte 5 `$state`, filter/pagination actions (`setStatus`, `setType`, `setMerchant`, `setPage`)

### Task 2: Presentation Layer

- **`DisputesListPage.svelte`** — full disputes list replacing "Em implementação..." stub with:
  - Filter bar (Status, Tipo selects + MerchantAutocomplete) always visible
  - DataTable with 6 columns (ID truncated, Merchant link, Tipo badge, Status badge, Valor, Data abertura)
  - MED row highlight via `rowClass` prop (`dispute-row--med` class with border-left + pulse animation)
  - Server-side pagination controls
  - Error state with retry button
- **`DataTable.svelte`** — added `rowClass?: (row: Row<T>) => string` prop to Props interface and `class={rowClass?.(row) ?? ''}` on Table.Row
- **`StatusBadge.svelte`** — added `ACCEPTED: { color: '#00E676', ... }` to STATUS_MAP
- **Route `/disputes/+page.svelte`** — updated to import tokenStorage and pass `{role}` prop

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SelectFilter has no `label` prop — plan used incorrect prop name**
- **Found during:** Task 2 svelte-check run
- **Issue:** Plan instructed `label="Status"` and `label="Tipo"` on SelectFilter, but SelectFilter only has `placeholder` prop
- **Fix:** Changed `label` to `placeholder` in both SelectFilter usages in DisputesListPage
- **Files modified:** `src/app/features/disputes/presentation/pages/DisputesListPage.svelte`
- **Commit:** 14af489

**2. [Rule 1 - Bug] MerchantAutocomplete uses `onChange` not `onselect`**
- **Found during:** Task 2 code reading (pre-emptive)
- **Issue:** Plan instructed `onselect={(id) => ctrl.setMerchant(id)}` but real component API uses `onChange`
- **Fix:** Used `onChange={(id) => ctrl.setMerchant(id)}` in DisputesListPage
- **Files modified:** `src/app/features/disputes/presentation/pages/DisputesListPage.svelte`
- **Commit:** 14af489

## Known Stubs

None. The DisputesListPage makes real API calls via `DisputeRepository → apiClient → GET /api/v1/admin/disputes`. The list renders real data (empty state if no disputes), loading skeleton during fetch, and error state on failure. No hardcoded placeholder data.

## TypeScript Check

Pre-existing errors (pre-existing from prior phases, out of scope): 13 errors in unrelated files.
New errors introduced by this plan: 0.
Disputes feature files: clean.

## Self-Check: PASSED

Files exist check:
- FOUND: src/app/features/disputes/domain/entities/Dispute.ts
- FOUND: src/app/features/disputes/domain/repositories/IDisputeRepository.ts
- FOUND: src/app/features/disputes/data/repositories/DisputeRepository.ts
- FOUND: src/app/features/disputes/services/DisputeService.ts
- FOUND: src/app/features/disputes/presentation/controllers/disputeListController.svelte.ts
- FOUND: src/app/features/disputes/presentation/pages/DisputesListPage.svelte

Commits exist check:
- FOUND: 8c8b436 (Task 1)
- FOUND: 14af489 (Task 2)
