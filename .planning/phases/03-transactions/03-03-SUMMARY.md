---
phase: 03-transactions
plan: "03"
subsystem: withdrawals
tags: [svelte5, tanstack-table, clean-architecture, pix, withdrawals]

# Dependency graph
requires:
  - phase: 03-transactions/03-01
    provides: "Withdrawal domain entities (Withdrawal.ts, IWithdrawalRepository.ts), MerchantAutocomplete, DateRangePicker, Breadcrumbs, DataTable, StatusBadge with extended statuses"
  - phase: 02-merchants
    provides: "MerchantTransactionsTab.svelte with Ver todas cross-nav link already present"

provides:
  - "WithdrawalRepository: listWithdrawals with merchantId/status filters, getById"
  - "WithdrawalService: passthrough service wrapping WithdrawalRepository"
  - "withdrawalListController: Svelte 5 runes with setMerchant/setStatus/setDateRange/setPage"
  - "WithdrawalsListPage: DataTable 8 columns, 3 filters (merchant/status/period), pagination, merchant links"
  - "withdrawalDetailController: Svelte 5 runes with loadWithdrawal"
  - "WithdrawalDetailPage: 2 stacked cards (Informacoes Gerais + Destinatario), breadcrumbs, loading/error states"
  - "SvelteKit route /transactions/withdrawals/[id]"

affects: [04-disputes-list, 05-fees]

# Tech tracking
tech-stack:
  added: []
  patterns: ["client-side date filter (D-19)", "stacked cards detail layout", "2-card recipient info pattern"]

key-files:
  created:
    - src/app/features/transactions/withdrawals/data/repositories/WithdrawalRepository.ts
    - src/app/features/transactions/withdrawals/services/WithdrawalService.ts
    - src/app/features/transactions/withdrawals/presentation/controllers/withdrawalListController.svelte.ts
    - src/app/features/transactions/withdrawals/presentation/controllers/withdrawalDetailController.svelte.ts
    - src/app/features/transactions/withdrawals/presentation/pages/WithdrawalsListPage.svelte
    - src/app/features/transactions/withdrawals/presentation/pages/WithdrawalDetailPage.svelte
    - src/routes/(admin)/transactions/withdrawals/[id]/+page.svelte
  modified: []

key-decisions:
  - "MerchantTransactionsTab already had Ver todas cross-nav link — no modification needed, cross-nav requirement D-16 satisfied by existing implementation from plan 02-04"
  - "Svelte 5 warning on withdrawalId prop capture in detail controller is expected — controller is created fresh per route mount, static ID is correct"
  - "WithdrawalsListPage reuses exact same CSS class pattern as PaymentsListPage for visual consistency"

# Metrics
duration: ~5min
completed: 2026-04-14
---

# Phase 03 Plan 03: Withdrawals Feature Summary

**Complete withdrawals feature — repository, service, list page with 3 filters, detail page with PIX recipient card, and SvelteKit detail route**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-14T20:46:25Z
- **Completed:** 2026-04-14T20:51:17Z
- **Tasks:** 2/2
- **Files modified:** 7 (7 created, 0 modified)

## Accomplishments

- WithdrawalRepository and WithdrawalService following exact same pattern as PaymentRepository/PaymentService
- withdrawalListController with Svelte 5 runes — merchantId, status, dateStart/dateEnd filters with page reset
- WithdrawalsListPage with 8-column DataTable: ID (truncated, cyan link), Merchant (cyan link to /merchants/{id}), Status (StatusBadge), Valor bruto/Taxa/Liquido (tabular-nums formatCurrency), Chave PIX (12 char truncated), Data
- Filter bar: MerchantAutocomplete + SelectFilter (5 statuses) + DateRangePicker — same layout as payments
- Client-side date filter per D-19 (API doesn't document date range params)
- WithdrawalDetailPage with 2 stacked cards: Informacoes Gerais (status, merchant link, values, dates, failure info) + Destinatario (full PIX key, type, name, document)
- Breadcrumbs: Transacoes > Saques > #[id-truncado]
- Loading skeleton and error states with back-link on both pages
- SvelteKit dynamic route `/transactions/withdrawals/[id]` wired to WithdrawalDetailPage
- MerchantTransactionsTab cross-nav link already satisfied from plan 02-04

## Task Commits

1. **Task 1: Withdrawal repository, service, list controller, and list page** - `f3f4643` (feat)
2. **Task 2: Withdrawal detail controller, page, route** - `90ccf0c` (feat)

## Files Created/Modified

### Created

- `src/app/features/transactions/withdrawals/data/repositories/WithdrawalRepository.ts` - listWithdrawals + getById using API_PATHS.ADMIN_WITHDRAWALS
- `src/app/features/transactions/withdrawals/services/WithdrawalService.ts` - Passthrough service
- `src/app/features/transactions/withdrawals/presentation/controllers/withdrawalListController.svelte.ts` - Svelte 5 $state controller with 3 filter setters
- `src/app/features/transactions/withdrawals/presentation/controllers/withdrawalDetailController.svelte.ts` - Single-entity detail controller
- `src/app/features/transactions/withdrawals/presentation/pages/WithdrawalsListPage.svelte` - Full list page with DataTable + 3 filters
- `src/app/features/transactions/withdrawals/presentation/pages/WithdrawalDetailPage.svelte` - 2-card detail: Informacoes Gerais + Destinatario
- `src/routes/(admin)/transactions/withdrawals/[id]/+page.svelte` - SvelteKit dynamic route

## Requirements Completed

- **TXN-04**: Lista paginada de saques cross-merchant com filtros por merchant e status
- **TXN-05**: Detalhe de saque com chave PIX do recipient, tipo, nome, documento, valores bruto/taxa/liquido

## Deviations from Plan

### No Modifications Needed

**1. [Expected - No Change] MerchantTransactionsTab already had cross-nav link**
- The plan asked to add "Ver todas" link to MerchantTransactionsTab
- Reading the file revealed it already had `href="/transactions/payments?merchantId={merchantId}"` with "Ver todas as transações deste merchant →" from plan 02-04
- No modification needed — D-16 already satisfied
- Acceptance criteria `transactions/payments?merchantId` and `Ver todas` already matched

## Known Stubs

None — all pages fetch from real API endpoints via repository pattern. No hardcoded placeholder data.

## Self-Check

### Files Exist
- src/app/features/transactions/withdrawals/data/repositories/WithdrawalRepository.ts: FOUND
- src/app/features/transactions/withdrawals/services/WithdrawalService.ts: FOUND
- src/app/features/transactions/withdrawals/presentation/controllers/withdrawalListController.svelte.ts: FOUND
- src/app/features/transactions/withdrawals/presentation/controllers/withdrawalDetailController.svelte.ts: FOUND
- src/app/features/transactions/withdrawals/presentation/pages/WithdrawalsListPage.svelte: FOUND
- src/app/features/transactions/withdrawals/presentation/pages/WithdrawalDetailPage.svelte: FOUND
- src/routes/(admin)/transactions/withdrawals/[id]/+page.svelte: FOUND

### Commits Exist
- f3f4643: FOUND
- 90ccf0c: FOUND

## Self-Check: PASSED

---
*Phase: 03-transactions*
*Completed: 2026-04-14*
