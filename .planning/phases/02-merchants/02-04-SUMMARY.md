---
phase: 02-merchants
plan: "04"
subsystem: merchants
tags: [credentials, secret-key, transactions, create-merchant, sheet, dialog]
dependency_graph:
  requires:
    - 02-03 (MerchantDetailPage com stubs de Credenciais e Transações, controller com refreshCredentials)
    - 02-01 (Sheet instalado, MerchantService.listTenants, domain entities)
  provides:
    - MerchantCredentialsTab com criação e display one-time via SecretKeyModal
    - CreateMerchantSheet com formulário completo e dropdown de tenants
    - MerchantTransactionsTab com lista lazy e link filtrado por merchantId
    - Feature de merchants 100% completa (Plans 02-01 a 02-04)
  affects:
    - MerchantDetailPage (tabs Credenciais e Transações com componentes reais)
    - MerchantsListPage (botão Novo Merchant abre CreateMerchantSheet)
tech_stack:
  added: []
  patterns:
    - Select.Root type="single" value onValueChange (bits-ui padrão estabelecido)
    - DialogContent showCloseButton={false} + onInteractOutside para prevenir fechar pelo overlay
    - createCredential adicionado ao merchantDetailController para atualização local de estado
key_files:
  created:
    - src/app/features/merchants/presentation/components/SecretKeyModal.svelte
    - src/app/features/merchants/presentation/components/MerchantCredentialsTab.svelte
    - src/app/features/merchants/presentation/components/MerchantTransactionsTab.svelte
    - src/app/features/merchants/presentation/components/CreateMerchantSheet.svelte
  modified:
    - src/app/features/merchants/presentation/pages/MerchantDetailPage.svelte
    - src/app/features/merchants/presentation/pages/MerchantsListPage.svelte
    - src/app/features/merchants/presentation/controllers/merchantDetailController.svelte.ts
decisions:
  - Select não exporta SelectValue — usar texto diretamente no SelectTrigger com $derived computed label
  - DialogContent aceita showCloseButton={false} para remover botão X nativo, onInteractOutside via restProps para bloquear fechar pelo overlay
  - createCredential adicionado ao controller (não inline no page) para manter Clean Architecture
metrics:
  duration: ~8 min
  completed: 2026-04-01T17:14:41Z
  tasks: 2/2
  files: 7
---

# Phase 02 Plan 04: MerchantCredentialsTab + SecretKeyModal + CreateMerchantSheet Summary

**One-liner:** Dialog one-time de secretKey não-dispensável, aba de credenciais com env-badges, Sheet de criação de merchant com dropdown de tenants, e tab de transações com link filtrado — feature merchants completa.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | MerchantCredentialsTab + SecretKeyModal | 5fb3215 | SecretKeyModal.svelte, MerchantCredentialsTab.svelte, MerchantDetailPage.svelte, merchantDetailController.svelte.ts |
| 2 | MerchantTransactionsTab + CreateMerchantSheet + integrações finais | 37cb0d9 | MerchantTransactionsTab.svelte, CreateMerchantSheet.svelte, MerchantDetailPage.svelte, MerchantsListPage.svelte |

## What Was Built

### SecretKeyModal
- Dialog não-dispensável: `showCloseButton={false}` remove botão X, `onInteractOutside` previne fechar pelo overlay
- Único meio de fechar é o botão "Entendi, fechar" que chama `onClose`
- Botões de cópia separados para publicKey e secretKey com feedback visual (2s)
- Visual de alerta em âmbar para destacar caráter único da exibição

### MerchantCredentialsTab
- Lista de credenciais com `env-badge--live` (cyan) e `env-badge--test` (amber)
- Badge de atividade (`active-badge--on`) verde para credenciais ativas
- Formulário de criação com toggle (+ Nova Credencial / Cancelar)
- Select de ambiente LIVE/TEST via `Select.Root type="single"`
- Abre SecretKeyModal com `secretKey` retornado pela API (one-time)
- Visível apenas para roles ADMIN+

### MerchantTransactionsTab
- Lista lazy com 5 colunas: tipo, valor, status (colorido por mapa), data, ID truncado
- Link "Ver todas as transações deste merchant →" com `?merchantId={id}` para fase futura
- Estado vazio com mensagem adequada

### CreateMerchantSheet
- Sheet deslizando da direita (`side="right"`) com largura `min(520px, 95vw)`
- Carrega tenants via `service.listTenants()` no `$effect` ao abrir (lazy)
- Campos: legalName*, tradeName, documentType*, documentNumber*, email*, phone, password*, tenantId*, status (opcional), verificationStatus (opcional)
- Validação client-side antes de chamar `service.create()`
- `resetForm()` ao fechar via Cancelar ou `handleOpenChange(false)`

### Integrações
- `MerchantDetailPage`: tabs Credenciais e Transações usam componentes reais (placeholders removidos)
- `MerchantsListPage`: botão "+ Novo Merchant" abre `CreateMerchantSheet`; `onCreated` chama `ctrl.loadMerchants()`
- Controller: método `createCredential` adicionado, atualiza `state.credentials` localmente antes de refetch

## Decisions Made

1. **Select sem SelectValue exportado** — A shadcn-svelte instalada não exporta `SelectValue`. Padrão usado: texto computed via `$derived` no trigger (conforme SelectFilter.svelte existente). Aplicado consistentemente em todos os 4 selects do CreateMerchantSheet e 1 select do MerchantCredentialsTab.

2. **Dialog não-dispensável via showCloseButton={false} + onInteractOutside** — `DialogContent` aceita `showCloseButton` prop nativa e passa `onInteractOutside` via `...restProps` para `DialogPrimitive.Content` (bits-ui). Combinação dos dois bloqueia todos os meios automáticos de fechar.

3. **createCredential no controller** — Alternativa inline no page (dynamic import de MerchantService) seria mais verbosa e violaria a separação da Clean Architecture. Controller é o lugar correto para encapsular a lógica de negócio.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Select sem SelectValue — uso de texto direto no trigger**
- **Found during:** Task 1 (ao ler select/index.ts)
- **Issue:** Plan especificava `SelectValue` como subcomponente, mas ele não existe na versão instalada do shadcn-svelte
- **Fix:** Texto calculado via `$derived` colocado diretamente no slot do `SelectTrigger`, conforme padrão já estabelecido em `SelectFilter.svelte`
- **Files modified:** MerchantCredentialsTab.svelte, CreateMerchantSheet.svelte
- **Commit:** 5fb3215, 37cb0d9

## Known Stubs

Nenhum stub que impeça o objetivo do plano:
- `MerchantTransactionsTab` recebe `transactions` do controller, que por sua vez busca via `/api/v1/admin/payments?merchantId={id}&limit=10`. O endpoint de transações será implementado em Phase 3 (Transações). A lista pode aparecer vazia — este é comportamento esperado e documentado no controller.
- Link "Ver todas as transações" aponta para `/transactions/payments` (Phase 3). A rota ainda não existe mas o link é correto para quando for implementada.

## Self-Check: PASSED

All created files verified on disk. Both commits (5fb3215, 37cb0d9) verified in git log.
