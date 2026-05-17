---
phase: 02-merchants
plan: "01"
subsystem: merchants
tags: [merchants, domain, repository, service, controller, list, sidebar]
dependency_graph:
  requires:
    - src/core/constants/apiPaths.ts
    - src/appmod/services/api/apiClient.ts
    - src/app/shared/widgets/DataTable.svelte
    - src/app/shared/widgets/StatusBadge.svelte
    - src/app/shared/widgets/filters/SearchInput.svelte
    - src/app/shared/widgets/filters/SelectFilter.svelte
  provides:
    - Merchant domain entities e tipos
    - IMerchantRepository contrato
    - MerchantRepository implementação HTTP
    - MerchantService com getPendingKYCCount
    - merchantListController (estado reativo da lista)
    - MerchantsListPage (página de lista com tabs e filtros)
    - Rota /merchants funcional
    - Sheet shadcn instalado
  affects:
    - src/app/shared/widgets/AdminLayout.svelte (badge Verificações Pendentes)
    - src/routes/(admin)/merchants/+page.svelte
tech_stack:
  added:
    - shadcn-svelte Sheet component
  patterns:
    - Either<Failure, T> para error handling em todo o repository
    - Controller pattern com $state para estado reativo (Svelte 5)
    - Server-side pagination com tabs de contagem paralela
key_files:
  created:
    - src/app/features/merchants/domain/entities/Merchant.ts
    - src/app/features/merchants/domain/repositories/IMerchantRepository.ts
    - src/app/features/merchants/data/repositories/MerchantRepository.ts
    - src/app/features/merchants/services/MerchantService.ts
    - src/app/features/merchants/presentation/controllers/merchantListController.svelte.ts
    - src/app/features/merchants/presentation/pages/MerchantsListPage.svelte
    - src/lib/components/ui/sheet/ (11 arquivos)
  modified:
    - src/core/constants/apiPaths.ts (ADMIN_MERCHANT_DOCUMENTS + ADMIN_TENANTS adicionados)
    - src/app/shared/widgets/AdminLayout.svelte (badge Verificações Pendentes)
    - src/routes/(admin)/merchants/+page.svelte (importa MerchantsListPage com role)
decisions:
  - DataTable usa ColumnDef<T> do @tanstack/table-core e cellSnippet — adaptado do plano original
  - SearchInput usa prop onSearch (não onchange) — corrigido conforme API real
  - SelectFilter usa prop onChange (não onchange) — corrigido conforme API real
  - Route passa data.adminRole (do layout server) ao invés de data.role inexistente
  - AdminLayout badge usa fetch direto sem apiClient para evitar dependência circular no layout
  - loadCounts() faz 4 requests paralelos com Promise.all para carregar contagens por tab
metrics:
  duration: "~4 min"
  completed_date: "2026-03-31"
  tasks: 4/4
  files: 9 criados + 3 modificados
requirements:
  - MERCH-01
  - MERCH-02
  - MERCH-09
---

# Phase 02 Plan 01: Merchants Foundation + Lista Summary

**One-liner:** Fundação completa da feature merchants (domain → data → service → controller → page) com lista paginada, tabs de status com contagens, filtros e sidebar badge de KYC pendente.

## Tasks Completed

| Task | Name | Commit |
|------|------|--------|
| 1 | Sheet shadcn + apiPaths ADMIN_MERCHANT_DOCUMENTS/ADMIN_TENANTS | 44a5f31 |
| 2 | Domain entities (21 tipos) + IMerchantRepository (10 métodos) | e6c7f8f |
| 3 | MerchantRepository HTTP + MerchantService com getPendingKYCCount | 5621c03 |
| 4 | merchantListController + MerchantsListPage + AdminLayout badge + rota | 0f14076 |

## What Was Built

**Camada Domain:**
- `Merchant.ts`: 21 tipos e interfaces (MerchantStatus, VerificationStatus, MerchantListItem, Merchant, MerchantDocument, MerchantCredential, Tenant, PaginatedMerchants, e todos os payloads de mutação)
- `IMerchantRepository.ts`: contrato com 10 métodos (listMerchants, getById, create, updateStatus, updateVerification, updateSettings, getDocuments, getCredentials, createCredential, listTenants)

**Camada Data:**
- `MerchantRepository.ts`: implementação HTTP completa com padrão try/catch left/right idêntico ao DashboardRepository

**Camada Service:**
- `MerchantService.ts`: thin wrapper + `getPendingKYCCount()` que extrai o `total` de uma query paginada com limit=1

**Camada Presentation:**
- `merchantListController.svelte.ts`: estado reativo com `$state`, carregamento paralelo de contagens por tab, funções setStatus/setVerification/setSearch/setPage
- `MerchantsListPage.svelte`: tabs de status (5 opções) com contagem, filtros SearchInput + SelectFilter, DataTable com StatusBadge via cellSnippet, paginação server-side, animação de entrada

**Sidebar:**
- `AdminLayout.svelte`: item "Verificações Pendentes" com ícone ScanFace, badge cyan que carrega no onMount via fetch direto

**Rota:**
- `/merchants/+page.svelte`: importa MerchantsListPage e passa `data.adminRole` do layout

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] API incorreta de SearchInput e SelectFilter**
- **Found during:** Task 4
- **Issue:** O plano usava `onchange` para ambos os filtros, mas a implementação real usa `onSearch` (SearchInput) e `onChange` (SelectFilter)
- **Fix:** Corrigido para usar as props reais de cada componente
- **Files modified:** MerchantsListPage.svelte
- **Commit:** 0f14076

**2. [Rule 1 - Bug] DataTable API incorreta**
- **Found during:** Task 4
- **Issue:** O plano usava `columns={[{key, header}]}`, `rows={...}`, e `onRowClick` mas a implementação real usa `ColumnDef<T>[]`, `data`, e `cellSnippet`
- **Fix:** Adaptado para usar a API real do DataTable com `ColumnDef<T>` do @tanstack/table-core e `cellSnippet`
- **Files modified:** MerchantsListPage.svelte
- **Commit:** 0f14076

**3. [Rule 1 - Bug] data.role inexistente na rota**
- **Found during:** Task 4
- **Issue:** O plano sugeria `data.role ?? null` mas o layout server exporta `adminRole` não `role`
- **Fix:** Corrigido para `data.adminRole ?? null` — padrão consistente com o layout
- **Files modified:** routes/(admin)/merchants/+page.svelte
- **Commit:** 0f14076

## Known Stubs

- `MerchantsListPage.svelte`: botão "Novo Merchant" renderiza mas não abre sheet (CreateMerchantSheet comentado no plano, implementado no 02-04)
- `loadCounts()`: faz requests reais à API mas UI de tabs mostrará 0 enquanto API não retornar dados (comportamento correto — não é stub, é estado inicial válido)

## Self-Check: PASSED

All 7 created files exist on disk. All 4 task commits found in git log.
