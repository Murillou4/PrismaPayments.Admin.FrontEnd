# Phase 4: Disputes — Research

**Researched:** 2026-04-15
**Domain:** SvelteKit 5 + Clean Architecture — disputes list with MED highlight, dispute detail page with visual timeline, SUPPORT+ resolution form
**Confidence:** HIGH (all findings from direct codebase inspection — no external API queries needed)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Filtros sempre visíveis acima da tabela (mesmo padrão Phase 2 D-07 e Phase 3 D-02)
- **D-02:** Filtros: status (select: OPEN/UNDER_REVIEW/ACCEPTED/REJECTED/RESOLVED) + tipo (select: MED/CHARGEBACK/REFUND_REQUEST)
- **D-03:** MerchantAutocomplete disponível como filtro opcional — incluir se endpoint suportar `merchantId` como query param
- **D-04:** Colunas: ID (truncado), Merchant (link), Tipo (badge + destaque MED), Status (StatusBadge), Valor (R$), Data abertura
- **D-05:** Rows com `disputeType === "MED"` recebem border-left 3px sólido (#FF3B5C) + badge MED com cor de urgência
- **D-06:** Fundo da row NÃO muda — apenas faixa lateral + badge
- **D-07:** Timeline com 3 steps sempre presentes: Aberta → Em Análise → Resolvida
- **D-08:** Timestamps: "Aberta" = `openedAt`; "Em Análise" = sem data; "Resolvida" = `resolvedAt` quando não-null
- **D-09:** Concluídos: círculo preenchido + cor ativa. Atual: highlighted. Futuros: vazio + neutro
- **D-10:** Não usar `updatedAt` como proxy para timestamp de "Em Análise"
- **D-11:** Página dedicada `/disputes/:id`
- **D-12:** Layout cards empilhados: (1) Informações da Disputa, (2) Timeline, (3) Pagamento Relacionado, (4) Formulário Resolução
- **D-13:** Formulário resolução: dropdown status (`ACCEPTED | REJECTED | RESOLVED`) + textarea — ambos obrigatórios antes de habilitar submit
- **D-14:** Formulário de resolução OCULTO (não desabilitado) para VIEWER
- **D-15:** Breadcrumbs: Disputas > #abc12345 (8 chars)
- **D-16:** SEM chamada extra de API — exibir `paymentId` truncado como link para `/transactions/payments/:id`
- **D-17:** DISP-01 a DISP-04 não exigem dados do pagamento embutidos

### Claude's Discretion

- Cor exata do border-left MED — UI-SPEC escolheu `#FF3B5C` (danger) para consistência com StatusBadge MED existente
- Larguras de colunas e ordenação padrão (openedAt DESC)
- Skeleton layout durante carregamento do detalhe
- Truncamento do ID nos breadcrumbs — 8 chars (Phase 3 pattern)
- Comportamento pós-submit — UI-SPEC definiu: redirect para `/disputes` (evita stale data)

### Deferred Ideas (OUT OF SCOPE)

- Indicador de aging de disputas (tempo em aberto desde `openedAt`) — V2-02
- Buscar dados do pagamento embutidos no detalhe (D-16/D-17)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DISP-01 | Lista paginada de disputas com filtros por status e tipo | `GET /api/v1/admin/disputes` aceita `status`, `disputeType`, `skip`, `limit`. `API_PATHS.ADMIN_DISPUTES` e `ADMIN_DISPUTE(id)` já existem em `apiPaths.ts`. DataTable e SelectFilter reutilizáveis diretamente. |
| DISP-02 | Timeline visual de estado (abertura → análise → resolução) | Novo componente `DisputeTimeline.svelte` a criar. Lógica: 3 steps fixos com estados derivados de `status` e `resolvedAt`. Sem dependências externas. |
| DISP-03 | Formulário de resolução com validação client-side (SUPPORT+) | `PUT /api/v1/admin/disputes/{id}` com body `{ resolution, status }`. `apiClient.put` existe e está funcional. Padrão `hasPermission(role, 'SUPPORT')` estabelecido em Phase 2. Toast via `svelte-sonner`. |
| DISP-04 | MED destacado visualmente como time-sensitive | StatusBadge já tem MED mapeado com `isMed: true` e animação `med-pulse`. DataTable precisa de novo prop `rowClass?: (row: Row<T>) => string` para border-left na row. |
</phase_requirements>

---

## Summary

Phase 4 é a mais autocontida do projeto até agora: todos os padrões, componentes e infraestrutura já existem no codebase. A feature pode ser construída quase inteiramente por composição dos padrões das Phases 2 e 3, sem novas dependências.

O trabalho novo se resume a: (1) criar a feature `disputes` com Clean Architecture padrão (domain/data/presentation), (2) adicionar o prop `rowClass` ao `DataTable.svelte` compartilhado, (3) criar `DisputeTimeline.svelte` como componente visual custom, e (4) criar `DisputeResolutionForm.svelte` com validação e chamada PUT. A rota `/disputes/[id]/+page.svelte` não existe ainda e precisa ser criada.

O `apiClient.put` já existe (confirmado em `src/app/services/api/apiClient.ts` — linha 192). Os paths `ADMIN_DISPUTES` e `ADMIN_DISPUTE(id)` já existem em `apiPaths.ts`. O StatusBadge já mapeia `MED` com danger color e pulse animation. A única modificação a um componente compartilhado é o prop `rowClass` no DataTable.

**Recomendação primária:** 2 planos — Plan 1: domain + data layer + DisputesListPage completa (substituir stub); Plan 2: DisputeDetailPage + DisputeTimeline + DisputeResolutionForm + rota `[id]`.

---

## Standard Stack

### Core (todos já instalados)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SvelteKit + Svelte 5 | runes | Framework, roteamento, SSR | Stack do projeto |
| @tanstack/table-core | instalado | DataTable headless | Decisão Phase 1 (não `@tanstack/svelte-table` — quebrado no Svelte 5) |
| svelte-sonner | instalado | Toast notifications (`toast.success`, `toast.error`) | Decisão Phase 1 |
| lucide-svelte | instalado | Ícones (AlertCircle, ArrowLeft, CheckCircle2, etc.) | StyleGuide + toda a codebase |
| shadcn-svelte@1.2.3 | instalado | Button, Select, Badge, Table | Decisão Phase 01.1 (preset: new-york/zinc) |
| bits-ui | instalado | Primitivas Select, Dialog | Via shadcn-svelte |
| axios (via apiClient) | instalado | HTTP client com interceptors de refresh/retry | Decisão Phase 1 |

### Sem novas instalações

UI-SPEC confirma: "No new shadcn components needed for this phase."

### Aliases de import

```typescript
$appmod  →  src/app        (features, shared, services)
$core    →  src/core       (constants, error, config)
$lib     →  src/lib        (shadcn components)
```

---

## Architecture Patterns

### Estrutura de diretórios a criar

```
src/app/features/disputes/
├── domain/
│   ├── entities/
│   │   └── Dispute.ts                          # tipos + interfaces
│   └── repositories/
│       └── IDisputeRepository.ts               # contrato
├── data/
│   └── repositories/
│       └── DisputeRepository.ts                # impl concreta via apiClient
├── services/
│   └── DisputeService.ts                       # orchestration layer
└── presentation/
    ├── controllers/
    │   ├── disputeListController.svelte.ts
    │   └── disputeDetailController.svelte.ts
    ├── pages/
    │   ├── DisputesListPage.svelte             # substitui stub existente
    │   └── DisputeDetailPage.svelte            # nova
    └── components/
        ├── DisputeTimeline.svelte               # novo — 3-step visual
        └── DisputeResolutionForm.svelte         # novo — SUPPORT+ form
```

### Rotas SvelteKit

```
src/routes/(admin)/disputes/
├── +page.svelte          # JA EXISTE — importa DisputesListPage
└── [id]/
    └── +page.svelte      # NAO EXISTE — criar; importa DisputeDetailPage
```

### Pattern 1: Domain Entity

```typescript
// Dispute.ts
export type DisputeType   = 'MED' | 'CHARGEBACK' | 'REFUND_REQUEST';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED';

export interface Dispute {
  id: string;
  paymentId: string;
  merchantId: string;
  disputeType: DisputeType;
  status: DisputeStatus;
  amount: number;           // centavos — usar formatCurrency()
  reason: string | null;
  resolution: string | null;
  externalId: string | null;
  openedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDisputes {
  items: Dispute[];
  total: number;
  skip: number;
  limit: number;
}

export interface ListDisputesParams {
  page?: number;
  limit?: number;
  status?: DisputeStatus | '';
  disputeType?: DisputeType | '';
  merchantId?: string;
}

export interface ResolveDisputePayload {
  resolution: string;
  status: 'ACCEPTED' | 'REJECTED' | 'RESOLVED';
}
```

### Pattern 2: Repository (modelo de PaymentRepository)

```typescript
// DisputeRepository.ts
export class DisputeRepository implements IDisputeRepository {
  async listDisputes(params: ListDisputesParams): Promise<Either<Failure, PaginatedDisputes>> {
    try {
      const query = new URLSearchParams();
      const page  = params.page  ?? 1;
      const limit = params.limit ?? 20;
      query.set('skip',  String((page - 1) * limit));
      query.set('limit', String(limit));
      if (params.status)      query.set('status',      params.status);
      if (params.disputeType) query.set('disputeType', params.disputeType);
      if (params.merchantId)  query.set('merchantId',  params.merchantId);
      const url = `${API_PATHS.ADMIN_DISPUTES}?${query.toString()}`;
      const response = await apiClient.get<PaginatedDisputes>(url);
      if (isSuccess(response) && response.data) return right(response.data);
      if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
      return left(new ServerFailure(response.message, response.extendedResultCode));
    } catch {
      return left(new NetworkFailure());
    }
  }

  async getById(id: string): Promise<Either<Failure, Dispute>> {
    try {
      const response = await apiClient.get<Dispute>(API_PATHS.ADMIN_DISPUTE(id));
      if (isSuccess(response) && response.data) return right(response.data);
      if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
      return left(new ServerFailure(response.message, response.extendedResultCode));
    } catch {
      return left(new NetworkFailure());
    }
  }

  async resolveDispute(id: string, payload: ResolveDisputePayload): Promise<Either<Failure, Dispute>> {
    try {
      const response = await apiClient.put<Dispute>(API_PATHS.ADMIN_DISPUTE(id), payload);
      if (isSuccess(response) && response.data) return right(response.data);
      if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
      return left(new ServerFailure(response.message, response.extendedResultCode));
    } catch {
      return left(new NetworkFailure());
    }
  }
}
```

**Confirmado:** `apiClient.put<T>(path, body)` existe em `src/app/services/api/apiClient.ts` linha 192.
**Confirmado:** `API_PATHS.ADMIN_DISPUTES` e `API_PATHS.ADMIN_DISPUTE(id)` já existem em `apiPaths.ts`.

### Pattern 3: Controller (Svelte 5 runes — modelo de paymentListController)

```typescript
// disputeListController.svelte.ts
export function createDisputeListController() {
  const service = new DisputeService(new DisputeRepository());

  let state = $state<DisputeListState>({
    disputes: [],
    total: 0,
    page: 1,
    limit: 20,
    status: '',
    disputeType: '',
    merchantId: '',
    loading: true,
    error: null,
  });

  async function loadDisputes() {
    state.loading = true;
    state.error = null;
    const params: ListDisputesParams = { page: state.page, limit: state.limit };
    if (state.status)      params.status      = state.status as DisputeStatus;
    if (state.disputeType) params.disputeType = state.disputeType as DisputeType;
    if (state.merchantId)  params.merchantId  = state.merchantId;
    const result = await service.listDisputes(params);
    if (result.ok) {
      state.disputes = result.value.items;
      state.total    = result.value.total;
    } else {
      state.error = result.failure.message;
    }
    state.loading = false;
  }

  // setters: setStatus, setType, setMerchant, setPage — cada um reseta page=1 e chama loadDisputes()

  return { get state() { return state; }, loadDisputes, setStatus, setType, setMerchant, setPage };
}
```

### Pattern 4: Role Guard (padrão estabelecido em Phase 2)

```typescript
// Rota src/routes/(admin)/disputes/[id]/+page.svelte:
import { tokenStorage } from '$appmod/services/storage/tokenStorage';
const role = tokenStorage.getAdminRole();
// <DisputeDetailPage disputeId={id} {role} />

// No DisputeDetailPage.svelte:
import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
let { disputeId, role }: { disputeId: string; role: string | null } = $props();
const isSupport = $derived(hasPermission(role as AdminRole, 'SUPPORT'));

// Guard para formulário — OCULTO (não desabilitado) para VIEWER (D-14):
{#if isSupport && !isAlreadyResolved}
  <DisputeResolutionForm ... />
{/if}
```

**Confirmado:** O padrão é prop, não `getContext`. A rota `+page.svelte` chama `tokenStorage.getAdminRole()` e passa como prop. Verificado em `src/routes/(admin)/merchants/+page.svelte`.

### Pattern 5: DataTable rowClass prop (modificação no componente compartilhado)

O DataTable atual não tem `rowClass`. A modificação é pequena e cirúrgica:

```typescript
// DataTable.svelte — adicionar ao interface Props:
rowClass?: (row: Row<T>) => string;

// No template, adicionar ao Table.Row:
<Table.Row
  class={rowClass?.(row) ?? ''}
  style="border-bottom: ..."
>
```

```svelte
<!-- DisputesListPage.svelte — usar o prop: -->
<DataTable
  {columns}
  data={ctrl.state.disputes}
  rowClass={(row) => row.original.disputeType === 'MED' ? 'dispute-row--med' : ''}
  ...
/>
```

```css
/* CSS em DisputesListPage.svelte ou app.css: */
:global(.dispute-row--med) {
  border-left: 3px solid #FF3B5C !important;
  animation: med-row-pulse 1.5s ease-in-out infinite;
}
@keyframes -global-med-row-pulse {
  0%, 100% { border-left-color: rgba(255,59,92,0.60); }
  50%       { border-left-color: rgba(255,59,92,1.00); }
}
```

**Atenção:** O shadcn `Table.Row` aceita `class` via `cn()` helper internamente (bits-ui pattern). Verificar se o componente atual encaminha a `class` para o elemento HTML — se não, usar `style` com CSS inline como fallback.

### Pattern 6: DisputeTimeline Component

```typescript
// Lógica de estado dos steps (D-08 + D-09):
const TERMINAL_STATUSES: DisputeStatus[] = ['ACCEPTED', 'REJECTED', 'RESOLVED'];
const ANALYSIS_STATUSES: DisputeStatus[] = ['UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'RESOLVED'];

// Deriveds:
// step1 (Aberta):    sempre completed = true
// step2 (Em Análise): active quando status está em ANALYSIS_STATUSES; completed quando está em TERMINAL_STATUSES
// step3 (Resolvida):  completed quando resolvedAt !== null

// Cores (UI-SPEC):
// Completed circle:  #01FAFB (cyan)
// Current circle:    #FF00FF (magenta) + glow-magenta
// Future circle:     rgba(255,255,255,0.08) = var(--color-border)
// Connector:         2px solid (completed), 2px dashed (future)
// Step label:        12px Outfit 400 uppercase letter-spacing 0.05em #9090A8
// Timestamp:         12px Outfit 400 #9090A8
// Circle size:       24px diameter
// Connector height:  32px (espaço fixo entre circles)
```

**Layout horizontal (desktop) / vertical (mobile):**
```
[●]──────────────[●]──────────────[○]
Aberta           Em Análise       Resolvida
{openedAt}       (sem data)       {resolvedAt ou —}
```

### Pattern 7: DisputeResolutionForm

```svelte
<!-- Validação client-side — submit habilitado apenas quando ambos preenchidos: -->
const canSubmit = $derived(
  resolveStatus !== '' && resolution.trim().length > 0
);

<!-- Estado de submissão: -->
let submitting = $state(false);

async function handleSubmit() {
  if (!canSubmit || submitting) return;
  submitting = true;
  await onResolve({ status: resolveStatus, resolution: resolution.trim() });
  submitting = false;
}
```

**Opções do dropdown (status de resolução):**
```typescript
const RESOLVE_OPTIONS = [
  { value: 'ACCEPTED',  label: 'Aceita' },
  { value: 'REJECTED',  label: 'Rejeitada' },
  { value: 'RESOLVED',  label: 'Resolvida' },
];
```

**Post-submit:** `toast.success('Disputa resolvida com sucesso.')` → `goto('/disputes')`.
**On error:** `toast.error('Erro ao salvar resolução. Tente novamente.')` → re-enable fields.

### Pattern 8: StatusBadge — adicionar ACCEPTED

```typescript
// StatusBadge.svelte — STATUS_MAP precisa de ACCEPTED:
ACCEPTED: { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
// (verde success — disputa aceita = resolvida favoravelmente)
```

**Confirmado:** ACCEPTED não está no STATUS_MAP atual. Todas as outras DisputeStatus já têm mapeamento: OPEN=warning, UNDER_REVIEW=warning, REJECTED=danger, RESOLVED=success.

### Anti-Patterns to Avoid

- **Não usar `updatedAt` como proxy de timestamp para "Em Análise":** `updatedAt` muda ao resolver também (D-10)
- **Não desabilitar o formulário para VIEWER:** deve ser completamente ausente do DOM — `{#if isSupport}` (D-14)
- **Não mostrar o formulário para disputa já resolvida:** `isAlreadyResolved = ['ACCEPTED','REJECTED','RESOLVED'].includes(dispute.status)`
- **Não fazer segunda chamada de API para buscar dados do pagamento:** exibir apenas `paymentId` como link (D-16)
- **Não usar `@tanstack/svelte-table`:** quebrado no Svelte 5; usar `@tanstack/table-core` diretamente
- **Não instalar nova dependência:** não há justificativa para novas libs nesta fase

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast feedback | Custom component | `toast.success/error()` de `svelte-sonner` | Já instalado, padrão Phase 1 |
| Paginação | HTML manual | DataTable + Pagination.svelte | Componente genérico com lógica interna |
| Formatação moeda | Intl manual | `formatCurrency()` em `formatters.ts` | Cobre centavos → R$, testado |
| Formatação data | date-fns | `formatDate()` em `formatters.ts` | Já existe |
| Status badge | Badge custom | `StatusBadge.svelte` (só adicionar ACCEPTED) | Mapeamento completo de status |
| Select filter | Select nativo | `SelectFilter.svelte` | Estilo Prisma, já usado em Phase 2+3 |
| Merchant search | Autocomplete manual | `MerchantAutocomplete.svelte` | Reutilizável de transactions feature |
| Navegação pós-submit | window.location | `goto('/disputes')` do SvelteKit | Roteamento client-side nativo |
| Ícones | SVG inline | `lucide-svelte` | Padrão do projeto |
| HTTP PUT | fetch manual | `apiClient.put(path, body)` | Interceptors de refresh/retry já configurados |
| Breadcrumbs | HTML manual | `Breadcrumbs.svelte` | Componente com estilo Space Grotesk já definido |

---

## Common Pitfalls

### Pitfall 1: API response shape de disputas pode não ter envelope paginado

**O que pode dar errado:** A documentação (§5.6.1) mostra `{ data: [...] }` — array direto, sem `{ items, total, skip, limit }`. Se o repository tentar acessar `response.data.items`, recebe `undefined`.

**Por que acontece:** A API de pagamentos (`PaginatedPayments`) usa envelope, mas a API de disputas pode não. Docs foram escritos antes do endpoint ser padronizado.

**Como evitar:** No repositório, detectar o shape: se `response.data` é array, wrappear como `{ items: data, total: data.length, skip: 0, limit: data.length }`. Se já tem `.items`, usar diretamente. Confirmar em dev antes de finalizar.

**Fallback concreto:**
```typescript
const raw = response.data as unknown;
const items = Array.isArray(raw) ? raw as Dispute[] : (raw as PaginatedDisputes).items;
const total = Array.isArray(raw) ? items.length : (raw as PaginatedDisputes).total;
```

### Pitfall 2: Table.Row não propaga `class` em shadcn-svelte

**O que pode dar errado:** Ao passar `class="dispute-row--med"` para `Table.Row`, a classe não chega ao elemento `<tr>` HTML porque o shadcn wrapper não encaminha `class` via `$$props` ou `...restProps`.

**Por que acontece:** Implementações shadcn-svelte v1.x variam no suporte a `class` forwarding em componentes Table.

**Como evitar:** Ao implementar o `rowClass` prop no DataTable, verificar o componente `src/lib/components/ui/table/table-row.svelte`. Se não suportar `class`, usar `style` com `border-left` inline como prop adicional (`rowStyle?: (row) => string`) ou injetar diretamente no `onmouseenter/leave` handlers.

### Pitfall 3: Controller `.svelte.ts` importado em contexto não-Svelte

**O que pode dar errado:** Arquivo `disputeListController.svelte.ts` usa `$state` — se importado fora de um componente Svelte (ex: em `+page.server.ts`), o Svelte compiler não processa as runes e o código quebra.

**Por que acontece:** Runes só funcionam dentro do contexto de compilação Svelte.

**Como evitar:** Controllers `.svelte.ts` são instanciados apenas dentro de `<script>` de um `.svelte` component — nunca importados em rotas `.ts` ou `.server.ts`.

### Pitfall 4: Role guard via prop vs. getContext

**O que pode dar errado:** `DisputeDetailPage` usa `getContext('adminRole')` mas o contexto não foi setado na sua hierarquia, retornando `null` silenciosamente.

**Por que acontece:** O contexto `adminRole` é setado em `src/routes/(admin)/+layout.svelte`, mas `getContext` pode não ser chamado corretamente em componentes filhos profundos.

**Como evitar:** Seguir o padrão estabelecido — **pass role as prop, not via getContext**. A rota `[id]/+page.svelte` chama `tokenStorage.getAdminRole()` e passa como prop para `DisputeDetailPage`. Confirmado em `src/routes/(admin)/merchants/+page.svelte` (linha 6).

### Pitfall 5: Formulário exibido para disputa já resolvida

**O que pode dar errado:** SUPPORT abre disputa com status `RESOLVED` e vê o formulário de resolução — poderia tentar fazer double-resolve.

**Por que acontece:** Guard de role (isSupport) é necessário mas não suficiente — precisa também verificar o status atual.

**Como evitar:**
```svelte
{#if isSupport && !['ACCEPTED', 'REJECTED', 'RESOLVED'].includes(dispute.status)}
  <DisputeResolutionForm ... />
{/if}
```

---

## Code Examples (verified from codebase)

### List page structure (modelo de PaymentsListPage.svelte)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { ColumnDef, Row } from '@tanstack/table-core';
  import { createDisputeListController } from '../controllers/disputeListController.svelte';
  import DataTable from '$appmod/shared/widgets/DataTable.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import SelectFilter from '$appmod/shared/widgets/filters/SelectFilter.svelte';
  import MerchantAutocomplete from '$appmod/features/transactions/shared/components/MerchantAutocomplete.svelte';
  import { formatCurrency, formatDate } from '$appmod/shared/utils/formatters';
  import type { Dispute } from '../domain/entities/Dispute';

  let { role }: { role: string | null } = $props();
  const ctrl = createDisputeListController();

  onMount(() => ctrl.loadDisputes());

  function handleRowClick(row: Row<Dispute>) {
    goto(`/disputes/${row.original.id}`);
  }
</script>
```

### Detail page route shell (novo arquivo)

```svelte
<!-- src/routes/(admin)/disputes/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { tokenStorage } from '$appmod/services/storage/tokenStorage';
  import DisputeDetailPage from '$appmod/features/disputes/presentation/pages/DisputeDetailPage.svelte';

  const role = tokenStorage.getAdminRole();
  const disputeId = $page.params.id;
</script>

<DisputeDetailPage {disputeId} {role} />
```

### Toast import pattern

```typescript
import { toast } from 'svelte-sonner';
// Uso:
toast.success('Disputa resolvida com sucesso.');
toast.error('Erro ao salvar resolução. Tente novamente.');
```

### Server-side pagination pattern (de PaymentsListPage)

```svelte
<!-- Abaixo do DataTable, quando total > limit: -->
{#if ctrl.state.total > ctrl.state.limit}
  <div class="pagination">
    <Button variant="outline" disabled={ctrl.state.page === 1}
      onclick={() => ctrl.setPage(ctrl.state.page - 1)}>Anterior</Button>
    <span class="page-info">Pagina {ctrl.state.page} · {ctrl.state.total} resultados</span>
    <Button variant="outline" disabled={ctrl.state.page * ctrl.state.limit >= ctrl.state.total}
      onclick={() => ctrl.setPage(ctrl.state.page + 1)}>Proxima</Button>
  </div>
{/if}
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| `@tanstack/svelte-table` | `@tanstack/table-core` direto | `svelte-table` quebrado no Svelte 5 — decisão Phase 1 |
| `$: reactive` | `$state`, `$derived`, `$effect` | Svelte 5 runes — toda codebase usa |
| `on:click` | `onclick={...}` | Svelte 5 event handlers sem diretiva `on:` |
| `export let prop` | `let { prop }: Props = $props()` | Svelte 5 props pattern |
| `<svelte:component>` | importação direta | Svelte 5 — sem dynamic component wrapper |

---

## Environment Availability

Step 2.6: SKIPPED — Phase 4 é puramente code/config, sem dependências externas além das já instaladas no projeto.

---

## Validation Architecture

`nyquist_validation: true` em `.planning/config.json`. No entanto, REQUIREMENTS.md declara explicitamente "Testes automatizados | Sem framework configurado; fora do escopo v1" na tabela Out of Scope. O `vitest.config.ts` existe com configuração básica (jsdom), mas não há testes de feature (apenas `src/lib/rbac/__tests__/rbac.test.ts`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest@2.1.9 (pinado, instalado) |
| Config file | `vitest.config.ts` (raiz) |
| Quick run command | `npx vitest run src/lib/rbac` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated? | Notes |
|--------|----------|-----------|------------|-------|
| DISP-01 | Lista paginada de disputas com filtros | visual/smoke | Manual only | Sem testes de componente configurados |
| DISP-02 | Timeline visual 3 steps | visual | Manual only | Lógica de estado simples — sem testes de browser |
| DISP-03 | Formulário resolução — validação client-side + submit | smoke | Manual only | Out of scope v1 |
| DISP-04 | MED row highlight | visual | Manual only | Verificação visual necessária |

### Wave 0 Gaps

Nenhum — a política do projeto é sem testes automatizados de feature para v1. A validação é manual (verificar lista, detalhe, e submit no browser). Os critérios de aceitação das success criteria do ROADMAP.md funcionam como checklist de smoke test manual.

---

## Open Questions

1. **Shape da response da API de disputas**
   - O que sabemos: docs §5.6.1 mostra `{ data: [...] }` — array direto, sem envelope paginado `{ items, total, skip, limit }`
   - O que não está claro: o endpoint real retorna o mesmo shape que pagamentos (com envelope) ou array puro?
   - Recomendação: ao implementar o repository, tratar ambos os casos (ver Pitfall 1 acima). Confirmar na primeira execução em dev.

2. **O `Table.Row` do shadcn-svelte encaminha `class` prop?**
   - O que sabemos: O componente está em `src/lib/components/ui/table/`. Não inspecionado diretamente.
   - Recomendação: O executor deve ler `src/lib/components/ui/table/table-row.svelte` antes de implementar o `rowClass` prop no DataTable. Se `class` não é encaminhada, usar `style` com border-left inline como fallback.

---

## Sources

### Primary (HIGH confidence — inspeção direta do codebase)

- `src/app/services/api/apiClient.ts` — confirma `apiClient.put` existe (linha 192)
- `src/core/constants/apiPaths.ts` — confirma `ADMIN_DISPUTES` e `ADMIN_DISPUTE(id)` existem
- `src/app/shared/widgets/DataTable.svelte` — confirma ausência de `rowClass` prop; estrutura atual do componente
- `src/app/shared/widgets/StatusBadge.svelte` — confirma MED mapeado, ACCEPTED ausente, med-pulse animation existente
- `src/app/features/transactions/payments/presentation/pages/PaymentsListPage.svelte` — padrão de referência para lista
- `src/app/features/transactions/payments/presentation/pages/PaymentDetailPage.svelte` — padrão de referência para detalhe
- `src/app/features/transactions/payments/presentation/controllers/paymentListController.svelte.ts` — padrão controller
- `src/app/features/transactions/payments/data/repositories/PaymentRepository.ts` — padrão repository
- `src/routes/(admin)/+layout.svelte` — confirma role via `setContext('adminRole', role)`
- `src/routes/(admin)/merchants/+page.svelte` — confirma role passado como prop (não via getContext nos page components)
- `docs/FRONTEND_ADMIN_DOC.md §5.6` — endpoints GET + PUT de disputas, DTO, role mínimo SUPPORT

### Secondary (MEDIUM confidence)

- `.planning/phases/04-disputes/04-CONTEXT.md` — decisões arquiteturais travadas
- `.planning/phases/04-disputes/04-UI-SPEC.md` — contrato visual completo
- `.planning/codebase/ARCHITECTURE.md` — padrões Clean Architecture do projeto

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — todas as libs verificadas como instaladas no package.json/codebase
- Architecture patterns: HIGH — baseado em inspeção direta de PaymentRepository, paymentListController, PaymentsListPage, PaymentDetailPage
- API contract: MEDIUM-HIGH — documentado em §5.6, paths confirmados em apiPaths.ts; shape de response da lista é MEDIUM (possível discrepância entre docs e implementação real)
- Pitfalls: HIGH — baseados em discrepâncias reais observadas no codebase (ex: role como prop não getContext)
- UI spec: HIGH — 04-UI-SPEC.md é fonte de verdade validada

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (stack estável; risco principal é evolução da API)
