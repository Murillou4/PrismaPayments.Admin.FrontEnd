---
phase: 03-transactions
plan: 01
subsystem: payments
tags: [svelte5, tanstack-table, shadcn, bits-ui, internationalized-date, clean-architecture]

# Dependency graph
requires:
  - phase: 02-merchants
    provides: "MerchantListItem type, MerchantRepository pattern, DataTable/StatusBadge/SelectFilter components"
  - phase: 01-auth-core-infrastructure
    provides: "apiClient, Either<Failure,T>, AdminLayout sidebar, formatters"

provides:
  - "Payment and Withdrawal domain entities (entities, repositories, services)"
  - "PaymentsListPage with 4 filters: MerchantAutocomplete, StatusSelect, MethodSelect, DateRangePicker"
  - "paymentListController with loadPayments/setMerchant/setStatus/setMethod/setDateRange/setPage"
  - "MerchantAutocomplete shared component with debounce 300ms and dropdown search"
  - "DateRangePicker shared component with shadcn Popover + RangeCalendar + preset buttons"
  - "Breadcrumbs shared component for detail pages"
  - "shadcn popover and range-calendar components"
  - "StatusBadge extended with CREATED/PAID/FAILED/PROCESSING/COMPLETED/REQUESTED/CANCELLED/REFUNDED/EXPIRED"
  - "AdminLayout sidebar: collapsible Transacoes submenu with Pagamentos and Saques sub-items"

affects: [03-02-withdrawals-list, 03-03-payment-detail, 04-disputes, 05-fees]

# Tech tracking
tech-stack:
  added: ["@internationalized/date (CalendarDate, today, startOfMonth)", "bits-ui RangeCalendar.Root", "shadcn popover component"]
  patterns: ["client-side date filter (D-19)", "debounced autocomplete with manual dropdown", "collapsible sidebar submenu via $state + $derived"]

key-files:
  created:
    - src/app/features/transactions/payments/domain/entities/Payment.ts
    - src/app/features/transactions/payments/domain/repositories/IPaymentRepository.ts
    - src/app/features/transactions/payments/data/repositories/PaymentRepository.ts
    - src/app/features/transactions/payments/services/PaymentService.ts
    - src/app/features/transactions/payments/presentation/controllers/paymentListController.svelte.ts
    - src/app/features/transactions/payments/presentation/pages/PaymentsListPage.svelte
    - src/app/features/transactions/withdrawals/domain/entities/Withdrawal.ts
    - src/app/features/transactions/withdrawals/domain/repositories/IWithdrawalRepository.ts
    - src/app/features/transactions/shared/components/MerchantAutocomplete.svelte
    - src/app/shared/widgets/Breadcrumbs.svelte
    - src/app/shared/widgets/filters/DateRangePicker.svelte
    - src/lib/components/ui/popover/ (all files)
    - src/lib/components/ui/range-calendar/range-calendar.svelte
    - src/lib/components/ui/range-calendar/index.ts
  modified:
    - src/app/shared/widgets/StatusBadge.svelte
    - src/app/shared/widgets/AdminLayout.svelte

key-decisions:
  - "range-calendar manually created (bits-ui RangeCalendar.Root + Calendar sub-components) because shadcn-svelte interactive install blocked on button overwrite prompt"
  - "MerchantAutocomplete uses custom div dropdown (not shadcn Select) — Select does not support async search"
  - "DateRangePicker date filter applied client-side (D-19) — API does not document startDate/endDate params"
  - "AdminLayout Transacoes submenu uses button element (not anchor) with $state txnOpen — consistent with glow pattern"
  - "CreditCard icon reused for Transacoes parent menu item"

patterns-established:
  - "Debounced async autocomplete: setState + setTimeout(300ms) + apiClient.get on input change"
  - "Client-side date filter: filter payments array in $derived after API response"
  - "Collapsible sidebar submenu: $state open + $derived isTxnActive, auto-expand when active"

requirements-completed: [TXN-01, TXN-02]

# Metrics
duration: 6min
completed: 2026-04-14
---

# Phase 03 Plan 01: Transactions Foundation + Payments List Summary

**Payments list page with MerchantAutocomplete, DateRangePicker, StatusBadge extensions, and collapsible sidebar Transacoes submenu — complete cross-merchant payment visibility**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-14T00:14:26Z
- **Completed:** 2026-04-14T00:20:17Z
- **Tasks:** 2/2
- **Files modified:** 25 (22 created, 3 modified)

## Accomplishments
- Complete Payment and Withdrawal domain layer (entities, interfaces, repositories, services)
- PaymentsListPage with 4 filters: MerchantAutocomplete (debounced search), status select, method select, DateRangePicker with presets
- Merchant column links to /merchants/{id} per TXN-02 cross-navigation requirement
- StatusBadge extended with 9 new payment/withdrawal statuses with correct Prisma color palette
- AdminLayout sidebar collapsible Transacoes submenu with Pagamentos and Saques sub-items, auto-expands when on /transactions/* routes
- Shared components (Breadcrumbs, DateRangePicker, MerchantAutocomplete) ready for plans 02 and 03

## Task Commits

1. **Task 1: Domain entities, shared components, StatusBadge, sidebar** - `99b1820` (feat)
2. **Task 2: Payments list page with controller** - `8e4c9ea` (feat)

## Files Created/Modified
- `src/app/features/transactions/payments/domain/entities/Payment.ts` - Payment, PaginatedPayments, ListPaymentsParams types
- `src/app/features/transactions/payments/domain/repositories/IPaymentRepository.ts` - Repository interface
- `src/app/features/transactions/payments/data/repositories/PaymentRepository.ts` - API calls using API_PATHS.ADMIN_PAYMENTS
- `src/app/features/transactions/payments/services/PaymentService.ts` - Service passthrough
- `src/app/features/transactions/payments/presentation/controllers/paymentListController.svelte.ts` - Svelte 5 runes controller
- `src/app/features/transactions/payments/presentation/pages/PaymentsListPage.svelte` - Full payments list page
- `src/app/features/transactions/withdrawals/domain/entities/Withdrawal.ts` - Withdrawal, PaginatedWithdrawals types
- `src/app/features/transactions/withdrawals/domain/repositories/IWithdrawalRepository.ts` - Interface
- `src/app/features/transactions/shared/components/MerchantAutocomplete.svelte` - Async search dropdown with debounce
- `src/app/shared/widgets/Breadcrumbs.svelte` - Generic breadcrumb component with ChevronRight
- `src/app/shared/widgets/filters/DateRangePicker.svelte` - Popover + RangeCalendar + presets (Hoje/7 dias/30 dias/Este mes)
- `src/lib/components/ui/popover/` - shadcn Popover component (all files)
- `src/lib/components/ui/range-calendar/` - Manual RangeCalendar wrapping bits-ui
- `src/app/shared/widgets/StatusBadge.svelte` - Added CREATED/PAID/FAILED/CANCELLED/REFUNDED/EXPIRED/REQUESTED/PROCESSING/COMPLETED
- `src/app/shared/widgets/AdminLayout.svelte` - Collapsible Transacoes submenu replacing flat Pagamentos/Saques items

## Decisions Made
- `range-calendar` was manually created using `bits-ui`'s `RangeCalendar.Root` instead of the shadcn-svelte CLI because the interactive prompt blocked on the `button` overwrite question and had no non-interactive flag that worked
- `MerchantAutocomplete` uses a custom `<div>` dropdown (not shadcn `Select`) because `Select` does not support async/remote search
- Date filter applied client-side after API response (D-19) — API endpoint does not document date range query params
- `CreditCard` icon reused for the Transacoes parent menu item (same icon as before for Pagamentos flat item)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Manually created range-calendar shadcn component**
- **Found during:** Task 1 (Install shadcn components)
- **Issue:** `npx shadcn-svelte@latest add range-calendar` blocked on interactive prompt asking to overwrite existing `button` component — no non-interactive flag resolved it
- **Fix:** Manually created `src/lib/components/ui/range-calendar/range-calendar.svelte` and `index.ts` using `bits-ui`'s `RangeCalendar.Root` primitive and the existing Calendar sub-components (Cell, Day, Grid, etc.)
- **Files modified:** `src/lib/components/ui/range-calendar/range-calendar.svelte`, `src/lib/components/ui/range-calendar/index.ts`
- **Verification:** TypeScript compiles cleanly; DateRangePicker imports successfully
- **Committed in:** 99b1820 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Functionally equivalent to the shadcn-installed version. No scope creep.

## Issues Encountered
- shadcn-svelte CLI `range-calendar` install blocked on interactive overwrite prompt with no bypass flag available — resolved by manual creation using bits-ui primitives

## Known Stubs
None — PaymentsListPage fetches from real API via PaymentRepository/PaymentService.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 02 (Withdrawals list) can reuse: MerchantAutocomplete, DateRangePicker, SelectFilter, DataTable, StatusBadge
- Plan 03 (Payment detail) can reuse: Breadcrumbs component
- IWithdrawalRepository interface ready for plan 02 to add WithdrawalRepository + WithdrawalService

---
*Phase: 03-transactions*
*Completed: 2026-04-14*
