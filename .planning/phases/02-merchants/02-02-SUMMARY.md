---
phase: 02-merchants
plan: "02"
subsystem: merchants
tags: [merchant-detail, tabs, lazy-loading, svelte5, shadcn, clean-architecture]
dependency_graph:
  requires:
    - 02-01 (MerchantService, MerchantRepository, domain entities)
  provides:
    - merchantDetailController (hybrid load pattern)
    - MerchantDetailPage (6-tab UI)
    - route /merchants/[id]
  affects:
    - 02-03 (will replace KYC tab stub)
    - 02-04 (will replace Credentials/Transactions tab stubs)
tech_stack:
  added: []
  patterns:
    - Hybrid loading: mount (Info+Balance+Settings) + lazy on-demand (KYC/Credentials/Transactions)
    - Factory controller pattern with $state runes (Svelte 5)
    - shadcn Tabs with onValueChange callback for lazy load trigger
key_files:
  created:
    - src/app/features/merchants/domain/entities/Merchant.ts
    - src/app/features/merchants/domain/repositories/IMerchantRepository.ts
    - src/app/features/merchants/data/repositories/MerchantRepository.ts
    - src/app/features/merchants/services/MerchantService.ts
    - src/app/features/merchants/presentation/controllers/merchantDetailController.svelte.ts
    - src/app/features/merchants/presentation/pages/MerchantDetailPage.svelte
  modified:
    - src/core/constants/apiPaths.ts (added ADMIN_MERCHANT_DOCUMENTS, ADMIN_TENANTS)
    - src/routes/(admin)/merchants/[id]/+page.svelte (wired to MerchantDetailPage)
decisions:
  - "StatusBadge used without type prop — existing component only accepts status string"
  - "Route uses $page.params.id from $app/stores (no page.server.ts needed for params)"
  - "onValueChange on shadcn Tabs proxied to bits-ui Root via ...restProps spread"
metrics:
  duration: "~4 min"
  completed: "2026-03-31T22:24:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 2
---

# Phase 02 Plan 02: Merchant Detail Page Summary

**One-liner:** Página de detalhe do merchant com 6 abas shadcn + controller híbrido (Info/Saldo/Config no mount, KYC/Credenciais/Transações lazy on-demand via factory pattern Svelte 5)

## Tasks Executed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | merchantDetailController com carregamento híbrido | 6b495b0 | 6 created (entities, repo, service, controller) + 1 modified (apiPaths) |
| 2 | MerchantDetailPage com 6 abas + rota | 607043d | 1 created (MerchantDetailPage) + 1 modified (route) |

## What Was Built

### Task 1: Foundation + Controller

Since plan 02-01 prerequisite files had not been created in this worktree (parallel agent environment), all foundation files were created as a Rule 3 auto-fix:

- **`Merchant.ts`**: 14+ types/interfaces — MerchantStatus, VerificationStatus, DocumentType, DocumentStatus, CredentialEnvironment, MerchantListItem, Merchant, MerchantDocument, MerchantCredential, MerchantCredentialCreated, Tenant, PaginatedMerchants, and all payload types
- **`IMerchantRepository.ts`**: 10-method repository contract
- **`MerchantRepository.ts`**: Full HTTP implementation with Either<Failure,T> pattern
- **`MerchantService.ts`**: Service layer with `getPendingKYCCount` helper
- **`merchantDetailController.svelte.ts`**: Factory controller with:
  - Mount load: `loadMerchant()` — populates Info, Saldo, Configurações
  - Lazy loads: `loadKYCTab()`, `loadCredentialsTab()`, `loadTransactionsTab()` — each checks if already loaded (idempotent)
  - Mutations: `updateSettings()`, `updateStatus()`, `updateVerification()`
  - Helper: `refreshCredentials()` — resets and reloads credentials list

### Task 2: MerchantDetailPage + Route

- **`MerchantDetailPage.svelte`**: Full 6-tab page with shadcn Tabs
  - Tab Info: 2-column info grid with all merchant fields + formatters
  - Tab Saldo: 3-card layout for available/pending/reserved with Prisma color coding
  - Tab Configurações: Form with webhookUrl, withdrawalLimit, autoWithdrawal — read-only for non-ADMIN
  - Tab KYC: Skeleton on load, placeholder text once loaded (stub for 02-03)
  - Tab Credenciais: Skeleton on load, placeholder text once loaded (stub for 02-04)
  - Tab Transações: Skeleton on load, count + link to full transactions list (stub for 02-04)
- **Route `/merchants/[id]`**: Uses `$page.params.id` for merchantId, `data.adminRole` for role

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Foundation files from 02-01 not present in worktree**
- **Found during:** Task 1
- **Issue:** Parallel agent worktree did not have domain/data/service files from plan 02-01 which this plan depends on
- **Fix:** Created all prerequisite files (Merchant.ts, IMerchantRepository.ts, MerchantRepository.ts, MerchantService.ts) plus apiPaths additions
- **Files created:** 4 domain/data/service files + 1 apiPaths modification
- **Commit:** 6b495b0

**2. [Rule 1 - Bug] StatusBadge `type` prop does not exist**
- **Found during:** Task 2
- **Issue:** Plan template used `<StatusBadge status={m.status} type="merchant" />` but StatusBadge component only accepts `status: string`
- **Fix:** Removed `type` prop from all StatusBadge usages
- **Files modified:** MerchantDetailPage.svelte
- **Commit:** 607043d

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| KYC tab placeholder | MerchantDetailPage.svelte | Intentional — MerchantKYCTab to be integrated in Plan 02-03 |
| Credentials tab placeholder | MerchantDetailPage.svelte | Intentional — MerchantCredentialsTab to be integrated in Plan 02-04 |
| Transactions tab placeholder | MerchantDetailPage.svelte | Intentional — MerchantTransactionsTab to be integrated in Plan 02-04 |

These stubs are documented and intentional per the plan specification. The controller exposes `updateVerification` and `refreshCredentials` methods ready for integration by downstream plans.

## Self-Check: PASSED

All 6 created files verified on disk. Both commits (6b495b0, 607043d) verified in git log.
