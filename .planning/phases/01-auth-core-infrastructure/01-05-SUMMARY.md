---
phase: 01-auth-core-infrastructure
plan: 05
subsystem: dashboard
tags: [dashboard, chart, alerts, svelte5-chartjs, DASH-02, DASH-03]
dependency_graph:
  requires: [01-01, 01-04]
  provides: [DASH-02, DASH-03]
  affects: [dashboard-feature]
tech_stack:
  added: [svelte5-chartjs, chart.js]
  patterns: [reactive-period-tabs, dual-y-axis-chart, conditional-alert-cards]
key_files:
  created:
    - src/app/features/dashboard/domain/entities/DashboardSeries.ts
  modified:
    - src/app/features/dashboard/domain/entities/AdminMetrics.ts
    - src/app/features/dashboard/data/repositories/DashboardRepository.ts
    - src/app/features/dashboard/services/DashboardService.ts
    - src/core/constants/apiPaths.ts
    - src/app/features/dashboard/presentation/pages/DashboardPage.svelte
decisions:
  - "$effect for getChartData re-fetch on period change — reactive to activePeriod state without onMount complexity"
  - "Dual y-axis chart (y left for volume in R$, yTransactions right for count) — different units require separate scales"
  - "DASHBOARD_ADMIN_SERIES as function (period: string) => string — consistent with other parameterized paths in apiPaths.ts"
metrics:
  duration: "~2 min"
  completed_date: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 5
---

# Phase 01 Plan 05: Dashboard Gap Closure (DASH-02 + DASH-03) Summary

**One-liner:** Bar chart with period tabs via svelte5-chartjs and conditional alert cards for open disputes and pending KYC integrated into DashboardPage.svelte.

## What Was Built

Closed the two remaining dashboard gaps from Phase 1 that had been identified but not implemented in plans 01-04:

**DASH-02 — Volume/Transactions Chart with Period Tabs:**
- DashboardPage.svelte now renders a bar chart below metric cards using the `Bar` component from `svelte5-chartjs`
- Chart.js components (CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend) registered at script-top
- 4 period tabs: Hoje / Esta semana / Este mês / Este ano — pill-styled with active/inactive/hover states
- Switching tabs triggers `$effect` that calls `service.getChartData(activePeriod)` and updates chart
- Dual y-axes: left for volume (R$), right for transaction count (different units)
- Datasets styled with cyan (#01FAFB) for volume and magenta (#FF00FF) for transactions, matching UI-SPEC

**DASH-03 — Alert Cards for Disputes and KYC:**
- Alert cards rendered above metric cards, conditionally shown only when `openDisputes > 0` or `pendingKycCount > 0`
- Disputes card: danger theme (rgba(255,59,92,...)), Lucide AlertTriangle icon, navigates to `/disputes`
- KYC card: warning theme (rgba(255,179,0,...)), Lucide Clock icon, navigates to `/merchants?verification=PENDING_REVIEW`
- Both cards use hover effects for visual feedback

**Data Layer:**
- `AdminMetrics` interface extended with `openDisputes: number` and `pendingKycCount: number`
- New `DashboardSeries.ts` entity with `DashboardPeriod`, `DashboardSeriesPoint`, `DashboardChartData` types
- `DASHBOARD_ADMIN_SERIES` path function added to `apiPaths.ts`
- `getChartData(period)` added to both `DashboardRepository` and `DashboardService`

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend domain and data layer | 32642c6 | AdminMetrics.ts, DashboardSeries.ts, DashboardRepository.ts, DashboardService.ts, apiPaths.ts |
| 2 | Alert cards and bar chart in DashboardPage.svelte | 05dd4c9 | DashboardPage.svelte |

## Decisions Made

1. **`$effect` for chart data re-fetch** — Captures `activePeriod` as a local variable inside the effect body to satisfy Svelte 5 reactivity tracking. Simpler than setting up a separate `onMount` + `watch` pattern.

2. **Dual y-axis chart** — Volume is in centavos (converted to R$) while transactions is a raw count. Without separate y-axes the chart would be unreadable since volumes can be orders of magnitude larger.

3. **`DASHBOARD_ADMIN_SERIES` as function** — Pattern is consistent with other parameterized paths already in `apiPaths.ts` (e.g., `ADMIN_USER`, `ADMIN_MERCHANT`). Query param approach `?period=` matches the API contract from the plan.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — the chart data and alert counts are wired to live API calls via `getChartData(period)` and `getMetrics()`. The backend may return empty arrays or zero counts but that is handled with proper empty-state rendering ("Sem dados para o período selecionado.").

## Verification Results

- `npx tsc --noEmit`: Only pre-existing errors in unrelated files (`sync-token/+server.ts`, `login/+page.server.ts` — `process` not typed). Zero errors in all files modified by this plan.
- `npx vitest run`: 12/12 tests passed, 1 file skipped, no regressions.
- All acceptance criteria met: AdminMetrics has alert fields, DashboardSeries.ts exports all 3 types, DashboardPage.svelte contains all required imports/patterns/labels.

## Self-Check: PASSED

- [x] `src/app/features/dashboard/domain/entities/AdminMetrics.ts` — exists, contains `openDisputes`
- [x] `src/app/features/dashboard/domain/entities/DashboardSeries.ts` — created, exports DashboardPeriod/SeriesPoint/ChartData
- [x] `src/app/features/dashboard/data/repositories/DashboardRepository.ts` — contains `getChartData`
- [x] `src/app/features/dashboard/services/DashboardService.ts` — contains `getChartData`
- [x] `src/core/constants/apiPaths.ts` — contains `DASHBOARD_ADMIN_SERIES`
- [x] `src/app/features/dashboard/presentation/pages/DashboardPage.svelte` — contains Bar import, ChartJS.register, alert cards, period tabs
- [x] Commit 32642c6 — Task 1
- [x] Commit 05dd4c9 — Task 2
