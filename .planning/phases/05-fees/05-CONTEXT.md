# Phase 5: Fees — Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

CRUD de regras de taxas (globais e por merchant) com conversão de unidades (basis points ↔ %, centavos ↔ R$), panel lateral de simulação de resultado líquido. Uma única página `/fees` com duas tabs: regras globais e regras por merchant.

**Fora de escopo:** Exportação de regras, histórico de auditoria de taxas (cobre AUDIT), notificações em tempo real.

</domain>

<decisions>
## Implementation Decisions

### Layout da Página — Seções Global vs. Por Merchant
- **D-01:** Página `/fees` usa **Tabs: Global / Por Merchant** no topo.
  - Tab **Global**: tabela com todas as regras onde `merchantId == null`. Botão "+ Nova Regra Global" acima da tabela.
  - Tab **Por Merchant**: `MerchantAutocomplete` como filtro; ao selecionar um merchant, carrega `GET /api/v1/fees/merchants/{merchantId}/rules`. Botão "+ Nova Regra" habilitado apenas após merchant selecionado.
  - FEES-01 satisfeito: as duas seções são visualmente distintas por tabs.

### Formulário de Criação/Edição
- **D-02:** Criação e edição de regra abrem em **Sheet/drawer lateral** deslizando da direita — mesmo padrão da Phase 2 (CreateMerchantSheet). Reutiliza o componente `Sheet` shadcn já instalado.
  - Campos no formulário: tipo de taxa (feeType), tipo de cálculo (calculation), percentual (% → armazenado como basis points), valor fixo (R$ → armazenado em centavos), mínimo opcional (R$), máximo opcional (R$).
  - Ao editar, Sheet abre pré-preenchido com os valores atuais da regra (percentageRate / 100 para %, fixedAmount / 100 para R$).
  - Visível apenas para ADMIN+ (ocultar botão + Sheet para VIEWER e SUPPORT).

### Conversão de Unidades — UX em Tempo Real
- **D-03:** **Feedback em tempo real** abaixo de cada input de conversão:
  - Input de percentual exibe `ℹ️ = {valor * 100} basis points` enquanto o usuário digita.
  - Input de valor fixo (R$) exibe `ℹ️ = {valor * 100} centavos` enquanto o usuário digita.
  - Conversão ocorre via `$derived` reativo (Svelte 5 runes) — sem debounce necessário.
  - Ao submeter, o controller converte antes de enviar: `percentageRate = Math.round(percentFloat * 100)`, `fixedAmount = Math.round(reaisFloat * 100)`.

### Simulador de Taxa (FEES-04)
- **D-04:** **Panel lateral fixo** sempre visível ao lado direito das tabelas na página `/fees`.
  - Layout de duas colunas: tabela (esquerda, ~65%) + simulador (direita, ~35%).
  - Campos do simulador: tipo de taxa (dropdown feeType), valor bruto (input R$), merchant opcional (MerchantAutocomplete).
  - Botão "Simular" chama `POST /api/v1/fees/simulate`. Resultado exibe bruto / taxa / líquido + ID da regra aplicada.
  - Estado do simulador: formulário sempre visível; resultado aparece abaixo do botão após resposta.

### Exclusão de Regra
- **D-05:** Exclusão via `ConfirmDialog` existente — **sem campo de motivo** (ação simples, sem auditoria de motivo necessária).
  - Role guard: botão de exclusão oculto para VIEWER e SUPPORT.

### Claude's Discretion
- Skeleton/loading state durante carregamento da lista de regras
- Ordenação padrão das regras na tabela (provavelmente por feeType)
- Colunas exatas da DataTable (sugerido: Tipo, Cálculo, Percentual, Valor Fixo, Mín/Máx, Ações)
- Comportamento do Sheet após salvar (fechar automaticamente + toast de sucesso)
- Empty state quando merchant ainda não foi selecionado na tab "Por Merchant"

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### API — Fees
- `docs/FRONTEND_ADMIN_DOC.md` §5.7 — endpoints completos de taxas:
  - §5.7.1 `GET /api/v1/fees/rules?page={page}&pageSize={pageSize}` — lista paginada; `FeeRuleResponse` com id, merchantId, feeType, calculation, percentageRate (basis points), fixedAmount (centavos), minFee, maxFee, isActive
  - §5.7.2 `POST /api/v1/fees/rules` — criar regra
  - §5.7.3 `PUT /api/v1/fees/rules/{id}` — editar regra (todos os campos opcionais)
  - §5.7.4 `DELETE /api/v1/fees/rules/{id}` — excluir regra
  - §5.7.5 `GET /api/v1/fees/merchants/{merchantId}/rules` — regras de um merchant específico
  - §5.7.6 `POST /api/v1/fees/simulate` — simular taxa; request: `{ feeType, amount (centavos), merchantId | null }`; response: `{ grossAmount, feeAmount, netAmount, ruleId, calculationType }`
- `docs/FRONTEND_ADMIN_DOC.md` §7 — enums: FeeType (PIX/BOLETO/CREDIT_CARD/DEBIT_CARD/WITHDRAWAL/ANTICIPATION), Calculation (PERCENTAGE/FIXED/PERCENTAGE_PLUS_FIXED)
- `docs/FRONTEND_ADMIN_DOC.md` §8 — RBAC: Fees (listar/simular) VIEWER+, Fees (criar/editar/excluir) ADMIN+

### Conversão de Unidades
- `docs/FRONTEND_ADMIN_DOC.md` §5.7 linha de formatação: `percentageRate / 100` para exibir como %; `250 → 2.50%`

### Padrão de Referência — Phase 2 (Sheet, filtros, role guard)
- `.planning/phases/02-merchants/02-CONTEXT.md` — D-09 a D-13: Sheet lateral, formulário com campos obrigatórios, role guard ADMIN+
- `src/app/features/merchants/list/presentation/components/CreateMerchantSheet.svelte` — referência de Sheet de criação

### Arquitetura e Convenções
- `.planning/codebase/ARCHITECTURE.md` — Clean Architecture por feature, Either<Failure,T>, controller pattern
- `.planning/codebase/CONVENTIONS.md` — nomenclatura, Svelte 5 runes, estrutura de componentes

### Design System
- `docs/StyleGuide.md` — tokens de cor, tipografia — fonte primária de design
- `src/app.css` — CSS custom properties do tema Prisma

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/features/fees/presentation/pages/FeesListPage.svelte` — stub "Em implementação..." — substituir completamente
- `src/app/shared/widgets/DataTable.svelte` — reutilizar para listas de regras (global e por merchant)
- `src/app/shared/widgets/ConfirmDialog.svelte` — reutilizar para exclusão de regra (sem requiresReason)
- `src/app/shared/widgets/filters/SelectFilter.svelte` — reutilizar para dropdown feeType no simulador
- `src/app/features/transactions/shared/components/MerchantAutocomplete.svelte` — reutilizar para filtro de merchant (tab Por Merchant) e simulador
- `src/app/shared/utils/formatters.ts` — `formatCurrency` (centavos → R$) e `formatDate`
- `src/core/constants/apiPaths.ts` — adicionar FEES_RULES, FEES_RULE(id), FEES_SIMULATE, FEES_MERCHANT_RULES(merchantId)
- Componente `Sheet` do shadcn — já instalado desde Phase 2

### Stubs Existentes
- `src/routes/(admin)/fees/+page.svelte` — rota existente — atualizar para importar FeesListPage
- Diretório `src/app/features/fees/` — existe apenas `presentation/pages/FeesListPage.svelte`; criar domain/, data/ e demais presentation/

### Established Patterns
- Controller pattern: `createFeesController()` com Svelte 5 runes (`$state`, `$derived`)
- Repository pattern: `IFeeRepository` + implementação concreta
- Either monad: `Either<Failure, T>` para resultados de API
- Route files thin shell: SvelteKit routes importam apenas o page component
- Sheet: `CreateMerchantSheet` como referência de implementação

### Integration Points
- `src/app/shared/widgets/AdminLayout.svelte` — verificar se "Taxas" já aparece na sidebar; se não, adicionar
- `src/core/constants/apiPaths.ts` — adicionar endpoints de fees

</code_context>

<specifics>
## Specific Ideas

- Panel do simulador: layout duas colunas com `grid-template-columns: 1fr minmax(280px, 35%)` — simulador sticky ao scroll lateral
- Conversão em tempo real: usar `$derived` do Svelte 5 (`basisPoints = $derived(Math.round(percentFloat * 100))`) — sem debounce
- Tab "Por Merchant": empty state explícito quando nenhum merchant selecionado — ex: ícone + texto "Selecione um merchant para ver suas regras"

</specifics>

<deferred>
## Deferred Ideas

- Nenhuma ideia fora do escopo surgiu na discussão — foco mantido em FEES-01 a FEES-04.

</deferred>

---

*Phase: 05-fees*
*Context gathered: 2026-04-16 via discuss-phase*
