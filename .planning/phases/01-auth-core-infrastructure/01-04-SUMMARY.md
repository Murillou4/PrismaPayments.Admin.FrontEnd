---
phase: 01-auth-core-infrastructure
plan: 04
subsystem: shared-ui
tags: [datatable, pagination, filters, tanstack, svelte5, components]
dependency_graph:
  requires:
    - 01-01 (vitest configured, @tanstack/table-core installed)
  provides:
    - DataTable<T> generic paginated table via @tanstack/table-core
    - Pagination sub-component with prev/next controls
    - SearchInput filter with debounce and icon inset
    - SelectFilter dropdown with cyan checkmark
    - DateRangeFilter with dual date inputs
  affects:
    - src/app/shared/widgets/ (new DataTable + Pagination)
    - src/app/shared/widgets/filters/ (new SearchInput, SelectFilter, DateRangeFilter)
    - All Phase 2+ feature lists (merchants, transactions, disputes, fees, audit, diagnostics)
tech_stack:
  added: []
  patterns:
    - "@tanstack/table-core createTable with $derived for Svelte 5 reactivity"
    - "$state for sorting and currentPage, client-side slice for pagination"
    - "Inline style CSS custom properties for design token usage"
    - "Debounce pattern with clearTimeout/setTimeout in SearchInput"
    - "Outside-click overlay (z-index 49) for SelectFilter dropdown dismissal"
key_files:
  created:
    - src/app/shared/widgets/DataTable.svelte
    - src/app/shared/widgets/Pagination.svelte
    - src/app/shared/widgets/filters/SearchInput.svelte
    - src/app/shared/widgets/filters/SelectFilter.svelte
    - src/app/shared/widgets/filters/DateRangeFilter.svelte
  modified:
    - src/lib/components/__tests__/components.test.ts
decisions:
  - "createTable wrapped in $derived (not $state) so it reacts to data/sorting changes automatically"
  - "Client-side pagination via row slice (not tanstack getPaginationRowModel) for simpler page reset logic"
  - "Outside-click overlay on SelectFilter uses z-index 49 (below dropdown z-50) fixed overlay pattern"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 1
---

# Phase 1 Plan 04: DataTable + Filter Primitives Summary

**One-liner:** Generic DataTable<T> with @tanstack/table-core sorting and client-side pagination, plus SearchInput (debounce), SelectFilter (dropdown), and DateRangeFilter — reusable building blocks for all Phase 2+ feature lists.

## What Was Built

Five shared UI components that every feature list in Phase 2+ will consume:

1. **DataTable.svelte** — Generic table with `ColumnDef<T>[]` + `data: T[]` props, sorting via TanStack sort state, client-side pagination (default 20 items/page), empty state ("Nenhum resultado"), skeleton loading rows (pulsing animation), and `{#snippet cellSnippet}` for custom cell rendering. Uses `font-variant-numeric: tabular-nums` on data cells and `transition: background 0.15s` (not `transition: all`) on hover rows per UI spec.

2. **Pagination.svelte** — Standalone sub-component with prev/next buttons (min-height 44px), page indicator with `font-variant-numeric: tabular-nums`, and disabled states when at first/last page.

3. **SearchInput.svelte** — Text search input with Lucide Search icon (16px, left-inset via `position: absolute; left: 12px`), 300ms debounce (configurable via `debounceMs` prop), magenta focus ring (`box-shadow: 0 0 0 2px #FF00FF`), min-height 44px.

4. **SelectFilter.svelte** — Dropdown filter with Lucide Check icon (cyan `#01FAFB`) on selected item, "Todos" clear option when a value is selected, outside-click dismissal via fixed overlay, and hover backgrounds via `onmouseenter`/`onmouseleave`.

5. **DateRangeFilter.svelte** — Two `type="date"` inputs with Lucide Calendar icon inset, firing `onChange({ from, to })` on each change, magenta focus ring, min-height 44px.

## Tasks Completed

| # | Task | Commit | Key Output |
|---|------|--------|-----------|
| 1 (RED) | Test stubs INFRA-01 | 11cf6ac | 5 it.todo() stubs in components.test.ts |
| 1 (GREEN) | DataTable + Pagination (INFRA-01) | 3ea4388 | DataTable.svelte, Pagination.svelte |
| 2 | Filter primitives (INFRA-02) | d915a31 | SearchInput.svelte, SelectFilter.svelte, DateRangeFilter.svelte |

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

```
npx vitest run --reporter=verbose
Test Files  3 passed | 1 skipped (4)
Tests       12 passed | 32 todo (44)
Duration    1.90s
```

- DataTable.svelte imports `@tanstack/table-core`: YES
- DataTable.svelte contains `createTable`: YES
- DataTable.svelte contains `getCoreRowModel`: YES
- DataTable.svelte contains `Nenhum resultado`: YES
- DataTable.svelte contains `skeleton-pulse`: YES
- DataTable.svelte contains `font-variant-numeric: tabular-nums`: YES
- DataTable.svelte contains `transition: background 0.15s`: YES
- Pagination.svelte contains `onPageChange`: YES
- Pagination.svelte contains `min-height: 44px`: YES
- SearchInput.svelte with Search icon import: YES
- SearchInput.svelte with `position: absolute` icon inset: YES
- SearchInput.svelte with `debounceMs` prop and `clearTimeout`: YES
- SearchInput.svelte `min-height: 44px`: YES
- SelectFilter.svelte with Check icon import: YES
- SelectFilter.svelte with `color: var(--color-info, #01FAFB)`: YES
- DateRangeFilter.svelte with two `type="date"` inputs: YES
- DateRangeFilter.svelte with Calendar icon: YES

## Known Stubs

None — all components implement real logic. The DataTable INFRA-01 test todos are intentional `it.todo()` stubs; the components themselves are fully functional.

## Self-Check: PASSED

Files verified:
- src/app/shared/widgets/DataTable.svelte: FOUND
- src/app/shared/widgets/Pagination.svelte: FOUND
- src/app/shared/widgets/filters/SearchInput.svelte: FOUND
- src/app/shared/widgets/filters/SelectFilter.svelte: FOUND
- src/app/shared/widgets/filters/DateRangeFilter.svelte: FOUND

Commits verified:
- 11cf6ac: FOUND (test(01-04): add failing test stubs)
- 3ea4388: FOUND (feat(01-04): DataTable + Pagination)
- d915a31: FOUND (feat(01-04): filter primitives)
