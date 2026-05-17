# Phase 5: Fees — Research

**Researched:** 2026-04-16
**Domain:** Fee rules CRUD, unit conversion (basis points / centavos), fee simulator, SvelteKit + shadcn-svelte Tabs/Sheet patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Página `/fees` usa **Tabs: Global / Por Merchant** no topo.
  - Tab **Global**: tabela com todas as regras onde `merchantId == null`. Botão "+ Nova Regra Global" acima da tabela.
  - Tab **Por Merchant**: `MerchantAutocomplete` como filtro; ao selecionar um merchant, carrega `GET /api/v1/fees/merchants/{merchantId}/rules`. Botão "+ Nova Regra" habilitado apenas após merchant selecionado.
  - FEES-01 satisfeito: as duas seções são visualmente distintas por tabs.

- **D-02:** Criação e edição de regra abrem em **Sheet/drawer lateral** deslizando da direita — mesmo padrão da Phase 2 (CreateMerchantSheet). Reutiliza o componente `Sheet` shadcn já instalado.
  - Campos: feeType, calculation, percentual (% → basis points), valor fixo (R$ → centavos), mínimo opcional (R$), máximo opcional (R$).
  - Ao editar, Sheet abre pré-preenchido com `percentageRate / 100` e `fixedAmount / 100`.
  - Visível apenas para ADMIN+ (ocultar botão + Sheet para VIEWER e SUPPORT).

- **D-03:** **Feedback em tempo real** abaixo de cada input de conversão:
  - Input de percentual exibe `ℹ️ = {valor * 100} basis points` enquanto o usuário digita.
  - Input de valor fixo (R$) exibe `ℹ️ = {valor * 100} centavos` enquanto o usuário digita.
  - Conversão via `$derived` reativo (Svelte 5 runes) — sem debounce.
  - Ao submeter: `percentageRate = Math.round(percentFloat * 100)`, `fixedAmount = Math.round(reaisFloat * 100)`.

- **D-04:** **Panel lateral fixo** sempre visível ao lado direito das tabelas.
  - Layout duas colunas: tabela (~65%) + simulador (~35%).
  - CSS: `grid-template-columns: 1fr minmax(280px, 35%)`.
  - Campos do simulador: feeType (dropdown), valor bruto (input R$), merchant opcional (MerchantAutocomplete).
  - Botão "Simular" chama `POST /api/v1/fees/simulate`.
  - Resultado exibe bruto / taxa / líquido + ID da regra aplicada.

- **D-05:** Exclusão via `ConfirmDialog` existente — **sem campo de motivo** (`requiresReason: false`).
  - Role guard: botão de exclusão oculto para VIEWER e SUPPORT.

### Claude's Discretion

- Skeleton/loading state durante carregamento da lista de regras
- Ordenação padrão das regras na tabela (provavelmente por feeType)
- Colunas exatas da DataTable (sugerido: Tipo, Cálculo, Percentual, Valor Fixo, Mín/Máx, Ações)
- Comportamento do Sheet após salvar (fechar automaticamente + toast de sucesso)
- Empty state quando merchant ainda não foi selecionado na tab "Por Merchant"

### Deferred Ideas (OUT OF SCOPE)

- Nenhuma ideia fora do escopo surgiu na discussão — foco mantido em FEES-01 a FEES-04.
- Exportação de regras, histórico de auditoria de taxas, notificações em tempo real.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEES-01 | Lista de regras de taxas globais (merchantId == null) separada das regras por merchant | Tab Global (D-01) usa `GET /api/v1/fees/rules` filtrando por `merchantId == null` no cliente; Tab Por Merchant (D-01) usa `GET /api/v1/fees/merchants/{merchantId}/rules` |
| FEES-02 | Formulário de criação/edição de regra: tipo de taxa, cálculo, percentual (basis points ↔ %), fixo (centavos ↔ R$), mín/máx opcionais (ADMIN+) | Sheet/drawer (D-02), conversão $derived (D-03), conversão bidirecional documentada em §5.7 |
| FEES-03 | Exclusão de regra com dialog de confirmação (ADMIN+) | ConfirmDialog existente com `requiresReason: false` (D-05), `DELETE /api/v1/fees/rules/{id}` |
| FEES-04 | Simulador de taxa: formulário com tipo, valor e merchant opcional; resultado exibe bruto / taxa / líquido e a regra aplicada | Simulador panel fixo (D-04), `POST /api/v1/fees/simulate`, resposta documentada em §5.7.6 |
</phase_requirements>

---

## Summary

Phase 5 implementa CRUD completo de regras de taxas e simulação em uma única página `/fees`. A página segue o padrão já estabelecido nas fases anteriores: arquitetura Clean por feature (domain → data → service → controller → presentation), DataTable genérico com shadcn Table, Sheet lateral para formulários e ConfirmDialog para exclusão.

A principal complexidade técnica está na **conversão de unidades bidirecional** — percentageRate é armazenado em basis points pelo backend (ex: 250 = 2,50%) e fixedAmount/minFee/maxFee são armazenados em centavos. O formulário deve converter em tempo real usando `$derived` do Svelte 5. O Svelte 5 `$derived` é síncrono e não precisa de debounce para cálculos simples como `Math.round(valor * 100)`.

O **simulador** é um panel fixo ao lado direito usando CSS Grid de duas colunas — não um route separado. Ele reusa o `MerchantAutocomplete` já implementado na Phase 3 e a lógica de `SelectFilter` para o feeType dropdown. Todo o state management é local via `$state`/`$derived` no controller.

**Recomendação primária:** Construir a feature em **dois planos**: Plano 1 cobre domain + data layer + FeesListPage com as duas tabs e o simulador panel (FEES-01 + FEES-04). Plano 2 cobre o FeeRuleSheet (criar/editar) + ConfirmDialog de exclusão (FEES-02 + FEES-03). Esta divisão espelha o padrão dos planos anteriores (ex: 04-01/04-02).

---

## Standard Stack

### Core (todos já instalados — zero instalação nova necessária)

| Library | Localização | Purpose | Confirmado |
|---------|-------------|---------|-----------|
| shadcn-svelte Tabs | `$lib/components/ui/tabs` | Global vs. Por Merchant tabs (D-01) | Confirmado — diretório existe |
| shadcn-svelte Sheet | `$lib/components/ui/sheet` | Drawer lateral criação/edição (D-02) | Confirmado — todos os sub-componentes presentes |
| shadcn-svelte Select | `$lib/components/ui/select` | Dropdowns feeType e calculation | Confirmado — em uso na Phase 2 |
| shadcn-svelte Dialog | `$lib/components/ui/dialog` | ConfirmDialog (exclusão D-05) | Confirmado — base do ConfirmDialog existente |
| shadcn-svelte Input | `$lib/components/ui/input` | Campos numéricos do formulário | Confirmado |
| shadcn-svelte Button | `$lib/components/ui/button` | Ações | Confirmado |
| @tanstack/table-core | `src/app/shared/widgets/DataTable.svelte` | Tabela de regras | Confirmado — em uso em todas as features |
| svelte-sonner | Toast de sucesso após salvar | Feedback de ação | Confirmado — em uso desde Phase 1 |

### Reusable Widgets (sem modificação)

| Componente | Caminho | Como usar |
|-----------|---------|-----------|
| `DataTable.svelte` | `$appmod/shared/widgets/DataTable.svelte` | Tabela de regras globais e por merchant; props: `columns`, `data`, `loading`, `cellSnippet` |
| `ConfirmDialog.svelte` | `$appmod/shared/widgets/ConfirmDialog.svelte` | Exclusão com `requiresReason={false}`, `destructive={true}` |
| `MerchantAutocomplete.svelte` | `$appmod/features/transactions/shared/components/MerchantAutocomplete.svelte` | Tab Por Merchant + Simulador; props: `value`, `onChange` |
| `SelectFilter.svelte` | `$appmod/shared/widgets/filters/SelectFilter.svelte` | Filtro feeType no simulador; props: `placeholder`, `options`, `value`, `onChange` |
| `formatCurrency` | `$appmod/shared/utils/formatters.ts` | Centavos → R$ (minFee, maxFee, fixedAmount) |
| `formatBasisPoints` | `$appmod/shared/utils/formatters.ts` | Basis points → porcentagem (ex: 250 → "2,50%") |

**Nenhuma nova dependência npm é necessária para esta fase.**

---

## Architecture Patterns

### Estrutura de Diretórios a Criar

```
src/app/features/fees/
├── domain/
│   ├── entities/
│   │   └── FeeRule.ts           # Tipos: FeeRule, FeeType, Calculation, SimulatePayload, SimulateResult, etc.
│   └── repositories/
│       └── IFeeRepository.ts    # Interface: listRules, listMerchantRules, createRule, updateRule, deleteRule, simulate
├── data/
│   └── repositories/
│       └── FeeRepository.ts     # Implementação concreta com apiClient
├── services/
│   └── FeeService.ts            # Pass-through thin service (padrão DisputeService)
└── presentation/
    ├── controllers/
    │   └── feesController.svelte.ts  # $state para lista global, lista merchant, simulador
    ├── components/
    │   └── FeeRuleSheet.svelte       # Sheet de criação/edição (padrão CreateMerchantSheet)
    └── pages/
        └── FeesListPage.svelte       # Substituir stub — Tabs + Simulador panel

src/routes/(admin)/fees/
└── +page.svelte                      # Thin shell (já existe, sem alteração)
```

### Pattern 1: Domain Entities (FeeRule.ts)

```typescript
// src/app/features/fees/domain/entities/FeeRule.ts
export type FeeType =
  | 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'WITHDRAWAL' | 'ANTICIPATION';

export type Calculation = 'PERCENTAGE' | 'FIXED' | 'PERCENTAGE_PLUS_FIXED';

export interface FeeRule {
  id: string;
  merchantId: string | null;          // null = global
  feeType: FeeType;
  calculation: Calculation;
  percentageRate: number;             // Basis points (250 = 2.5%)
  fixedAmount: number;                // Centavos
  minFee: number | null;              // Centavos
  maxFee: number | null;              // Centavos
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFeeRules {
  items: FeeRule[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateFeeRulePayload {
  merchantId: string | null;
  feeType: FeeType;
  calculation: Calculation;
  percentageRate: number;             // BASIS POINTS — converter antes de enviar
  fixedAmount: number;                // CENTAVOS — converter antes de enviar
  minFee: number | null;
  maxFee: number | null;
}

export interface UpdateFeeRulePayload {
  feeType?: string | null;
  calculation?: string | null;
  percentageRate?: number | null;
  fixedAmount?: number | null;
  minFee?: number | null;
  maxFee?: number | null;
  isActive?: boolean | null;
}

export interface SimulateFeePayload {
  feeType: FeeType;
  amount: number;                     // Centavos
  merchantId: string | null;
}

export interface SimulateFeeResult {
  grossAmount: number;                // Centavos
  feeAmount: number;                  // Centavos
  netAmount: number;                  // Centavos
  ruleId: string | null;
  calculationType: string | null;
}
```

### Pattern 2: Repository Interface (IFeeRepository.ts)

```typescript
// src/app/features/fees/domain/repositories/IFeeRepository.ts
import type { Either, Failure } from '$core/error/Failure';
import type {
  FeeRule, PaginatedFeeRules, CreateFeeRulePayload,
  UpdateFeeRulePayload, SimulateFeePayload, SimulateFeeResult
} from '../entities/FeeRule';

export interface IFeeRepository {
  listRules(page: number, pageSize: number): Promise<Either<Failure, PaginatedFeeRules>>;
  listMerchantRules(merchantId: string): Promise<Either<Failure, FeeRule[]>>;
  createRule(payload: CreateFeeRulePayload): Promise<Either<Failure, FeeRule>>;
  updateRule(id: string, payload: UpdateFeeRulePayload): Promise<Either<Failure, FeeRule>>;
  deleteRule(id: string): Promise<Either<Failure, void>>;
  simulate(payload: SimulateFeePayload): Promise<Either<Failure, SimulateFeeResult>>;
}
```

### Pattern 3: Controller com $state/$derived (feesController.svelte.ts)

```typescript
// src/app/features/fees/presentation/controllers/feesController.svelte.ts
// Padrão: createDisputeListController — $state, loadData, set* methods

export function createFeesController() {
  const service = new FeeService(new FeeRepository());

  let state = $state<FeesState>({
    // Tab Global
    globalRules: [],
    globalTotal: 0,
    globalPage: 1,
    globalLoading: true,
    globalError: null,

    // Tab Por Merchant
    merchantId: '',
    merchantRules: [],
    merchantLoading: false,
    merchantError: null,

    // Sheet
    sheetOpen: false,
    editingRule: null as FeeRule | null,
    saving: false,
    saveError: null as string | null,

    // Delete
    deletingId: null as string | null,
    confirmDeleteOpen: false,

    // Simulator
    simFeeType: '' as FeeType | '',
    simAmount: '',
    simMerchantId: '',
    simResult: null as SimulateFeeResult | null,
    simLoading: false,
    simError: null as string | null,
  });

  // Active tab driven by local $state in the page component (not in controller)
  // Controller exposes load* functions that page calls based on tab

  return { get state() { return state; }, loadGlobalRules, loadMerchantRules,
           openCreate, openEdit, closeSheet, saveRule,
           openDeleteConfirm, closeDeleteConfirm, deleteRule,
           setSimFeeType, setSimAmount, setSimMerchant, runSimulate };
}
```

### Pattern 4: Sheet de Criação/Edição (FeeRuleSheet.svelte)

```svelte
<!-- Padrão exato de CreateMerchantSheet.svelte -->
<Sheet {open} onOpenChange={handleOpenChange}>
  <SheetContent side="right" class="fee-rule-sheet">
    <SheetHeader>
      <SheetTitle>{editingRule ? 'Editar Regra' : 'Nova Regra de Taxa'}</SheetTitle>
    </SheetHeader>

    <!-- Conversão em tempo real (D-03) -->
    <!-- percentFloat é o valor em % (ex: 2.5) -->
    <!-- basisPoints = $derived(Math.round(percentFloat * 100)) -->
    <!-- reaisFloat é o valor em R$ (ex: 1.50) -->
    <!-- centavos = $derived(Math.round(reaisFloat * 100)) -->
    <div>
      <Input bind:value={percentFloat} type="number" step="0.01" />
      <span>ℹ️ = {basisPoints} basis points</span>
    </div>
  </SheetContent>
</Sheet>
```

**Pré-preenchimento ao editar:**
```typescript
// Converter ao abrir sheet com regra existente:
percentFloat = editingRule.percentageRate / 100;   // 250 → 2.50
reaisFloat   = editingRule.fixedAmount / 100;      // 350 → 3.50
minReais     = editingRule.minFee != null ? editingRule.minFee / 100 : null;
maxReais     = editingRule.maxFee != null ? editingRule.maxFee / 100 : null;
```

**Conversão ao submeter:**
```typescript
const payload: CreateFeeRulePayload = {
  merchantId: ...,
  feeType,
  calculation,
  percentageRate: Math.round(percentFloat * 100),   // 2.5 → 250
  fixedAmount:    Math.round(reaisFloat * 100),      // 1.5 → 150
  minFee:  minReais != null ? Math.round(minReais * 100)  : null,
  maxFee:  maxReais != null ? Math.round(maxReais * 100)  : null,
};
```

### Pattern 5: Tabs no FeesListPage

```svelte
<!-- shadcn-svelte Tabs — já instalado -->
<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  // exports: Root (Tabs), List (TabsList), Trigger (TabsTrigger), Content (TabsContent)
</script>

<Tabs.Root value="global" onValueChange={(v) => activeTab = v}>
  <Tabs.List>
    <Tabs.Trigger value="global">Regras Globais</Tabs.Trigger>
    <Tabs.Trigger value="merchant">Por Merchant</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="global">
    <!-- DataTable com regras globais -->
  </Tabs.Content>
  <Tabs.Content value="merchant">
    <!-- MerchantAutocomplete + DataTable merchant rules -->
  </Tabs.Content>
</Tabs.Root>
```

### Pattern 6: Layout Duas Colunas (Tabela + Simulador)

```svelte
<!-- D-04: grid com simulador fixo à direita -->
<div style="display: grid; grid-template-columns: 1fr minmax(280px, 35%); gap: 24px; align-items: start;">
  <!-- Coluna esquerda: Tabs + DataTable -->
  <div>
    <Tabs.Root ...>...</Tabs.Root>
  </div>

  <!-- Coluna direita: Simulador sticky -->
  <aside style="position: sticky; top: 24px;">
    <!-- FeeType select, valor bruto input, MerchantAutocomplete opcional -->
    <!-- Botão "Simular" -->
    <!-- Resultado: grossAmount / feeAmount / netAmount -->
  </aside>
</div>
```

### API Paths — Já configurados em apiPaths.ts

Verificado diretamente em `src/core/constants/apiPaths.ts` — todos os endpoints já existem:

```typescript
FEES_RULES: '/api/v1/fees/rules',
FEES_RULE: (id: string) => `/api/v1/fees/rules/${id}`,
FEES_SIMULATE: '/api/v1/fees/simulate',
FEES_MERCHANT_RULES: (merchantId: string) => `/api/v1/fees/merchants/${merchantId}/rules`,
```

**Ação:** Nenhuma modificação em `apiPaths.ts` é necessária.

### Pattern 7: Sidebar

Verificado em `AdminLayout.svelte` — a entrada `Taxas` (href: `/fees`, Icon: DollarSign) **já está na sidebar**. Nenhuma modificação necessária.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Localização |
|---------|-------------|-------------|-------------|
| Tabela de regras com sorting/skeleton/empty state | tabela HTML customizada | `DataTable.svelte` genérico | `$appmod/shared/widgets/DataTable.svelte` |
| Dialog de confirmação de exclusão | modal customizado | `ConfirmDialog.svelte` | `$appmod/shared/widgets/ConfirmDialog.svelte` |
| Drawer/sheet lateral de formulário | div com animação manual | `Sheet` shadcn-svelte | `$lib/components/ui/sheet` |
| Busca de merchant com autocomplete async | input + fetch manual | `MerchantAutocomplete.svelte` | `$appmod/features/transactions/shared/components/` |
| Dropdown de opções fixas | select nativo | `SelectFilter.svelte` ou `Select.*` shadcn | `$appmod/shared/widgets/filters/SelectFilter.svelte` |
| Conversão centavos → R$ | Intl manual | `formatCurrency(centavos)` | `$appmod/shared/utils/formatters.ts` |
| Conversão basis points → % | divisão manual | `formatBasisPoints(bp)` | `$appmod/shared/utils/formatters.ts` — retorna "2,50%" |
| Toast de sucesso/erro | estado inline | `svelte-sonner` (toast/toastError) | já globalizado desde Phase 1 |

**Key insight:** Todo o scaffolding de UI (tabela, formulário, confirmação, toast) já existe como componente reutilizável. Esta fase é quase inteiramente composição de peças existentes + lógica de conversão de unidades.

---

## Common Pitfalls

### Pitfall 1: Dividir por 100 no `$derived` vs. ao Submeter

**What goes wrong:** Aplicar a conversão de display (`/ 100`) na mesma variável que será enviada ao backend, causando dupla-divisão.
**Why it happens:** O input exibe o valor em "unidade humana" (%), mas o state interno deve manter o valor "humano" durante o preenchimento. A conversão para basis points só acontece no momento do submit.
**How to avoid:**
- State: `percentFloat` (em %) como `$state<number>(0)` — este é o valor editável pelo usuário.
- Display hint: `basisPoints = $derived(Math.round(percentFloat * 100))` — apenas para exibir o hint informativo.
- Payload: `percentageRate: Math.round(percentFloat * 100)` — aplicado somente em `handleSubmit`.
- **Nunca** usar `percentageRate` como variável editável do input.

### Pitfall 2: Floating-Point com Math.round

**What goes wrong:** `0.1 + 0.2` em JavaScript = `0.30000000000000004`. Sem `Math.round`, o valor salvo pode diferir do esperado.
**Why it happens:** Aritmética de ponto flutuante IEEE 754.
**How to avoid:** Sempre `Math.round(valor * 100)` ao converter para centavos/basis-points — exatamente como especificado em D-03. Para arredondamento de exibição, usar `toFixed(2)`.

### Pitfall 3: API Response Shape — listRules é Paginada, listMerchantRules é Array

**What goes wrong:** Assumir que ambos os endpoints retornam o mesmo shape.
**Why it happens:** `GET /api/v1/fees/rules` retorna `{ data: { items: [], total, page, pageSize } }` (paginado). `GET /api/v1/fees/merchants/{id}/rules` retorna lista de `FeeRuleResponse` ativas (documentado como array direto em §5.7.5).
**How to avoid:** Implementar dois métodos distintos no repository com tipos de retorno distintos — `PaginatedFeeRules` vs `FeeRule[]`. Usar o padrão `Array.isArray(raw)` do DisputeRepository para robustez.

### Pitfall 4: Select.Root — Prop `type="single"` Obrigatório

**What goes wrong:** TypeScript error "union ambiguity" ao usar `<Select.Root>` sem `type="single"`.
**Why it happens:** bits-ui v2 tem overload de SelectSingleRootProps vs SelectMultipleRootProps — sem o prop `type`, o TypeScript não consegue inferir.
**How to avoid:** Sempre passar `type="single"` em `<Select.Root>` (confirmado em STATE.md — "Decisions Made in Plan 01.1-03").

### Pitfall 5: Sheet `class` Prop — Usar `:global()` no CSS

**What goes wrong:** Estilizar `SheetContent` passando `class` mas não ver o CSS aplicado.
**Why it happens:** Svelte scoped CSS não penetra componentes filhos. O padrão `CreateMerchantSheet` usa `:global(.create-merchant-sheet)`.
**How to avoid:** Usar `:global(.fee-rule-sheet) { width: min(520px, 95vw) !important; background: #0a0910; ... }` exatamente como no referencial.

### Pitfall 6: Tab "Por Merchant" — Não Disparar Load sem merchantId

**What goes wrong:** Chamar `GET /api/v1/fees/merchants/{merchantId}/rules` com `merchantId` vazio, retornando erro 404 ou resultados incorretos.
**Why it happens:** O botão "+ Nova Regra" e o load automático podem ser ativados antes do merchant ser selecionado.
**How to avoid:**
- Load só ocorre quando `ctrl.state.merchantId !== ''`.
- Botão "+ Nova Regra" com `disabled={!ctrl.state.merchantId}`.
- Empty state explícito quando `merchantId === ''` (ícone + "Selecione um merchant para ver suas regras").

### Pitfall 7: Simulador — Input de Valor em R$ Deve Converter para Centavos antes de POST

**What goes wrong:** Enviar o valor bruto em reais (ex: 100.00) diretamente no campo `amount` do simulate payload.
**Why it happens:** O simulador exibe R$ para o usuário mas a API espera centavos.
**How to avoid:** `amount: Math.round(parseFloat(simAmount) * 100)` antes de chamar `service.simulate()`.

### Pitfall 8: isNoContent para DELETE

**What goes wrong:** `DELETE /api/v1/fees/rules/{id}` retorna 204 No Content. Tratar como erro se `response.data` for null.
**Why it happens:** `isSuccess(response)` inclui 200, 201, 204. `response.data` será null em 204.
**How to avoid:** No repositório, checar `isSuccess(response) || isNoContent(response)` para o delete, ou simplesmente verificar `response.status === 204`. O `apiResponse.ts` exporta `isNoContent`.

---

## Code Examples

### Conversão em Tempo Real (D-03)

```svelte
<!-- Dentro do FeeRuleSheet.svelte — padrão $derived Svelte 5 -->
<script lang="ts">
  let percentFloat = $state(0);       // Ex: 2.5 (valor % editado pelo usuário)
  let reaisFloat   = $state(0);       // Ex: 1.50 (valor R$ editado pelo usuário)

  // Display hints — não enviar estes valores
  const basisPointsHint = $derived(Math.round(percentFloat * 100));
  const centavosHint    = $derived(Math.round(reaisFloat * 100));
</script>

<div class="form-field">
  <label class="form-label" for="percent">Percentual</label>
  <Input id="percent" type="number" step="0.01" bind:value={percentFloat} placeholder="2.5" />
  {#if percentFloat > 0}
    <span style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8);">
      ℹ️ = {basisPointsHint} basis points
    </span>
  {/if}
</div>

<div class="form-field">
  <label class="form-label" for="fixed">Valor Fixo (R$)</label>
  <Input id="fixed" type="number" step="0.01" bind:value={reaisFloat} placeholder="1.50" />
  {#if reaisFloat > 0}
    <span style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8);">
      ℹ️ = {centavosHint} centavos
    </span>
  {/if}
</div>
```

### Pré-preenchimento ao Editar

```typescript
// Ao abrir sheet com editingRule !== null
$effect(() => {
  if (open && editingRule) {
    percentFloat = editingRule.percentageRate / 100;  // 250 → 2.50
    reaisFloat   = editingRule.fixedAmount   / 100;   // 350 → 3.50
    minReais = editingRule.minFee != null ? editingRule.minFee / 100 : null;
    maxReais = editingRule.maxFee != null ? editingRule.maxFee / 100 : null;
    feeType     = editingRule.feeType;
    calculation = editingRule.calculation;
  } else if (open && !editingRule) {
    resetForm();
  }
});
```

### FeeRepository — listRules (paginado)

```typescript
// Padrão DisputeRepository com adaptação para shape paginada
async listRules(page: number, pageSize: number): Promise<Either<Failure, PaginatedFeeRules>> {
  try {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const response = await apiClient.get<unknown>(`${API_PATHS.FEES_RULES}?${query}`);
    if (isSuccess(response) && response.data) {
      const raw = response.data as { items: FeeRule[]; total: number; page: number; pageSize: number };
      return right(raw);
    }
    if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
    return left(new ServerFailure(response.message, response.extendedResultCode));
  } catch {
    return left(new NetworkFailure());
  }
}
```

### FeeRepository — deleteRule (204 No Content)

```typescript
async deleteRule(id: string): Promise<Either<Failure, void>> {
  try {
    const response = await apiClient.delete<unknown>(API_PATHS.FEES_RULE(id));
    if (isSuccess(response) || isNoContent(response)) return right(undefined);
    if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
    return left(new ServerFailure(response.message, response.extendedResultCode));
  } catch {
    return left(new NetworkFailure());
  }
}
```

### Role Guard — Ocultar Ações para VIEWER/SUPPORT

```svelte
<!-- Padrão confirmado: ocultar do DOM, não desabilitar -->
<!-- DisputeDetailPage usa {#if isSupport && !isAlreadyResolved} -->
<script lang="ts">
  import { tokenStorage } from '$appmod/services/storage/tokenStorage';
  import { hasPermission } from '$appmod/shared/guards/adminGuard';
  import type { AdminRole } from '$appmod/shared/guards/adminGuard';

  const role = tokenStorage.getAdminRole() as AdminRole | null;
  const canMutate = $derived(hasPermission(role, 'ADMIN'));
</script>

{#if canMutate}
  <Button onclick={() => ctrl.openCreate()}>+ Nova Regra Global</Button>
{/if}
```

### ConfirmDialog para Exclusão (D-05)

```svelte
<ConfirmDialog
  bind:open={ctrl.state.confirmDeleteOpen}
  title="Excluir Regra de Taxa"
  description="Esta ação não pode ser desfeita."
  confirmLabel="Excluir"
  destructive={true}
  requiresReason={false}
  onconfirm={() => ctrl.deleteRule()}
  oncancel={() => ctrl.closeDeleteConfirm()}
/>
```

### Simulador — POST /api/v1/fees/simulate

```typescript
// No controller
async function runSimulate() {
  if (!state.simFeeType || !state.simAmount) return;
  state.simLoading = true;
  state.simError = null;
  const payload: SimulateFeePayload = {
    feeType: state.simFeeType as FeeType,
    amount: Math.round(parseFloat(state.simAmount) * 100),   // R$ → centavos
    merchantId: state.simMerchantId || null,
  };
  const result = await service.simulate(payload);
  if (result.ok) {
    state.simResult = result.value;
  } else {
    state.simError = result.failure.message;
  }
  state.simLoading = false;
}
```

---

## Enums e Labels (pt-BR)

```typescript
// Para usar nos dropdowns do formulário e simulador
export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  PIX:          'PIX',
  BOLETO:       'Boleto',
  CREDIT_CARD:  'Cartão de Crédito',
  DEBIT_CARD:   'Cartão de Débito',
  WITHDRAWAL:   'Saque',
  ANTICIPATION: 'Antecipação',
};

export const CALCULATION_LABELS: Record<Calculation, string> = {
  PERCENTAGE:            'Percentual',
  FIXED:                 'Fixo',
  PERCENTAGE_PLUS_FIXED: 'Percentual + Fixo',
};
```

---

## State of the Art

| Old Approach | Current Approach | Relevância para Phase 5 |
|--------------|------------------|------------------------|
| Svelte 4 `$: derived = ...` | Svelte 5 `const x = $derived(...)` | Conversão tempo real D-03 usa `$derived` |
| Svelte stores para estado de form | `$state` local no controller ou Sheet | Sheet tem estado interno próprio |
| `onValueChange` retorna string | `onValueChange={(v) => v && (field = v as Type)}` | Padrão confirmado para Select.Root em Phase 2 |
| `@tanstack/svelte-table` | `@tanstack/table-core` (não svelte-table) | DataTable já usa table-core — não mudar |

**Deprecated/outdated:**
- `@tanstack/svelte-table`: quebrado no Svelte 5 — confirmado em STATE.md. Usar `@tanstack/table-core` (já em uso).

---

## Open Questions

1. **listMerchantRules retorna apenas regras ativas?**
   - O que sabemos: §5.7.5 diz "Retorna lista de FeeRuleResponse **ativas** para aquele merchant (incluindo globais e específicas)".
   - O que não está claro: Se o endpoint retorna um array direto ou envelope `{ data: [] }`.
   - Recomendação: Implementar com `Array.isArray(raw)` guard igual ao DisputeRepository — tratar os dois casos. Se raw for array, usar diretamente; se for envelope, extrair `.items ?? raw`.

2. **Validação de campos condicionais por tipo de cálculo**
   - O que sabemos: `PERCENTAGE` → só percentageRate importa; `FIXED` → só fixedAmount importa; `PERCENTAGE_PLUS_FIXED` → ambos.
   - O que não está claro: O backend valida isso ou aceita qualquer combinação?
   - Recomendação: Aplicar validação visual (mostrar/ocultar campos de input dependendo do `calculation` selecionado) mas enviar ambos os valores (mesmo que 0) para simplicidade. A conversão já está documentada — `Math.round(0 * 100) = 0` é válido.

---

## Environment Availability

Step 2.6: SKIPPED — esta fase é puramente frontend, sem dependências externas além do projeto já configurado. Todo o stack (Node.js, npm, SvelteKit, shadcn-svelte, @tanstack/table-core) está confirmado como operacional pelas fases anteriores concluídas com sucesso.

---

## Validation Architecture

`workflow.nyquist_validation: true` — seção obrigatória.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest@2.1.9 + @vitest/coverage-v8@2.1.9 |
| Config file | `vite.config.ts` (integrado) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

**Nota:** REQUIREMENTS.md §"Out of Scope" lista "Testes automatizados: Sem framework configurado; fora do escopo v1". O vitest está instalado (STATE.md Plan 01-01) mas a política do projeto é não escrever testes para features v1. Os planos desta fase **não devem criar arquivos de teste** — a verificação é manual (success criteria no ROADMAP).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Status |
|--------|----------|-----------|--------|
| FEES-01 | Duas tabs: Global (merchantId==null) e Por Merchant visualmente distintas | manual | Fora do escopo v1 |
| FEES-02 | Formulário cria/edita com conversão correta de unidades | manual | Fora do escopo v1 |
| FEES-03 | Dialog de confirmação exclui regra, regra some da lista | manual | Fora do escopo v1 |
| FEES-04 | Simulador exibe bruto/taxa/líquido + ruleId aplicado | manual | Fora do escopo v1 |

### Wave 0 Gaps

Nenhum — o projeto não usa testes para features v1. "Testes automatizados: fora do escopo v1" (REQUIREMENTS.md).

---

## Project Constraints (from CLAUDE.md)

`CLAUDE.md` não existe no diretório do projeto. Restrições derivadas de `docs/StyleGuide.md` (referenciada em MEMORY.md como regra ativa) e de convenções documentadas:

1. **Design System:** Usar tokens CSS de `app.css` (`--color-surface`, `--color-foreground`, `--color-border`, `--font-display`, `--font-mono`, `--radius-*`, `--shadow-*`). Nunca usar hex hardcoded sem fallback para token.
2. **Inline styles:** Padrão do projeto é inline style attributes (não classes Tailwind) para componentes que não usam shadcn. Ver AdminLayout, DisputesListPage, etc.
3. **Strings pt-BR:** Todas as strings de UI em português brasileiro.
4. **Sem enums TypeScript:** Usar string unions (`'PIX' | 'BOLETO' | ...`), não `enum FeeType`.
5. **Sem barrel files / index.ts:** Importar direto pelo caminho completo.
6. **Imports**: Ordem — SvelteKit → `$core` → `$appmod` → relativos.
7. **Erros de API:** Sempre via `Either<Failure, T>` — nunca `throw` na camada de repositório.
8. **`type="single"`** em `<Select.Root>` — obrigatório para evitar erro de TypeScript com bits-ui.
9. **`:global(.classname)`** para estilizar interior de componentes shadcn com `class` prop.
10. **Role guard:** DOM exclusion pattern (`{#if canMutate}`) — nunca `disabled` para esconder ações restritas.

---

## Sources

### Primary (HIGH confidence — lido diretamente no codebase)

- `docs/FRONTEND_ADMIN_DOC.md` §5.7 — API contracts completos para todos os endpoints de fees (lido linhas 1133-1261)
- `docs/FRONTEND_ADMIN_DOC.md` §8 — RBAC table confirmando VIEWER+: listar/simular; ADMIN+: criar/editar/excluir (linha 1793-1795)
- `src/core/constants/apiPaths.ts` — endpoints FEES_* já todos configurados (confirmado)
- `src/app/shared/widgets/DataTable.svelte` — interface e uso (lido completo)
- `src/app/shared/widgets/ConfirmDialog.svelte` — props: open, title, description, confirmLabel, cancelLabel, destructive, requiresReason, onconfirm, oncancel (lido completo)
- `src/app/features/merchants/presentation/components/CreateMerchantSheet.svelte` — padrão Sheet de referência (lido completo)
- `src/app/features/disputes/presentation/controllers/disputeListController.svelte.ts` — padrão controller (lido completo)
- `src/app/features/disputes/data/repositories/DisputeRepository.ts` — padrão repository (lido completo)
- `src/lib/components/ui/tabs/index.ts` — exports confirmados: Root, List, Trigger, Content (lido)
- `src/lib/components/ui/sheet/` — todos os sub-componentes presentes (confirmado via filesystem)
- `src/app/shared/widgets/filters/SelectFilter.svelte` — props confirmados (lido completo)
- `src/app/features/transactions/shared/components/MerchantAutocomplete.svelte` — props: value, onChange (lido 80 linhas)
- `src/app/shared/guards/adminGuard.ts` — hasPermission, AdminRole, ROLE_LEVELS (lido completo)
- `src/app/shared/utils/formatters.ts` — formatCurrency, formatBasisPoints confirmados (lido completo)
- `src/app.css` — todos os CSS custom property tokens (lido)
- `.planning/STATE.md` — decisões críticas das fases anteriores, incluindo Select type="single" e :global() pattern (lido)
- `.planning/codebase/ARCHITECTURE.md` — Clean Architecture por feature (lido completo)
- `.planning/codebase/CONVENTIONS.md` — naming patterns, Svelte 5 runes, estrutura de arquivos (lido completo)
- `src/app/shared/widgets/AdminLayout.svelte` — "Taxas" já na sidebar (grep confirmado na linha 40)

### Secondary (MEDIUM confidence)

- REQUIREMENTS.md — "Testes automatizados: fora do escopo v1" — orienta decisão de não criar testes
- ROADMAP.md — Phase 5 depends on Phase 1 only (não Phase 2, 3, 4)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — todos os componentes verificados diretamente no filesystem e no código-fonte
- Architecture: HIGH — padrão exato documentado em 4 fases anteriores concluídas com sucesso
- API contracts: HIGH — lido diretamente de `docs/FRONTEND_ADMIN_DOC.md` §5.7
- Pitfalls: HIGH — derivados de decisões documentadas em STATE.md e de análise do código real
- RBAC: HIGH — tabela oficial em §8 do doc

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stack estável — shadcn-svelte, Svelte 5, @tanstack/table-core sem mudanças esperadas)
