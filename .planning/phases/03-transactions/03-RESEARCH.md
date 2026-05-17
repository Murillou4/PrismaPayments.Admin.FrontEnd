# Phase 3: Transactions - Research

**Researched:** 2026-04-07
**Domain:** SvelteKit 5 + Clean Architecture -- payment & withdrawal lists with conditional detail rendering
**Confidence:** HIGH

## Summary

Phase 3 replicates the established Phase 2 (Merchants) pattern -- list page with filters + detail page -- for two sub-features: Payments and Withdrawals. The codebase already has the complete Clean Architecture stack (domain entities, repository interface, concrete repository, service, controller with Svelte 5 runes, presentation pages) proven in Phase 2. API paths are pre-configured in `apiPaths.ts`, route placeholders exist with correct imports, and shared widgets (DataTable, StatusBadge, SelectFilter, Pagination, formatCurrency) are all production-ready.

The main new work is: (1) domain entities for Payment/Withdrawal matching the API DTOs, (2) repositories and controllers following the exact MerchantRepository pattern, (3) list pages with more filters than merchants (merchant autocomplete, method select, status select, date range), (4) detail pages with conditional rendering based on payment method (PIX/Boleto/Card), (5) sidebar modification to add a collapsible "Transacoes" submenu, and (6) StatusBadge extension for new status values.

**Primary recommendation:** Follow the Merchants feature structure verbatim. The codebase has zero ambiguity about patterns -- replicate `src/app/features/merchants/` folder structure for `src/app/features/transactions/payments/` and `src/app/features/transactions/withdrawals/`. The merchant autocomplete select is the only genuinely new component.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Rotas separadas: `/transactions/payments` e `/transactions/withdrawals`
- D-02: Filtros sempre visiveis acima da tabela (mesmo padrao Phase 2 D-07)
- D-03: Status filtrado via select dropdown (sem tabs de contagem)
- D-04: Filtro de merchant como select com busca (autocomplete) -- busca por nome/documento enquanto digita
- D-05: Filtros de pagamentos: merchant (select busca), status (select), metodo (select PIX/BOLETO/CREDIT_CARD/DEBIT_CARD), periodo (date range)
- D-06: Filtros de saques: merchant (select busca), status (select REQUESTED/PROCESSING/COMPLETED/FAILED/CANCELLED), periodo (date range) -- sem filtro de metodo
- D-07: Sidebar com submenu colapsavel "Transacoes" expandindo para sub-itens Pagamentos e Saques
- D-08: Tabela de pagamentos -- 8 colunas: ID (truncado), Merchant (link), Metodo (badge), Status (StatusBadge), Valor (R$), Taxa (R$), Liquido (R$), Data
- D-09: Tabela de saques -- 8 colunas: ID (truncado), Merchant (link), Status (StatusBadge), Valor bruto (R$), Taxa (R$), Liquido (R$), Chave PIX (truncada), Data
- D-10: Layout detalhe pagamentos em cards empilhados: Info Gerais > Detalhes do Metodo > Pagador > Metadata
- D-11: Secao "Detalhes do Metodo" renderizada condicionalmente por method (PIX: qrCode copiavel, Boleto: barcode+link+vencimento, Cartao: ultimos 4 + bandeira + parcelas)
- D-12: Valores monetarios formatados via Intl.NumberFormat pt-BR (INFRA-08)
- D-13: Detalhe saques em cards empilhados: Info Gerais > Recipient (chave PIX, tipo, nome, documento)
- D-14: Coluna Merchant nas listas e link direto para `/merchants/{id}`
- D-15: Breadcrumbs nas paginas de detalhe
- D-16: Aba Transacoes do detalhe de merchant tera link "Ver todas" para `/transactions/payments?merchantId={id}` com filtro pre-aplicado
- D-17: DateRangePicker usando shadcn RangeCalendar + Popover (bits-ui)
- D-18: Presets rapidos: Hoje, 7 dias, 30 dias, Este mes + selecao custom via calendar
- D-19: Filtro de periodo aplicado client-side (filtra por createdAt apos receber dados)

### Claude's Discretion
- Estrutura interna dos controllers (um por sub-feature ou controller unificado)
- Skeleton layout durante carregamento
- Animacao de transicao entre lista e detalhe
- Ordenacao padrao das tabelas (createdAt desc presumido)
- Truncamento de IDs e chaves PIX (quantos chars exibir)
- Implementacao interna do merchant autocomplete (debounce, min chars)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TXN-01 | Lista paginada de pagamentos cross-merchant com filtros: merchant, status, metodo de pagamento, periodo | API GET /admin/payments supports merchantId, status, method, skip, limit query params. DataTable + SelectFilter + SearchInput reusable. Period filter is client-side per D-19. |
| TXN-02 | Coluna "Merchant" nas listas de transacoes com link navegavel para detalhe do merchant | Column renders as `<a href="/merchants/{merchantId}">`. MerchantTransactionsTab already has cross-nav link pattern. |
| TXN-03 | Detalhe de pagamento: dados completos incluindo info de PIX, Boleto ou Cartao conforme metodo | PaymentResponse DTO has nullable pix/boleto/card objects. Conditional {#if payment.pix} rendering. |
| TXN-04 | Lista paginada de saques cross-merchant com filtros: merchant, status | API GET /admin/withdrawals supports merchantId, status, skip, limit. Same pattern as payments list. |
| TXN-05 | Detalhe de saque: dados do recipient (chave PIX e tipo), status, valores bruto/taxa/liquido | WithdrawalResponse DTO has recipient object with pixKey, pixKeyType, name, documentNumber. |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/table-core | installed | DataTable column definitions and sorting | Proven in Phase 2; avoids broken @tanstack/svelte-table |
| bits-ui | ^2.16.3 | Select, Calendar, Popover primitives | shadcn-svelte foundation |
| lucide-svelte | ^0.475.0 | Icons (CreditCard, ArrowDownToLine, ChevronRight, Copy, etc.) | Already used across project |
| svelte-sonner | ^1.1.0 | Toast notifications for copy-to-clipboard feedback | Already integrated |

### New Components to Install via shadcn CLI
| Component | Command | Purpose |
|-----------|---------|---------|
| Popover | `npx shadcn-svelte@latest add popover` | DateRangePicker wrapper (D-17) |
| Range Calendar | `npx shadcn-svelte@latest add range-calendar` | Date range selection (D-17) |

**Note:** The existing `DateRangeFilter.svelte` uses native `<input type="date">` elements. Decision D-17 explicitly requires shadcn RangeCalendar + Popover with preset buttons (D-18). These shadcn components must be added before implementing the DateRangePicker upgrade.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn RangeCalendar | Keep native `<input type="date">` | Simpler but violates D-17/D-18 decisions; no preset buttons |
| Custom merchant autocomplete | Existing SelectFilter | SelectFilter has no search/filter capability -- must build autocomplete |

## Architecture Patterns

### Recommended Project Structure
```
src/app/features/transactions/
  payments/
    domain/
      entities/Payment.ts          # PaymentResponse, PaginatedPayments, ListPaymentsParams
      repositories/IPaymentRepository.ts
    data/
      repositories/PaymentRepository.ts
    services/PaymentService.ts
    presentation/
      controllers/paymentListController.svelte.ts
      controllers/paymentDetailController.svelte.ts
      pages/PaymentsListPage.svelte
      pages/PaymentDetailPage.svelte
      components/PaymentMethodCard.svelte  # Conditional PIX/Boleto/Card rendering
  withdrawals/
    domain/
      entities/Withdrawal.ts       # WithdrawalResponse, PaginatedWithdrawals, ListWithdrawalsParams
      repositories/IWithdrawalRepository.ts
    data/
      repositories/WithdrawalRepository.ts
    services/WithdrawalService.ts
    presentation/
      controllers/withdrawalListController.svelte.ts
      controllers/withdrawalDetailController.svelte.ts
      pages/WithdrawalsListPage.svelte
      pages/WithdrawalDetailPage.svelte
  shared/
    components/MerchantAutocomplete.svelte  # Reusable merchant search select

src/routes/(admin)/transactions/
  payments/
    +page.svelte                 # exists -- imports PaymentsListPage
    [id]/+page.svelte            # NEW -- imports PaymentDetailPage
  withdrawals/
    +page.svelte                 # exists -- imports WithdrawalsListPage
    [id]/+page.svelte            # NEW -- imports WithdrawalDetailPage

src/app/shared/
  widgets/
    Breadcrumbs.svelte           # NEW -- generic breadcrumb component
    filters/
      DateRangePicker.svelte     # NEW -- replaces/upgrades DateRangeFilter with shadcn RangeCalendar
```

### Pattern 1: Controller with Svelte 5 Runes (established)
**What:** `createXxxController()` function returning reactive state via `$state` and action functions
**When to use:** Every list and detail page
**Example (from merchantListController.svelte.ts):**
```typescript
export function createPaymentListController() {
  const service = new PaymentService(new PaymentRepository());

  let state = $state<PaymentListState>({
    payments: [],
    total: 0,
    page: 1,
    limit: 20,
    merchantId: '',
    status: '',
    method: '',
    loading: true,
    error: null,
  });

  async function loadPayments() {
    state.loading = true;
    state.error = null;
    const params: ListPaymentsParams = { page: state.page, limit: state.limit };
    if (state.merchantId) params.merchantId = state.merchantId;
    if (state.status) params.status = state.status;
    if (state.method) params.method = state.method;
    const result = await service.listPayments(params);
    if (result.ok) {
      state.payments = result.value.items;
      state.total = result.value.total;
    } else {
      state.error = result.failure.message;
    }
    state.loading = false;
  }
  // ... setters that reset page to 1 and call loadPayments()
  return { get state() { return state; }, loadPayments, /* ... */ };
}
```

### Pattern 2: Repository with Either Monad (established)
**What:** Repository methods return `Either<Failure, T>` using `left()/right()` from `$core/error/Failure`
**When to use:** All API calls
**Example:**
```typescript
async listPayments(params: ListPaymentsParams): Promise<Either<Failure, PaginatedPayments>> {
  try {
    const query = new URLSearchParams();
    query.set('skip', String((params.page - 1) * params.limit));
    query.set('limit', String(params.limit));
    if (params.merchantId) query.set('merchantId', params.merchantId);
    if (params.status) query.set('status', params.status);
    if (params.method) query.set('method', params.method);
    const url = `${API_PATHS.ADMIN_PAYMENTS}?${query}`;
    const response = await apiClient.get<PaginatedPayments>(url);
    if (isSuccess(response) && response.data) return right(response.data);
    if (isUnauthorized(response)) return left(new UnauthorizedFailure(response.message));
    return left(new ServerFailure(response.message, response.extendedResultCode));
  } catch {
    return left(new NetworkFailure());
  }
}
```

### Pattern 3: cellSnippet for Custom Cell Rendering (established)
**What:** DataTable accepts a `cellSnippet` Snippet for custom cell content based on columnId
**When to use:** Rendering StatusBadge, links, formatted currency, truncated IDs
**Example:**
```svelte
{#snippet cellRenderer({ row, columnId }: { row: Row<PaymentListItem>; columnId: string })}
  {#if columnId === 'merchantId'}
    <a href="/merchants/{row.original.merchantId}" class="merchant-link">
      {row.original.merchantName ?? row.original.merchantId.substring(0, 8)}
    </a>
  {:else if columnId === 'status'}
    <StatusBadge status={row.original.status} />
  {:else if columnId === 'amount'}
    {formatCurrency(row.original.amount)}
  {:else}
    {String((row.original as Record<string, unknown>)[columnId] ?? '--')}
  {/if}
{/snippet}
```

### Pattern 4: Server-Side Pagination (established)
**What:** Controller manages page state, sends skip/limit to API, renders Prev/Next buttons below table
**When to use:** All list pages (API returns `{ items, total, skip, limit }`)
**Key detail:** DataTable has its own internal client-side pagination. For server-side pagination, pass ALL returned items to DataTable and manage page switching via controller's `setPage()` which triggers a new API call. The external Prev/Next buttons below the table handle this.

### Anti-Patterns to Avoid
- **Don't use `@tanstack/svelte-table`:** Broken with Svelte 5. Use `@tanstack/table-core` directly (STATE.md critical decision).
- **Don't use Service Locator for this phase:** Despite CONTEXT.md mentioning `sl.get<T>()`, the actual Merchants implementation instantiates services directly in controllers: `new MerchantService(new MerchantRepository())`. Follow the actual code pattern.
- **Don't add status tabs for transactions:** D-03 explicitly decided against tabs (too many statuses). Use SelectFilter dropdown.
- **Don't render QR code images:** D-11 says admin only verifies, not scans. Show qrCode string with copy button.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom formatter | `formatCurrency()` from `$appmod/shared/utils/formatters.ts` | Already handles centavos-to-BRL with Intl.NumberFormat pt-BR |
| Date formatting | Custom date parser | `formatDate()` from same file | Already formats ISO to dd/MM/yyyy HH:mm |
| Status color mapping | Per-component color logic | `StatusBadge` component | Centralized status-to-color mapping, just add missing statuses |
| Data table | Custom table HTML | `DataTable<T>` generic component | Sorting, skeleton loading, empty state, pagination all built-in |
| Select dropdowns | Custom dropdown | `SelectFilter` component | shadcn Select with PRISMA styling, "Todos" reset option |
| Toast notifications | Custom notification system | `svelte-sonner` (toast) | Already integrated for copy-to-clipboard feedback |
| API calls | Raw fetch | `apiClient` with interceptors | Auth, refresh, error handling all built-in |

## Common Pitfalls

### Pitfall 1: HTTP 429 Rate Limiting
**What goes wrong:** Burst of simultaneous API calls on page load triggers rate limiting
**Why it happens:** Phase 2 experienced this when loading tab counts + list simultaneously
**How to avoid:** Load list first, defer secondary calls with 1s delay (see merchantListController pattern). For transactions, there are no tab counts (D-03), so this is less risky, but merchant autocomplete search must use debounce.
**Warning signs:** 429 responses in browser DevTools, empty data despite valid auth

### Pitfall 2: StatusBadge Missing Statuses
**What goes wrong:** New payment/withdrawal statuses render with default gray color instead of semantically correct color
**Why it happens:** StatusBadge STATUS_MAP doesn't include CREATED, PAID, FAILED, CANCELLED, REFUNDED, EXPIRED, REQUESTED, PROCESSING, COMPLETED
**How to avoid:** Add all new statuses to STATUS_MAP before rendering list pages:
- Green: PAID, COMPLETED
- Yellow/Amber: CREATED, REQUESTED, PROCESSING
- Red: FAILED, CANCELLED, REFUNDED, EXPIRED

### Pitfall 3: Client-Side Date Filtering vs Server Pagination
**What goes wrong:** Filtering by date range client-side (D-19) after server pagination returns incorrect results -- you only filter the current page's items
**Why it happens:** API doesn't support startDate/endDate query params, so date filtering must happen after fetching data
**How to avoid:** When date range is active, fetch ALL records (or a large batch) then filter client-side. Alternatively, accept that date filtering only applies to the current page and document this limitation. The pragmatic approach: increase limit when date filter is active, or fetch multiple pages.
**Warning signs:** User sets date range, sees fewer results than expected because only current page was filtered

### Pitfall 4: Merchant Name Resolution
**What goes wrong:** Payment/Withdrawal API responses contain `merchantId` but not merchant name -- table shows UUIDs instead of readable names
**Why it happens:** The PaymentResponse DTO from the API only has `merchantId: string`, not a merchant name field
**How to avoid:** Two options: (a) show truncated merchantId as link text, or (b) batch-resolve merchant names via a separate API call. Option (a) is simpler and matches the pattern of ID truncation already decided (D-08). The link navigates to merchant detail where the name is visible.
**Warning signs:** Table column showing long UUIDs instead of business names

### Pitfall 5: Detail Route Pages Missing
**What goes wrong:** Clicking a table row to navigate to detail page results in 404
**Why it happens:** Only list route pages exist (`/transactions/payments/+page.svelte`). Detail routes at `/transactions/payments/[id]/+page.svelte` and `/transactions/withdrawals/[id]/+page.svelte` don't exist yet.
**How to avoid:** Create the SvelteKit dynamic route directories and page files as part of the implementation.

### Pitfall 6: bits-ui Select type Prop
**What goes wrong:** TypeScript error on `Select.Root` component
**Why it happens:** bits-ui Select requires explicit `type='single'` prop to resolve discriminated union (STATE.md decision from Plan 01.1-03)
**How to avoid:** Always pass `type="single"` to Select.Root. The existing SelectFilter already does this.

## Code Examples

### Entity: PaymentResponse (from API docs section 5.5.1)
```typescript
// Source: docs/FRONTEND_ADMIN_DOC.md lines 970-1014
export type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD';
export type PaymentStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';

export interface PaymentPixInfo {
  qrCode: string;
  qrCodeUrl: string | null;
}
export interface PaymentBoletoInfo {
  barcode: string;
  boletoUrl: string | null;
  dueDate: string;
}
export interface PaymentCardInfo {
  lastFourDigits: string;
  brand: string;
  installments: number;
}
export interface PaymentPayer {
  name: string;
  maskedDocument: string;
  email: string | null;
  phone: string | null;
}

export interface Payment {
  id: string;
  merchantId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  description: string | null;
  isTest: boolean;
  pix: PaymentPixInfo | null;
  boleto: PaymentBoletoInfo | null;
  card: PaymentCardInfo | null;
  payer: PaymentPayer | null;
  expiresAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPayments {
  items: Payment[];
  total: number;
  skip: number;
  limit: number;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  merchantId?: string;
  status?: PaymentStatus | '';
  method?: PaymentMethod | '';
}
```

### Entity: WithdrawalResponse (from API docs section 5.5.2)
```typescript
// Source: docs/FRONTEND_ADMIN_DOC.md lines 1043-1067
export type WithdrawalStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface WithdrawalRecipient {
  pixKey: string;
  pixKeyType: string;
  name: string;
  documentNumber: string;
}

export interface Withdrawal {
  id: string;
  merchantId: string;
  externalId: string | null;
  providerName: string | null;
  status: WithdrawalStatus;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  recipient: WithdrawalRecipient;
  completedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedWithdrawals {
  items: Withdrawal[];
  total: number;
  skip: number;
  limit: number;
}

export interface ListWithdrawalsParams {
  page?: number;
  limit?: number;
  merchantId?: string;
  status?: WithdrawalStatus | '';
}
```

### Conditional Method Rendering (D-11)
```svelte
<!-- PaymentMethodCard.svelte -->
{#if payment.method === 'PIX' && payment.pix}
  <div class="method-section">
    <h3>PIX</h3>
    <div class="copyable-field">
      <code>{payment.pix.qrCode}</code>
      <button onclick={() => copyToClipboard(payment.pix.qrCode)}>
        <Copy size={14} />
      </button>
    </div>
  </div>
{:else if payment.method === 'BOLETO' && payment.boleto}
  <div class="method-section">
    <h3>Boleto</h3>
    <code>{payment.boleto.barcode}</code>
    {#if payment.boleto.boletoUrl}
      <a href={payment.boleto.boletoUrl} target="_blank">Ver boleto</a>
    {/if}
    <p>Vencimento: {formatDate(payment.boleto.dueDate)}</p>
  </div>
{:else if (payment.method === 'CREDIT_CARD' || payment.method === 'DEBIT_CARD') && payment.card}
  <div class="method-section">
    <h3>Cartao</h3>
    <p>**** {payment.card.lastFourDigits} ({payment.card.brand})</p>
    <p>{payment.card.installments}x</p>
  </div>
{/if}
```

### Sidebar Collapsible Submenu (D-07)
```svelte
<!-- In AdminLayout.svelte, replace flat Pagamentos/Saques entries with: -->
{@const isTxnActive = $page.url.pathname.startsWith('/transactions')}
<button onclick={() => txnOpen = !txnOpen} class="nav-item">
  <CreditCard size={16} /> Transacoes
  <ChevronDown size={14} class={txnOpen ? 'rotated' : ''} />
</button>
{#if txnOpen || isTxnActive}
  <a href="/transactions/payments" class="nav-sub-item">Pagamentos</a>
  <a href="/transactions/withdrawals" class="nav-sub-item">Saques</a>
{/if}
```

### Merchant Autocomplete Select (D-04)
```svelte
<!-- MerchantAutocomplete.svelte concept -->
<script lang="ts">
  import { MerchantService } from '...';
  import { MerchantRepository } from '...';

  let searchTerm = $state('');
  let merchants = $state<{id: string; legalName: string}[]>([]);
  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput(value: string) {
    searchTerm = value;
    clearTimeout(debounceTimer);
    if (value.length < 2) { merchants = []; return; }
    debounceTimer = setTimeout(async () => {
      const svc = new MerchantService(new MerchantRepository());
      const result = await svc.listMerchants({ search: value, limit: 10, page: 1 });
      if (result.ok) merchants = result.value.items.map(m => ({ id: m.id, legalName: m.legalName }));
    }, 300);
  }
</script>
```

### New StatusBadge Mappings Required
```typescript
// Add to STATUS_MAP in StatusBadge.svelte:
// Payments
CREATED:    { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
PAID:       { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
FAILED:     { color: '#FF3B5C', background: 'rgba(255,59,92,0.10)', border: 'rgba(255,59,92,0.20)' },
CANCELLED:  { color: '#9090A8', background: 'rgba(144,144,168,0.10)', border: 'rgba(144,144,168,0.20)' },
REFUNDED:   { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
EXPIRED:    { color: '#9090A8', background: 'rgba(144,144,168,0.10)', border: 'rgba(144,144,168,0.20)' },
// Withdrawals
REQUESTED:  { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
PROCESSING: { color: '#01FAFB', background: 'rgba(1,250,251,0.10)', border: 'rgba(1,250,251,0.20)' },
COMPLETED:  { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
// FAILED and CANCELLED already covered above
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| DateRangeFilter with native `<input type="date">` | shadcn RangeCalendar + Popover (D-17) | Phase 3 decision | Must install popover + range-calendar shadcn components |
| Flat sidebar nav items | Collapsible submenu for Transactions (D-07) | Phase 3 decision | AdminLayout.svelte needs state management for open/close |
| No breadcrumbs | Breadcrumbs on detail pages (D-15) | Phase 3 decision | New shared Breadcrumbs component needed |

## Open Questions

1. **Merchant Name in Table**
   - What we know: API PaymentResponse only returns `merchantId`, not merchant name/legalName
   - What's unclear: Whether to show truncated ID or resolve names via separate API calls
   - Recommendation: Show truncated merchantId (first 8 chars) as link text. Name resolution would require N+1 API calls or a batch endpoint that doesn't exist. The link navigates to merchant detail where name is visible.

2. **Client-Side Date Filtering Accuracy (D-19)**
   - What we know: API has no startDate/endDate params. Date filtering must be client-side.
   - What's unclear: When paginating server-side (e.g., page 2 of 100 results), client-side date filter only affects the current page's 20 items.
   - Recommendation: Accept this limitation for v1. Document in UI that date filter applies to current page. Future API enhancement could add date range query params.

3. **DateRangePicker Component Strategy**
   - What we know: D-17 decided shadcn RangeCalendar + Popover. Components not yet installed.
   - What's unclear: Whether bits-ui ^2.16.3 ships RangeCalendar or if it needs a version bump.
   - Recommendation: Run `npx shadcn-svelte@latest add popover range-calendar` as first step. If version conflict occurs, fall back to the existing native date inputs (functional, just less polished).

## Project Constraints (from StyleGuide.md and STATE.md)

- **Fonts:** Space Grotesk (display/headings), Outfit (body/UI), JetBrains Mono or Outfit for mono
- **Colors:** Use CSS variables (--color-foreground, --color-surface, --color-brand-magenta, --color-brand-cyan, etc.)
- **Border radius:** var(--radius-md, 12px) for inputs, var(--radius-lg, 16px) for cards
- **Shadows:** var(--shadow-md) for cards, var(--shadow-lg) for dropdowns
- **bits-ui Select:** Always use `type="single"` prop
- **No @tanstack/svelte-table:** Use @tanstack/table-core directly
- **Inline styles for dynamic values:** Svelte scoped CSS cannot use runtime values (STATE.md decision)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 2.1.9 (pinned) with @vitest/coverage-v8@2.1.9 |
| Config file | vitest.config.ts (exists from Phase 1) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TXN-01 | Payment list loads with filters | unit (controller) | `npx vitest run src/app/features/transactions/payments -x` | No -- Wave 0 |
| TXN-02 | Merchant column links to /merchants/{id} | manual (visual) | N/A | N/A |
| TXN-03 | Payment detail shows method-specific info | unit (conditional render) | `npx vitest run src/app/features/transactions/payments -x` | No -- Wave 0 |
| TXN-04 | Withdrawal list loads with filters | unit (controller) | `npx vitest run src/app/features/transactions/withdrawals -x` | No -- Wave 0 |
| TXN-05 | Withdrawal detail shows recipient info | manual (visual) | N/A | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Payment controller test file -- covers TXN-01
- [ ] Withdrawal controller test file -- covers TXN-04
- [ ] Note: TXN-02, TXN-03, TXN-05 are primarily visual/rendering -- manual verification appropriate

## Sources

### Primary (HIGH confidence)
- `docs/FRONTEND_ADMIN_DOC.md` sections 5.5.1 and 5.5.2 -- complete Payment and Withdrawal API DTOs and query params
- `src/core/constants/apiPaths.ts` -- ADMIN_PAYMENTS, ADMIN_PAYMENT, ADMIN_WITHDRAWALS, ADMIN_WITHDRAWAL already defined
- `src/app/features/merchants/` -- complete Clean Architecture reference implementation
- `src/app/shared/widgets/` -- DataTable, StatusBadge, SelectFilter, Pagination, DateRangeFilter
- `src/app/shared/utils/formatters.ts` -- formatCurrency, formatDate utilities

### Secondary (MEDIUM confidence)
- `docs/StyleGuide.md` -- PRISMA design system colors, typography, spacing
- `.planning/STATE.md` -- accumulated project decisions (bits-ui type prop, tanstack/table-core, etc.)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and proven in Phase 2
- Architecture: HIGH -- exact pattern replication from merchants feature
- Pitfalls: HIGH -- based on actual Phase 2 experience (429 rate limiting, bits-ui quirks)
- New components (DateRangePicker, Breadcrumbs, MerchantAutocomplete): MEDIUM -- new work but within established patterns

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable stack, no external dependency changes expected)
