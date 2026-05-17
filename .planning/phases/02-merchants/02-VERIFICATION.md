---
phase: 02-merchants
verified: 2026-04-01T00:00:00Z
status: passed
score: 9/9 requirements verified
re_verification: false
gaps: []
human_verification:
  - test: "Abrir /merchants e verificar que as tabs de status exibem contagens corretas"
    expected: "Cada tab (Pendente, Ativo, Suspenso, Bloqueado) mostra o total correto vindo do backend"
    why_human: "loadCounts() faz 4 requests paralelos — só verificável com API ativa"
  - test: "Abrir detalhe de merchant com documentos KYC enviados e testar preview de PDF"
    expected: "Preview inline renderiza a primeira página do PDF via pdfjs-dist"
    why_human: "Dynamic import de pdfjs-dist + render em canvas não é verificável staticamente"
  - test: "Verificar que SecretKeyModal não pode ser fechado clicando fora do dialog"
    expected: "Clicar no overlay não fecha o modal; apenas o botão 'Entendi, fechar' fecha"
    why_human: "Comportamento de interação de UI — requer teste manual no browser"
---

# Phase 02: Merchants Verification Report

**Phase Goal:** Time interno consegue visualizar, criar, gerenciar status e revisar KYC de merchants a partir de uma interface completa e tabulada
**Verified:** 2026-04-01
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Lista paginada de merchants com filtros por status e verificação | VERIFIED | `MerchantsListPage.svelte` renderiza `SearchInput`, `SelectFilter` (verificação) e `STATUS_TABS` com 5 opções |
| 2 | Tabs de filtro rápido por status com contagem por tab | VERIFIED | `STATUS_TABS` com `ctrl.state.counts[tab.key]`; `loadCounts()` faz 4 requests paralelos |
| 3 | Página de detalhe com 6 abas navegáveis | VERIFIED | `MerchantDetailPage.svelte` usa shadcn `Tabs` com: info, balance, settings, kyc, credentials, transactions |
| 4 | Ações de status com dialog de confirmação e motivo obrigatório | VERIFIED | `MerchantStatusActions.svelte` + `ConfirmDialog` com `requiresReason={true}`; controle de role SUPPORT/ADMIN |
| 5 | Review de KYC com preview de documentos e botões Aprovar/Rejeitar | VERIFIED | `MerchantKYCTab.svelte`: grid de cards, preview img/PDF via pdfjs-dist, form de revisão com `onVerificationUpdate` |
| 6 | Criar merchant pelo admin (role ADMIN+) | VERIFIED | `CreateMerchantSheet.svelte` com formulário completo, dropdown de tenants, botão "Novo Merchant" visível apenas para ADMIN |
| 7 | Editar configurações do merchant (webhook, limites, auto-withdrawal) | VERIFIED | Aba Configurações em `MerchantDetailPage.svelte` com form + `ctrl.updateSettings()` |
| 8 | Criar credencial API com display one-time do secretKey | VERIFIED | `MerchantCredentialsTab.svelte` + `SecretKeyModal.svelte`; modal não fecha por overlay (onInteractOutside + showCloseButton=false) |
| 9 | Entrada "Verificações Pendentes" na sidebar com badge de contagem | VERIFIED | `AdminLayout.svelte` faz fetch para `/api/v1/admin/merchants?verification=PENDING_REVIEW&limit=1`, exibe badge cyan com contagem |

**Score:** 9/9 truths verified

---

## Required Artifacts

| Artifact | Provides | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `src/core/constants/apiPaths.ts` | ADMIN_MERCHANT_DOCUMENTS + ADMIN_TENANTS adicionados | Yes | Yes (17 + 18) | — | VERIFIED |
| `src/app/features/merchants/domain/entities/Merchant.ts` | 21 tipos e interfaces | Yes | Yes (152 linhas, todos os tipos) | — | VERIFIED |
| `src/app/features/merchants/domain/repositories/IMerchantRepository.ts` | Contrato 10 métodos | Yes | Yes (10 métodos definidos) | — | VERIFIED |
| `src/app/features/merchants/data/repositories/MerchantRepository.ts` | Implementação HTTP | Yes | Yes (151 linhas, todos os métodos) | Importado por MerchantService | VERIFIED |
| `src/app/features/merchants/services/MerchantService.ts` | Camada de serviço com getPendingKYCCount | Yes | Yes (78 linhas, 11 métodos) | Importado por controllers e CreateMerchantSheet | VERIFIED |
| `src/app/features/merchants/presentation/controllers/merchantListController.svelte.ts` | Controller reativo da lista | Yes | Yes (loadMerchants, loadCounts, loadPendingKYCCount) | Usado em MerchantsListPage | VERIFIED |
| `src/app/features/merchants/presentation/controllers/merchantDetailController.svelte.ts` | Controller reativo do detalhe | Yes | Yes (loadMerchant, lazy tabs, updateStatus, updateVerification, updateSettings, createCredential) | Usado em MerchantDetailPage | VERIFIED |
| `src/app/features/merchants/presentation/pages/MerchantsListPage.svelte` | Lista com tabs, filtros, DataTable | Yes | Yes (165+ linhas, StatusTabs, SearchInput, SelectFilter, DataTable, CreateMerchantSheet integrado) | Montada em /merchants/+page.svelte | VERIFIED |
| `src/app/features/merchants/presentation/pages/MerchantDetailPage.svelte` | Detalhe com 6 abas | Yes | Yes (340+ linhas, 6 tabs, MerchantStatusActions/KYC/Credentials/Transactions integrados) | Montada em /merchants/[id]/+page.svelte | VERIFIED |
| `src/app/features/merchants/presentation/components/MerchantStatusActions.svelte` | Botões condicionais de status com ConfirmDialog | Yes | Yes (153 linhas, 4 status, requiresReason, role guard) | Usado em MerchantDetailPage header | VERIFIED |
| `src/app/features/merchants/presentation/components/MerchantKYCTab.svelte` | Aba KYC com preview e form de revisão | Yes | Yes (pdfjs-dist dynamic import, grid de cards, form APPROVED/REJECTED) | Usado em MerchantDetailPage tab kyc | VERIFIED |
| `src/app/features/merchants/presentation/components/MerchantCredentialsTab.svelte` | Lista de credenciais + criação | Yes | Yes (form de criação, lista com truncateKey, SecretKeyModal) | Usado em MerchantDetailPage tab credentials | VERIFIED |
| `src/app/features/merchants/presentation/components/SecretKeyModal.svelte` | Dialog one-time do secretKey | Yes | Yes (showCloseButton=false, onInteractOutside previne fechar, botão "Entendi, fechar") | Usado em MerchantCredentialsTab | VERIFIED |
| `src/app/features/merchants/presentation/components/CreateMerchantSheet.svelte` | Sheet de criação de merchant | Yes | Yes (formulário completo, dropdown tenants via listTenants(), validação) | Usado em MerchantsListPage | VERIFIED |
| `src/app/features/merchants/presentation/components/MerchantTransactionsTab.svelte` | Lista lazy de transações com link | Yes | Yes (tabela de transações, link "/transactions/payments?merchantId={id}") | Usado em MerchantDetailPage tab transactions | VERIFIED |
| `src/routes/(admin)/merchants/+page.svelte` | Rota /merchants | Yes | Yes (importa e monta MerchantsListPage com role) | Rota SvelteKit ativa | VERIFIED |
| `src/routes/(admin)/merchants/[id]/+page.svelte` | Rota /merchants/[id] | Yes | Yes (importa e monta MerchantDetailPage com merchantId e role) | Rota SvelteKit ativa | VERIFIED |

---

## Key Link Verification

| From | To | Via | Status | Detail |
|------|----|-----|--------|--------|
| `MerchantRepository.ts` | `apiPaths.ts` | `API_PATHS.ADMIN_MERCHANTS` | WIRED | Padrão usado em listMerchants, getById, create |
| `MerchantRepository.ts` | `apiPaths.ts` | `API_PATHS.ADMIN_MERCHANT_DOCUMENTS` | WIRED | Usado em getDocuments |
| `MerchantRepository.ts` | `apiPaths.ts` | `API_PATHS.ADMIN_TENANTS` | WIRED | Usado em listTenants |
| `MerchantsListPage.svelte` | `merchantListController.svelte.ts` | `createMerchantListController()` | WIRED | Importado e instanciado na linha 6/20 |
| `MerchantDetailPage.svelte` | `merchantDetailController.svelte.ts` | `createMerchantDetailController(merchantId)` | WIRED | Importado na linha 10, instanciado na linha 20 |
| `merchantDetailController.svelte.ts` | `MerchantService.ts` | `service.getById` | WIRED | Chamado em loadMerchant(); service.getDocuments, getCredentials, updateStatus, updateVerification todos presentes |
| `AdminLayout.svelte` | API backend | fetch direto com `verification=PENDING_REVIEW` | WIRED | Fetch inline em onMount, resultado exibido como badge cyan |
| `MerchantStatusActions.svelte` | `ConfirmDialog.svelte` | `ConfirmDialog` com `requiresReason={true}` | WIRED | Import e uso nas linhas 2/129 |
| `MerchantKYCTab.svelte` | `pdfjs-dist` | `await import('pdfjs-dist')` | WIRED | Dynamic import em renderPDF(), linha 68 |
| `MerchantDetailPage.svelte` | `MerchantStatusActions.svelte` | Import + uso no header | WIRED | Linhas 13/108, passando merchant, role, updating, onStatusUpdate |
| `MerchantCredentialsTab.svelte` | `SecretKeyModal.svelte` | Exibe após createCredential retornar | WIRED | Importado na linha 5, modalOpen = true após sucesso |
| `CreateMerchantSheet.svelte` | `MerchantService.ts` | `service.listTenants()` em loadTenants | WIRED | Linha 66; trigado em $effect quando open && tenants.length === 0 |
| `MerchantsListPage.svelte` | `CreateMerchantSheet.svelte` | `bind:open={showCreateSheet}` | WIRED | Linhas 16/164-166 |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `MerchantsListPage.svelte` | `ctrl.state.merchants` | `service.listMerchants()` → `apiClient.get(ADMIN_MERCHANTS)` | Yes — HTTP call ao backend | FLOWING |
| `MerchantsListPage.svelte` | `ctrl.state.counts` | `loadCounts()` via 4x `service.listMerchants({status})` | Yes — extrai `.total` de cada request | FLOWING |
| `MerchantDetailPage.svelte` | `ctrl.state.merchant` | `service.getById(merchantId)` → `apiClient.get(ADMIN_MERCHANT(id))` | Yes — HTTP call ao backend | FLOWING |
| `MerchantDetailPage.svelte` | `ctrl.state.kycDocs` | `service.getDocuments(id)` → `apiClient.get(ADMIN_MERCHANT_DOCUMENTS(id))` | Yes — HTTP call ao backend, lazy ao clicar tab | FLOWING |
| `MerchantDetailPage.svelte` | `ctrl.state.credentials` | `service.getCredentials(id)` → `apiClient.get(ADMIN_MERCHANT_CREDENTIALS(id))` | Yes — HTTP call ao backend, lazy ao clicar tab | FLOWING |
| `MerchantDetailPage.svelte` | `ctrl.state.recentTxns` | fetch direto `/api/v1/admin/payments?merchantId={id}&limit=10` | Parcial — feature de transações é fase futura; array vazio se endpoint não retornar dados ainda | STATIC (por design, fase futura) |
| `AdminLayout.svelte` | `pendingKYCCount` | fetch direto `/api/v1/admin/merchants?verification=PENDING_REVIEW&limit=1` | Yes — extrai `json.total` | FLOWING |

**Nota sobre MerchantTransactionsTab:** A aba de transações usa fetch direto ao endpoint de pagamentos com merchantId. O plano documenta explicitamente que "feature completa de transações é fase futura" — a tab exibe dados se o endpoint retornar, ou estado vazio. Este é um comportamento correto e esperado, não uma lacuna.

---

## Behavioral Spot-Checks

Step 7b: SKIPPED — sem servidor ativo para checar endpoints HTTP. Verificação manual necessária (ver seção Human Verification).

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| MERCH-01 | 02-01 | Lista paginada com filtros por status e verificação | SATISFIED | `MerchantsListPage.svelte` com SearchInput + SelectFilter + STATUS_TABS |
| MERCH-02 | 02-01 | Tabs de filtro rápido por status com count por tab | SATISFIED | STATUS_TABS com `ctrl.state.counts[tab.key]` e `loadCounts()` |
| MERCH-03 | 02-02 | Página de detalhe com 6 abas: Info/KYC/Saldo/Configurações/Transações/Credenciais | SATISFIED | `MerchantDetailPage.svelte` com Tabs shadcn e todos os conteúdos |
| MERCH-04 | 02-03 | Ações de status com dialog de confirmação e motivo obrigatório (SUPPORT+) | SATISFIED | `MerchantStatusActions.svelte` com `requiresReason={true}` e role guards |
| MERCH-05 | 02-03 | Review de KYC: preview de documentos + Aprovar/Rejeitar com notas (SUPPORT+) | SATISFIED | `MerchantKYCTab.svelte` com pdfjs-dist, DOC_LABELS, `canReview` guard |
| MERCH-06 | 02-04 | Criar merchant com formulário completo (ADMIN+) | SATISFIED | `CreateMerchantSheet.svelte` com validação, dropdown tenants, botão visível apenas ADMIN |
| MERCH-07 | 02-02 | Editar configurações: webhook URL, limites de saque, auto-withdrawal (ADMIN+) | SATISFIED | Aba Configurações em `MerchantDetailPage.svelte` + `ctrl.updateSettings()` |
| MERCH-08 | 02-04 | Criar credencial API com secretKey exibido uma única vez (ADMIN+) | SATISFIED | `MerchantCredentialsTab.svelte` + `SecretKeyModal.svelte` (showCloseButton=false) |
| MERCH-09 | 02-01 | Entrada "Verificações Pendentes" na sidebar com badge de contagem | SATISFIED | `AdminLayout.svelte` link `/merchants?verification=PENDING_REVIEW` + badge cyan com fetch |

**Cobertura:** 9/9 requirements da fase satisfeitos.

---

## Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `MerchantDetailPage.svelte:289-290` | `.lazy-placeholder` com "Clique na aba para carregar" | Info | Comportamento intencional de UX para lazy loading — não é stub de implementação |
| `merchantDetailController.svelte.ts:110-129` | `loadTransactionsTab()` usa fetch direto sem apiClient | Info | Decisão documentada no SUMMARY ("feature completa de transações é fase futura"); comportamento correto |
| `AdminLayout.svelte:21` | Badge usa fetch direto sem apiClient | Info | Decisão documentada no SUMMARY ("para evitar dependência circular no layout") |

Nenhum anti-padrão bloqueador ou de aviso identificado. Os três itens listados são decisões de design documentadas e intencionais.

---

## Human Verification Required

### 1. Tabs de Status com Contagens

**Test:** Navegar para `/merchants` com merchants de diferentes status no backend
**Expected:** Cada tab (Pendente, Ativo, Suspenso, Bloqueado) exibe a contagem correta; tab ALL exibe o total
**Why human:** `loadCounts()` faz 4 requests paralelos ao backend — requer API ativa para validar

### 2. Preview de PDF em KYC

**Test:** Abrir detalhe de merchant com documento PDF enviado na aba KYC
**Expected:** Clicar em "Ver documento" renderiza a primeira página do PDF via pdfjs-dist em canvas inline
**Why human:** Dynamic import de pdfjs-dist + render em canvas não é verificável estaticamente

### 3. SecretKeyModal não fecha por overlay

**Test:** Criar credencial API em um merchant (role ADMIN), ao aparecer SecretKeyModal tentar clicar fora do dialog
**Expected:** O modal permanece aberto; apenas o botão "Entendi, fechar" funciona
**Why human:** Comportamento de interação `onInteractOutside` + `showCloseButton={false}` — requer teste manual no browser

---

## Gaps Summary

Nenhuma lacuna identificada. Todos os 9 requirements (MERCH-01 a MERCH-09) têm implementação verificada nos 4 níveis:
- **Existe:** Todos os artefatos criados
- **Substancial:** Nenhum arquivo é stub ou placeholder de implementação
- **Conectado:** Todas as key links verificadas (imports, uso, data flow)
- **Dados fluindo:** Todos os componentes recebem dados reais via HTTP (exceto transações, cujo comportamento vazio é documentado como intencional na fase atual)

A feature de merchants está completa e funcional conforme o goal da fase.

---

_Verified: 2026-04-01_
_Verifier: Claude (gsd-verifier)_
