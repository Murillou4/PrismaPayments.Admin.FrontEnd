# Phase 1: Auth + Core Infrastructure — Research

**Researched:** 2026-03-24
**Domain:** SvelteKit 5 SSR authentication, RBAC guards, shared UI component library, Chart.js dashboard
**Confidence:** HIGH — based on direct codebase inspection plus verified library versions from npm

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Componentes de UI**
- Biblioteca base: shadcn-svelte — componentes copiados para o projeto (`src/lib/components/ui/`), Tailwind CSS, Svelte 5 nativo. Usa `bits-ui` por baixo. Zero lock-in, controle total sobre o markup.
- DataTable, Dialog, Toast, Badge, Input, Select, Button e demais componentes shared seguem o padrão shadcn-svelte.
- `svelte-sonner` para sistema de toast (já identificado na research).
- `@tanstack/table-core` (não `@tanstack/svelte-table`) para lógica de tabela — headless, funciona com `$state` do Svelte 5.

**Auth SSR**
- Fluxo de login: `+page.server.ts` com form action + `use:enhance` no cliente.
- O `+page.server.ts` de `/login` recebe as credenciais, chama o backend, e escreve o cookie `access_token` via `cookies.set()` do SvelteKit.
- `use:enhance` no `LoginPage.svelte` faz a submissão progressiva sem reload de página.
- Após login bem-sucedido, o server action faz redirect para `/dashboard`.
- Cookie HttpOnly: sim — `access_token` escrito como HttpOnly pelo server, inacessível ao JS do cliente.
- sessionStorage no cliente: o accessToken também é salvo em sessionStorage para que o `apiClient.ts` o injete nas requisições fetch do cliente sem precisar fazer round-trip ao servidor.
- Sincronização pós-refresh: após renovar o token no cliente, um endpoint interno `/api/internal/sync-token` (POST, SvelteKit API route) re-escreve o cookie HttpOnly para manter o SSR sincronizado.

**Token Refresh**
- Interceptor dentro de `apiClient.ts` — detecta 401, faz refresh, re-executa requisição.
- Fila de concorrência: requisições que chegam durante o refresh são enfileiradas e re-executadas após o refresh completar.
- Refresh falhou → logout completo (limpa cookie + sessionStorage).

**RBAC na UI**
- Elementos sem permissão: ocultar (não desabilitar).
- Role disponível via `setContext`/`getContext` — injetado no layout admin (`+layout.svelte`) após decodificar o JWT do sessionStorage.
- Helper `hasPermission(userRole, requiredRole)` → compara níveis numéricos (VIEWER=1, SUPPORT=2, ADMIN=3, SUPER_ADMIN=4).
- Guards SSR em `+layout.server.ts` do grupo `(admin)` — lê cookie, decodifica JWT, injeta em `event.locals`, retorna redirect 302 para `/login` se não autenticado, 403 se role insuficiente.
- `adminGuard.ts` existente pode ser reaproveitado como helper cliente-side, mas a fonte de verdade do SSR é `hooks.server.ts` + `+layout.server.ts`.

**Dashboard**
- Filtro de período: tabs rápidas — "Hoje / Esta semana / Este mês / Este ano" — sem date picker.
- Gráfico: bar chart — barras por período para volume e transações.
- Biblioteca de gráfico: `chart.js` + wrapper Svelte 5 (`svelte5-chartjs`).
- Alertas: disputas abertas + KYC pendentes como cards de alerta clicáveis acima das métricas.

**Infraestrutura Compartilhada**
- Redirecionamento de `/` para `/dashboard`: substituir meta refresh por `redirect(302, '/dashboard')` em `+page.server.ts`.
- Formatação de moeda: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` — helper em `src/app/shared/utils/formatters.ts` (já existe, completar).
- `+error.svelte` global em `src/routes/+error.svelte`.

### Claude's Discretion
- Estrutura interna do DataTable genérico (column defs API, slot para custom cells).
- Variantes do StatusBadge (cores por enum).
- Props do ConfirmDialog (texto, botões, campo de motivo opcional).
- Animações e transições dos componentes shadcn.

### Deferred Ideas (OUT OF SCOPE)
- Nenhuma ideia fora de escopo foi mencionada durante a discussão.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Admin pode fazer login com email e senha via `/api/v1/auth/admin/login` | `+page.server.ts` form action POSTs to backend, writes HttpOnly cookie on success |
| AUTH-02 | Tokens persistidos de forma que SSR e cliente permaneçam sincronizados (cookie HttpOnly + sessionStorage) | Two-layer pattern: `cookies.set()` in server action + `tokenStorage.setTokens()` in `enhance` callback |
| AUTH-03 | Token de acesso expirado renovado automaticamente via interceptor (refresh transparente com fila) | `apiClient.ts` gets `isRefreshing` flag + `refreshQueue` array pattern |
| AUTH-04 | Todas as rotas admin redirecionam para `/login` se não autenticado | `hooks.server.ts` already checks `access_token` cookie — cookie write fixes this |
| AUTH-05 | Role do admin extraído do JWT e disponibilizado globalmente para guards e renderização condicional | `tokenStorage.decodeJwtPayload()` (already exists) + `setContext` in `(admin)/+layout.svelte` |
| AUTH-06 | Logout limpa todos os tokens (cookie + sessionStorage) e redireciona para `/login` | New logout endpoint clears HttpOnly cookie; `tokenStorage.clearTokens()` clears sessionStorage |
| RBAC-01 | Rotas e ações protegidas por role mínimo: VIEWER / SUPPORT / ADMIN / SUPER_ADMIN | `(admin)/+layout.server.ts` decodes JWT from `event.locals.accessToken`, runs role check |
| RBAC-02 | Itens de menu e botões de ação ocultados (não desabilitados) quando role insuficiente | `{#if hasPermission(userRole, 'ADMIN')}...{/if}` pattern in templates; role from `getContext` |
| RBAC-03 | Retorno 403 do backend exibe mensagem de acesso negado (não redireciona para login) | `ForbiddenFailure` already exists in `Failure.ts`; map in repositories; display inline in page |
| RBAC-04 | Guards aplicados tanto no SSR quanto no cliente | SSR: `+layout.server.ts`; client: `onMount` calls `requireRole()` from `adminGuard.ts` |
| INFRA-01 | `DataTable<T>` genérico com paginação, colunas configuráveis e cell slots | `@tanstack/table-core` 8.21.3 + Svelte 5 `$state` adapter; `{#snippet cell}` for custom cells |
| INFRA-02 | Componentes de filtro reutilizáveis: texto, status, período | Composable primitives in `src/app/shared/widgets/filters/`: `SearchInput`, `SelectFilter`, `DateRangeFilter` |
| INFRA-03 | `StatusBadge` com mapeamento de cor por entidade | Tailwind utility classes + color map object keyed by status string |
| INFRA-04 | `ConfirmDialog` reutilizável com campo de motivo opcional | Native HTML `<dialog>` + `$effect` to call `showModal()`/`close()`; optional textarea for reason |
| INFRA-05 | Sistema de toast (`svelte-sonner`) para feedback | `<Toaster />` mounted once in `AdminLayout.svelte`; imperative `toast.success/error()` calls |
| INFRA-06 | Error boundary global (`+error.svelte`) | New file at `src/routes/+error.svelte` with styled error card |
| INFRA-07 | Redirecionamento de `/` via SvelteKit server redirect | New `src/routes/+page.server.ts` with `throw redirect(302, '/dashboard')` |
| INFRA-08 | Formatação correta de valores monetários (centavos → BRL) | `formatCurrency()` already exists in `formatters.ts`; verify and complete it |
| DASH-01 | Cards de métricas globais: volume, transações, saldo, taxas, merchants | `AdminMetrics` entity already has all fields; `DashboardPage.svelte` already renders 4 of 5 |
| DASH-02 | Gráfico de volume e transações por período | `chart.js` 4.5.1 + `svelte5-chartjs` 1.0.0; period tabs drive API param; backend endpoint needed |
| DASH-03 | Alertas visuais: disputas abertas, verificações KYC pendentes | Backend must expose these counts; new fields in `AdminMetrics` or separate alerts endpoint |
</phase_requirements>

---

## Summary

Phase 1 has a single critical blocker that prevents any authenticated work: the `access_token` HttpOnly cookie is never written after login. `hooks.server.ts` checks `event.cookies.get('access_token')` but `AuthService.login()` only writes to `sessionStorage`. Every authenticated page visit redirects back to `/login`. The fix requires migrating the login form to a SvelteKit server action (`+page.server.ts` form action + `use:enhance`) so that the server can `cookies.set()` the token.

Beyond the auth fix, this phase builds the shared component library (DataTable, StatusBadge, ConfirmDialog, Toast/Sonner, error boundary, filter primitives) and improves the existing Dashboard with period tabs, a bar chart, and alert cards. All shared components must be completed before Phase 2 begins, as every subsequent feature depends on them.

The RBAC layer is architecturally present (`adminGuard.ts` is complete and correct) but never called from any route. The fix is wiring: `hooks.server.ts` must forward the decoded role into `event.locals`, and `(admin)/+layout.server.ts` must extract and expose the role via a `load` function. Client-side role access uses `setContext`/`getContext` in the admin layout, not a global store.

**Primary recommendation:** Fix the auth cookie bug first (single file: `src/routes/login/+page.server.ts`). Then build shared infra in dependency order: Toast → error boundary → ConfirmDialog → StatusBadge → DataTable → filter primitives. Then wire RBAC. Then improve Dashboard.

---

## Standard Stack

### Core (already installed or needs install)

| Library | Version (verified) | Purpose | Status |
|---------|-------------------|---------|--------|
| SvelteKit | ^2.0.0 | SSR framework, routing, form actions | Already installed |
| Svelte 5 | ^5.0.0 | UI framework with runes (`$state`, `$derived`, `$props`) | Already installed |
| TypeScript | ^5.0.0 | Type safety, strict mode | Already installed |
| Tailwind CSS v4 | ^4.0.0 | Utility styling via `@tailwindcss/vite` | Already installed |
| lucide-svelte | 0.475.0 | Icon set | Already installed |

### New Installs Required for Phase 1

| Library | Version (verified) | Purpose | Why Standard |
|---------|-------------------|---------|--------------|
| `@tanstack/table-core` | 8.21.3 | Headless table logic (sorting, pagination state) | Only TanStack option compatible with Svelte 5 — the `@tanstack/svelte-table` adapter uses `svelte/internal` which breaks in Svelte 5 |
| `chart.js` | 4.5.1 | Bar charts for Dashboard DASH-02 | Lowest-friction charting lib; no Svelte-specific concerns; driven from `onMount` |
| `svelte5-chartjs` | 1.0.0 | Svelte 5 wrapper for chart.js | Explicit Svelte 5 fork of the abandoned `svelte-chartjs`; only runes-native wrapper available |
| `svelte-sonner` | 1.1.0 | Toast notifications (INFRA-05) | Svelte 5 native, shadcn-svelte's recommended toast solution; imperative API fits the Either pattern |
| `bits-ui` | 2.16.3 | Accessible headless dialog primitives (used by shadcn-svelte) | Required for shadcn-svelte Dialog; handles focus trap, aria-modal, scroll lock |
| `@internationalized/date` | 3.12.0 | Peer dependency for `bits-ui` date components | Required by bits-ui |
| `jwt-decode` | 4.0.0 | Decode JWT payload to extract `role` claim client-side | Named export, TypeScript-native, handles base64url padding edge cases; replaces current `atob` hack in `tokenStorage.ts` |

### Anti-Recommendations (Do Not Use)

| Library | Reason |
|---------|--------|
| `@tanstack/svelte-table` | Uses `svelte/internal` — broken with Svelte 5. Use `@tanstack/table-core` directly. |
| `svelte-chartjs` (original) | Abandoned, Svelte 4 only. Use `svelte5-chartjs` fork. |
| `svelte-french-toast` | Svelte 4 only; not maintained for Svelte 5 runes. |
| `svelte-headless-table` | Svelte 4 stores API, not runes-compatible. |

**Installation:**
```bash
npm install @tanstack/table-core chart.js svelte5-chartjs svelte-sonner bits-ui @internationalized/date jwt-decode
```

**shadcn-svelte init (separate step — generates `components.json` and base structure):**
```bash
npx shadcn-svelte@latest init
```

---

## Architecture Patterns

### Existing Structure (do not change)

```
src/
├── app/
│   ├── features/
│   │   ├── auth/                    # Login — has complete vertical slice
│   │   └── dashboard/               # Dashboard — partial slice, needs chart + alerts
│   ├── services/
│   │   ├── api/apiClient.ts         # MODIFY: add refresh interceptor
│   │   └── storage/tokenStorage.ts  # MODIFY: export decodeJwtPayload, add jwt-decode
│   └── shared/
│       ├── guards/adminGuard.ts     # EXISTS: hasPermission(), requireRole() — wire it
│       ├── widgets/AdminLayout.svelte # MODIFY: add Toaster, inject role via setContext
│       └── utils/formatters.ts      # EXISTS: formatCurrency() already correct — no change
├── core/
│   ├── constants/apiPaths.ts        # EXISTS: all paths present
│   └── error/Failure.ts             # EXISTS: all Failure types present
└── routes/
    ├── +page.svelte                 # REPLACE: meta refresh → remove
    ├── +page.server.ts              # NEW: throw redirect(302, '/dashboard')
    ├── +error.svelte                # NEW: global error boundary (INFRA-06)
    ├── login/
    │   ├── +page.svelte             # EXISTS: renders LoginPage.svelte
    │   └── +page.server.ts          # NEW: form action — writes HttpOnly cookie
    ├── api/internal/
    │   └── sync-token/+server.ts    # NEW: re-writes cookie after client refresh
    └── (admin)/
        ├── +layout.svelte           # MODIFY: setContext(role), add Toaster
        ├── +layout.server.ts        # NEW: decode JWT from locals, expose role
        └── dashboard/
            └── +page.svelte         # EXISTS: renders DashboardPage.svelte
```

### New Shared Components Location

```
src/app/shared/widgets/
├── DataTable.svelte            # INFRA-01: generic paginated table
├── Pagination.svelte           # sub-component used by DataTable
├── StatusBadge.svelte          # INFRA-03: color-coded status display
├── ConfirmDialog.svelte        # INFRA-04: native <dialog> with optional reason textarea
└── filters/
    ├── SearchInput.svelte      # INFRA-02: debounced text search
    ├── SelectFilter.svelte     # INFRA-02: dropdown status filter
    └── DateRangeFilter.svelte  # INFRA-02: from/to date inputs
```

---

### Pattern 1: Server Action Login (fixes AUTH-01, AUTH-02)

The existing login form uses a JavaScript-only path (`service.login()` → `sessionStorage` only). The fix migrates to a SvelteKit form action so the server can write the HttpOnly cookie.

**New file: `src/routes/login/+page.server.ts`**
```typescript
// Source: SvelteKit official docs — form actions + cookies.set()
import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { env } from '$core/config/env';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '');
    const password = String(data.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'Email e senha são obrigatórios' });
    }

    const res = await fetch(`${env.apiBaseUrl}/api/v1/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const body = await res.json();

    if (!body || body.responseType !== 'Success' || !body.data) {
      return fail(401, { error: body.message ?? 'Credenciais inválidas' });
    }

    cookies.set('access_token', body.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: body.data.expiresIn ?? 3600
    });

    cookies.set('refresh_token', body.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    throw redirect(303, '/dashboard');
  }
};
```

**Modified `LoginPage.svelte` — add `use:enhance`, capture tokens for sessionStorage:**
```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { tokenStorage } from '$appmod/services/storage/tokenStorage';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
</script>

<form
  method="POST"
  use:enhance={() => {
    loading = true;
    return async ({ result, update }) => {
      loading = false;
      if (result.type === 'success' && result.data?.accessToken) {
        tokenStorage.setTokens(result.data.accessToken, result.data.refreshToken);
      }
      await update();
    };
  }}
>
  <!-- existing email/password fields -->
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <button type="submit" disabled={loading}>
    {loading ? 'Entrando...' : 'Entrar'}
  </button>
</form>
```

**Note on sessionStorage sync:** The server action does the redirect; the `enhance` callback runs before the redirect. To populate sessionStorage (needed by `apiClient.ts` for client-side fetch), the action must return the tokens as part of a success response (not redirect) OR `LoginPage.svelte` must read the tokens from a cookie-accessible source. The cleaner approach: the action returns tokens in the response data when successful without redirect — then the `enhance` callback stores them in sessionStorage and calls `goto('/dashboard')` client-side.

---

### Pattern 2: Token Refresh with Concurrency Queue (AUTH-03)

**Modified `apiClient.ts`:**
```typescript
// Module-level state — singleton across all requests
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const body = await res.json();
    if (body.responseType === 'Success' && body.data?.accessToken) {
      tokenStorage.setTokens(body.data.accessToken, body.data.refreshToken);
      // Fire-and-forget: sync the new token to HttpOnly cookie
      fetch('/api/internal/sync-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: body.data.accessToken })
      }).catch(() => {});
      return body.data.accessToken;
    }
  } catch {}
  return null;
}

// Inside request(): after initial fetch, before returning data:
if (response.status === 401 && !options.skipAuth && !options._isRetry) {
  if (!isRefreshing) {
    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    refreshQueue.forEach(cb => cb(newToken));
    refreshQueue = [];
    if (newToken) {
      return request<T>(path, { ...options, _isRetry: true });
    } else {
      tokenStorage.clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return data;
    }
  } else {
    return new Promise(resolve => {
      refreshQueue.push(async (token) => {
        if (token) resolve(await request<T>(path, { ...options, _isRetry: true }));
        else resolve(data);
      });
    });
  }
}
```

Add `_isRetry?: boolean` to `RequestOptions` interface.

---

### Pattern 3: RBAC — hooks.server.ts + Layout Guard (RBAC-01 to RBAC-04)

**Modified `hooks.server.ts`** — forward token to locals:
```typescript
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/login', '/api/internal/sync-token'];

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  const isPublic = PUBLIC_ROUTES.some(r => path.startsWith(r));

  if (!isPublic) {
    const token = event.cookies.get('access_token');
    if (!token) throw redirect(303, '/login');
    event.locals.accessToken = token;  // forwarded for use in +layout.server.ts
  }

  return resolve(event);
};
```

**New `src/app.d.ts`:**
```typescript
declare global {
  namespace App {
    interface Locals {
      accessToken: string | undefined;
    }
  }
}
export {};
```

**New `src/routes/(admin)/+layout.server.ts`** — decode role, pass to layout:
```typescript
import type { LayoutServerLoad } from './$types';
import { jwtDecode } from 'jwt-decode';
import { error } from '@sveltejs/kit';

interface JwtPayload {
  role?: string;
  sub?: string;
  exp?: number;
}

export const load: LayoutServerLoad = async ({ locals }) => {
  const token = locals.accessToken;
  if (!token) return { role: null };

  try {
    const payload = jwtDecode<JwtPayload>(token);
    return { role: payload.role ?? null };
  } catch {
    return { role: null };
  }
};
```

**Modified `src/routes/(admin)/+layout.svelte`** — inject role via setContext:
```svelte
<script lang="ts">
  import { setContext } from 'svelte';
  import AdminLayout from '$appmod/shared/widgets/AdminLayout.svelte';
  import { Toaster } from 'svelte-sonner';
  import type { Snippet } from 'svelte';

  let { children, data }: { children: Snippet; data: { role: string | null } } = $props();

  // Inject role into Svelte context — consumed by any child component
  setContext('userRole', data.role);
</script>

<Toaster richColors position="top-right" />
<AdminLayout>
  {#snippet content()}
    {@render children()}
  {/snippet}
</AdminLayout>
```

**Usage in components (RBAC-02):**
```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import { hasPermission } from '$appmod/shared/guards/adminGuard';
  import type { AdminRole } from '$appmod/shared/guards/adminGuard';

  const userRole = getContext<AdminRole | null>('userRole');
</script>

{#if hasPermission(userRole, 'ADMIN')}
  <button>Criar Merchant</button>
{/if}
```

---

### Pattern 4: DataTable Generic Component (INFRA-01)

**Column definition type** — `src/app/shared/types/dataTable.ts`:
```typescript
export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => string;
}
```

**Component signature** — `src/app/shared/widgets/DataTable.svelte`:
```svelte
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { ColumnDef } from '../types/dataTable';
  import type { PaginatedResult } from '../entities/PaginatedResult';
  import type { Snippet } from 'svelte';

  interface Props {
    columns: ColumnDef<T>[];
    result: PaginatedResult<T> | null;
    loading?: boolean;
    onPageChange?: (page: number) => void;
    onSort?: (key: string, dir: 'asc' | 'desc') => void;
    rowKey?: keyof T;
    cell?: Snippet<[ColumnDef<T>, T]>;
  }

  let { columns, result, loading = false, onPageChange, onSort, rowKey, cell }: Props = $props();

  const currentPage = $derived(
    result ? Math.floor(result.skip / result.limit) + 1 : 1
  );
  const totalPages = $derived(
    result ? Math.ceil(result.total / result.limit) : 0
  );
</script>
```

**Consumer pattern:**
```svelte
<DataTable {columns} {result} {loading} {onPageChange}>
  {#snippet cell(col, row)}
    {#if col.key === 'status'}
      <StatusBadge status={row.status} />
    {:else}
      {String(row[col.key] ?? '')}
    {/if}
  {/snippet}
</DataTable>
```

---

### Pattern 5: Dashboard Improvements (DASH-01, DASH-02, DASH-03)

**What exists:** `AdminMetrics` entity has `totalVolume`, `totalTransactions`, `todayVolume`, `todayTransactions`, `availableBalance`, `pendingBalance`, `totalFeesCollected`, `totalMerchants`. `DashboardPage.svelte` renders 4 of 5 required metric cards (missing `availableBalance`).

**What's missing:**
1. `availableBalance` card (DASH-01) — already in entity, just not rendered.
2. Chart data endpoint — the current `/api/v1/dashboard/admin` returns totals only; period-based chart data needs a separate endpoint or a query param. Add `DASHBOARD_CHART` path to `apiPaths.ts` or use a query param `?period=day|week|month`.
3. Alert data for open disputes and pending KYC (DASH-03) — the backend must expose these counts. Check if `AdminMetrics` will be extended, or use a separate alerts endpoint. This needs backend verification.

**Period tabs pattern:**
```svelte
<script lang="ts">
  type Period = 'day' | 'week' | 'month' | 'year';
  let selectedPeriod = $state<Period>('month');

  const tabs: { label: string; value: Period }[] = [
    { label: 'Hoje', value: 'day' },
    { label: 'Esta semana', value: 'week' },
    { label: 'Este mês', value: 'month' },
    { label: 'Este ano', value: 'year' },
  ];

  $effect(() => {
    // reload chart data when period changes
    loadChartData(selectedPeriod);
  });
</script>
```

**Chart.js bar chart with svelte5-chartjs:**
```svelte
<script lang="ts">
  import { Chart } from 'svelte5-chartjs';
  import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
  ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
</script>

<Chart
  type="bar"
  data={chartData}
  options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
/>
```

---

### Pattern 6: ConfirmDialog (INFRA-04)

Uses native HTML `<dialog>` — no library dependency:
```svelte
<script lang="ts">
  interface Props {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    requireReason?: boolean;
    onconfirm: (reason?: string) => void;
    oncancel: () => void;
  }

  let { open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
        requireReason = false, onconfirm, oncancel }: Props = $props();

  let dialogEl: HTMLDialogElement;
  let reason = $state('');

  $effect(() => {
    if (open) dialogEl?.showModal();
    else { dialogEl?.close(); reason = ''; }
  });
</script>

<dialog bind:this={dialogEl} ...>
  <h2>{title}</h2>
  <p>{message}</p>
  {#if requireReason}
    <textarea bind:value={reason} placeholder="Motivo obrigatório"></textarea>
  {/if}
  <button onclick={() => onconfirm(requireReason ? reason : undefined)}
          disabled={requireReason && !reason.trim()}>
    {confirmLabel}
  </button>
  <button onclick={oncancel}>{cancelLabel}</button>
</dialog>
```

---

### Anti-Patterns to Avoid

- **Using `+layout.server.ts` as the only auth guard:** SvelteKit runs layout and page load functions in parallel; leaf routes can return data before the layout guard redirects. Use `hooks.server.ts` as the primary gate.
- **Calling `requireRole()` with `throw redirect()` in SSR-loaded code without `event.parent()`:** Creates data leaks. Put role checks in `hooks.server.ts` or in each `+page.server.ts` after `await parent()`.
- **Using `svelte/store` `writable()` for page-local state:** The project uses Svelte 5 `$state` rune exclusively. Keep it consistent.
- **Importing `@tanstack/svelte-table`:** Uses `svelte/internal`, broken in Svelte 5. Use `@tanstack/table-core`.
- **Setting `loading = true` without a `try/finally`:** `authController.svelte.ts` already has this bug (missing `finally`). Fix it and establish the pattern for all new controllers.
- **Calling `response.json()` unconditionally:** The existing `apiClient.ts` does this. A 502 returning HTML throws `SyntaxError`. Add content-type check or wrap in `try/catch` with fallback.
- **Relying on `sessionStorage` for SSR reads:** `sessionStorage` is `null` on the server. `tokenStorage` already guards with `typeof window === 'undefined'`. Never call `tokenStorage` in server-side code.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT payload decoding | Custom `atob` + split logic | `jwt-decode` v4 (`jwtDecode()`) | Handles base64url padding edge cases; audited; TypeScript-native |
| Toast notifications | Custom toast state + animations | `svelte-sonner` | Focus trapping, ARIA, promise-based API, deduplication |
| Focus trap in dialogs | Custom `tabIndex` management | Native HTML `<dialog>` or `bits-ui` Dialog | Browsers handle focus trap and Escape key natively for `<dialog>` |
| Accessible headless components | Custom ARIA roles/attributes | `bits-ui` (already in ecosystem) | WAI-ARIA compliant, keyboard navigation, Svelte 5 native |
| BRL currency formatting | Custom string manipulation | `Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'})` | Zero-bundle-weight, handles separators and R$ symbol correctly |

**Key insight:** The project's existing `atob`-based JWT decoding in `tokenStorage.ts` should be replaced with `jwt-decode` to handle edge cases, but the overall approach (client-side decode for display-only role) is architecturally correct.

---

## Common Pitfalls

### Pitfall 1: Cookie Never Written — The Root Auth Blocker
**What goes wrong:** `AuthService.login()` writes tokens to `sessionStorage` only. `hooks.server.ts` checks the `access_token` cookie (server-only). These two stores never intersect. Every page load after login gets a 303 redirect to `/login`.
**Why it happens:** The original implementation had no server action — all auth was client-side JavaScript.
**How to avoid:** Migrate login to a `+page.server.ts` form action. The server writes the cookie with `cookies.set()`. The `use:enhance` callback writes sessionStorage for client-side API requests.
**Warning signs:** Login POST returns 200/tokens, but browser immediately redirects to `/login`. `document.cookie` shows no `access_token`. Network tab shows 303 on every admin page request.

### Pitfall 2: Token Refresh Race Condition
**What goes wrong:** Multiple concurrent API requests all receive 401 simultaneously. Each independently calls the refresh endpoint. Most backends use refresh token rotation (each use invalidates the old token). The second call arrives with an already-invalidated token and gets a 401 back. User is logged out despite having a valid refresh token.
**How to avoid:** Module-level `isRefreshing` flag + `refreshQueue` array in `apiClient.ts`. Only one refresh call in flight at a time; subsequent 401s queue their retry callbacks.
**Warning signs:** Random logouts after idle periods. Multiple simultaneous `POST /auth/refresh` requests in the network tab.

### Pitfall 3: Layout-Only Auth Guards Don't Propagate
**What goes wrong:** A guard in `(admin)/+layout.server.ts` does not reliably protect leaf routes. SvelteKit runs layout and page load functions concurrently during client-side navigation — a leaf `+page.server.ts` can return its data before the layout's redirect executes.
**How to avoid:** Primary guard in `hooks.server.ts` (runs before any load function). Role-specific checks in each `+page.server.ts` after `await parent()` to create an explicit dependency.
**Warning signs:** Direct URL navigation bypasses role checks. Routes return data for users who should be blocked when navigating client-side after session expiry.

### Pitfall 4: `loading` State Never Reset on Navigation Failure
**What goes wrong:** `authController.svelte.ts` sets `state.loading = true` but only resets it to `false` on the error path. If `goto('/dashboard')` throws, the login button stays permanently disabled. User must refresh.
**How to avoid:** Always use `try/finally`: `state.loading = true; try { await action(); } finally { state.loading = false; }`. Apply to every async action in every new controller.
**Warning signs:** Login button disabled after a failed navigation attempt.

### Pitfall 5: Pagination State Not Reset When Filters Change
**What goes wrong:** User is on page 5, changes a filter, page index stays at 5. API request fires with `page=5` on a 2-page result set. Table shows "no results."
**How to avoid:** Any filter state change atomically resets page to 1: treat `{ filters, page }` as a single state unit. In `setFilter()` inside any controller, always call `load(1)` rather than `load(currentPage)`.
**Warning signs:** Filters produce "no results" when data clearly exists.

### Pitfall 6: Non-JSON API Response Throws SyntaxError
**What goes wrong:** `apiClient.ts` calls `await response.json()` unconditionally. A 502 gateway error returning HTML throws `SyntaxError: Unexpected token '<'`. Caught as `NetworkFailure` but the message is a technical parse error shown to the user.
**How to avoid:** Check `response.headers.get('Content-Type')` before parsing, or wrap `.json()` in a try/catch with a `NetworkFailure` fallback.
**Warning signs:** Console shows `SyntaxError: Unexpected token '<'` during API errors.

---

## Code Examples

### Logout (AUTH-06)
```typescript
// src/routes/api/internal/logout/+server.ts
import type { RequestHandler } from './$types';
import { json, redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('access_token', { path: '/' });
  cookies.delete('refresh_token', { path: '/' });
  return json({ ok: true });
};
```

Client-side logout handler (in `AdminLayout.svelte` or a shared `logoutController`):
```typescript
async function logout() {
  await fetch('/api/internal/logout', { method: 'POST' });
  tokenStorage.clearTokens();
  goto('/login');
}
```

### Cookie Sync After Refresh
```typescript
// src/routes/api/internal/sync-token/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { accessToken } = await request.json() as { accessToken: string };
  cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600
  });
  return json({ ok: true });
};
```

### StatusBadge Color Map (Claude's discretion)
```typescript
// Color map by entity status — extend as new entities are added
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE:         { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  PENDING:        { bg: 'bg-yellow-500/15',  text: 'text-yellow-400' },
  SUSPENDED:      { bg: 'bg-orange-500/15',  text: 'text-orange-400' },
  BLOCKED:        { bg: 'bg-red-500/15',     text: 'text-red-400' },
  VERIFIED:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  PENDING_REVIEW: { bg: 'bg-yellow-500/15',  text: 'text-yellow-400' },
  REJECTED:       { bg: 'bg-red-500/15',     text: 'text-red-400' },
  UNVERIFIED:     { bg: 'bg-slate-500/15',   text: 'text-slate-400' },
  OPEN:           { bg: 'bg-orange-500/15',  text: 'text-orange-400' },
  RESOLVED:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  // Default fallback
  DEFAULT:        { bg: 'bg-slate-500/15',   text: 'text-slate-400' },
};
```

### formatCurrency — Verify Current Implementation
```typescript
// src/app/shared/utils/formatters.ts — ALREADY CORRECT, no change needed
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents / 100);
}
```

The existing `formatDocument` for CNPJ uses a numeric-only regex. Phase 1 does not require CNPJ forms, so this can remain unchanged for now. The alphanumeric CNPJ issue (active July 2026) will be addressed when merchant forms are built in Phase 2.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, vite dev | Yes | v24.12.0 | — |
| npm | Package installation | Yes | 11.5.2 | — |
| SvelteKit | Core framework | Yes (installed) | ^2.0.0 | — |
| `@tanstack/table-core` | INFRA-01 DataTable | Needs install | 8.21.3 available | — |
| `chart.js` | DASH-02 Chart | Needs install | 4.5.1 available | — |
| `svelte5-chartjs` | DASH-02 Chart wrapper | Needs install | 1.0.0 available | — |
| `svelte-sonner` | INFRA-05 Toast | Needs install | 1.1.0 available | — |
| `bits-ui` | shadcn-svelte Dialog | Needs install | 2.16.3 available | — |
| `@internationalized/date` | bits-ui peer dep | Needs install | 3.12.0 available | — |
| `jwt-decode` | AUTH-05 role decode | Needs install | 4.0.0 available | — |
| Backend API | All auth flows | Unknown — assume running locally at `http://localhost:5000` | — | Check `PUBLIC_API_BASE_URL` env var |

**Missing dependencies with no fallback:**
- Backend API must be running for any auth or dashboard feature to function during development.

**Missing dependencies with fallback:**
- All npm packages above: fallback is "feature does not work" — install is required.

---

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`, so this section is included. However, REQUIREMENTS.md and `.planning/codebase/CONCERNS.md` both explicitly confirm: **"Testes automatizados — Sem framework configurado; fora do escopo v1."** No test runner (`vitest`, `jest`, `playwright`) is in `package.json`.

Given that automated testing is explicitly out of scope for v1 and no test infrastructure exists, the planner should treat all "Test Type" entries as **manual verification** unless a test framework is added.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — not configured |
| Config file | None |
| Quick run command | `npm run check` (TypeScript + svelte-check only) |
| Full suite command | `npm run check` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login with email/password sets HttpOnly cookie | Manual | — | No test infrastructure |
| AUTH-02 | SSR and client token stores stay synchronized | Manual | — | No test infrastructure |
| AUTH-03 | Expired token refreshes transparently; concurrent requests queue | Manual | — | No test infrastructure |
| AUTH-04 | Unauthenticated routes redirect to `/login` | Manual (navigate directly) | — | No test infrastructure |
| AUTH-05 | Role extracted from JWT, available in all components | Manual (`console.log(getContext('userRole'))`) | — | No test infrastructure |
| AUTH-06 | Logout clears cookie + sessionStorage, redirects | Manual | — | No test infrastructure |
| RBAC-01 | Route with insufficient role returns 403 | Manual (login as VIEWER, navigate to ADMIN route) | — | No test infrastructure |
| RBAC-02 | Buttons hidden (not disabled) for insufficient role | Manual (DOM inspection) | — | No test infrastructure |
| RBAC-03 | 403 from backend shows access-denied message | Manual | — | No test infrastructure |
| RBAC-04 | Guards fire both SSR and client-side | Manual (disable JS, navigate) | — | No test infrastructure |
| INFRA-01 | DataTable renders, paginates, sorts | Manual (smoke test in dashboard/merchant page) | — | No test infrastructure |
| INFRA-02 | Filter primitives render and emit onChange | Manual | — | No test infrastructure |
| INFRA-03 | StatusBadge shows correct color per status | Manual (visual check) | — | No test infrastructure |
| INFRA-04 | ConfirmDialog opens, requires reason when configured, confirms | Manual | — | No test infrastructure |
| INFRA-05 | Toast appears on success/error actions | Manual | — | No test infrastructure |
| INFRA-06 | Error boundary shows friendly UI on unhandled errors | Manual (trigger a 500) | — | No test infrastructure |
| INFRA-07 | Navigating to `/` redirects to `/dashboard` (no flash) | Manual | — | No test infrastructure |
| INFRA-08 | `formatCurrency(15000)` returns `"R$ 150,00"` | `npm run check` covers type correctness only | — | No test infrastructure |
| DASH-01 | All 5 metric cards render with correct values | Manual | — | No test infrastructure |
| DASH-02 | Period tabs switch chart data; bar chart renders | Manual | — | No test infrastructure |
| DASH-03 | Alert cards appear for open disputes and pending KYC | Manual | — | No test infrastructure |

### Sampling Rate
- **Per task commit:** `npm run check` — catches TypeScript type errors and Svelte component issues
- **Per wave merge:** `npm run check` + manual browser smoke test of auth flow (login → dashboard → logout)
- **Phase gate:** All 5 success criteria verified manually before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test framework — as per explicit project decision, do not add one in Phase 1
- [ ] TypeScript strict mode already enforced via `svelte-check` — use this as the only automated gate
- [ ] Manual test checklist: create a `SMOKE_TEST.md` in `.planning/phases/01-auth-core-infrastructure/` documenting the manual verification steps for each success criterion

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `svelte/store` `writable()` | Svelte 5 `$state` rune | Svelte 5.0 (2024) | All new components use runes; no `$` store subscriptions |
| `@tanstack/svelte-table` | `@tanstack/table-core` directly | Svelte 5.0 | `svelte-table` uses `svelte/internal`, broken in Svelte 5 |
| `svelte-chartjs` (SauravKanchan) | `svelte5-chartjs` (LupusAI fork) | 2024 | Original abandoned; fork explicitly targets Svelte 5 runes |
| Slot-based component API (`<slot />`) | Svelte 5 Snippet API (`{#snippet}`) | Svelte 5.0 | DataTable custom cell rendering uses `Snippet<[col, row]>` |
| `<meta http-equiv="refresh">` | `throw redirect(302, ...)` in `+page.server.ts` | SvelteKit best practice | Immediate server-side redirect; no flash |
| Default export components | Named exports only | Project convention | All TS/Svelte exports are named; no default exports |

**Deprecated/outdated in this codebase:**
- `<meta http-equiv="refresh" ...>` in `src/routes/+page.svelte`: replace with `+page.server.ts` redirect.
- Manual `atob` + `JSON.parse` in `tokenStorage.ts` for JWT decoding: replace with `jwt-decode` v4.
- Inline styles on all components: migrate to Tailwind utility classes on all new components (do not mix patterns in the same component).

---

## Open Questions

1. **Dashboard chart endpoint — does the backend support period-based data?**
   - What we know: `API_PATHS.DASHBOARD_ADMIN` returns aggregate metrics totals. No chart endpoint exists in `apiPaths.ts`.
   - What's unclear: Does the backend expose a period-based time series endpoint? If not, DASH-02 is blocked at the data layer.
   - Recommendation: Add `DASHBOARD_CHART: '/api/v1/dashboard/admin/chart'` to `apiPaths.ts` with a `?period=day|week|month|year` query param. If the backend doesn't support this, mock the chart with static data and add a backend task to the project backlog.

2. **Open disputes and pending KYC counts for DASH-03 alerts**
   - What we know: `AdminMetrics` entity does not currently include `openDisputesCount` or `pendingKycCount` fields.
   - What's unclear: Will the backend extend the existing `/api/v1/dashboard/admin` response, or require separate API calls?
   - Recommendation: Add `openDisputesCount?: number` and `pendingKycCount?: number` to `AdminMetrics`. If the backend doesn't provide these in the metrics endpoint, issue separate requests in `DashboardPage.svelte` `onMount`. Document the API contract assumption.

3. **`use:enhance` vs direct `goto()` — how to return tokens to client after server action**
   - What we know: The `+page.server.ts` form action redirects to `/dashboard` after writing the cookie. An `enhance` callback with `return async ({ result }) => {}` runs before the redirect, but the action's redirect response doesn't include a body with tokens.
   - What's unclear: The cleanest way to populate sessionStorage post-login when the server action redirects immediately.
   - Recommendation: Change the server action to return the tokens as `return { accessToken, refreshToken }` (not redirect). The `enhance` callback then calls `tokenStorage.setTokens()` and `goto('/dashboard')` client-side. This gives the server full control of the cookie while the client gets the tokens it needs. The server action must include `access_token` and `refresh_token` tokens in its return data (not just set the cookie and redirect).

4. **`jwt-decode` on the server in `+layout.server.ts`**
   - What we know: `jwt-decode` is a browser JWT decoder. The server-side `+layout.server.ts` needs to decode the JWT to extract the role claim.
   - What's unclear: Whether `jwt-decode` works in the Node.js SSR context.
   - Recommendation: `jwt-decode` v4 is pure ESM and uses no browser-specific APIs (`atob` was in older versions; v4 uses `Buffer` or a cross-platform approach). It works in Node.js. Alternatively, use Node.js `Buffer.from(b64, 'base64').toString()` as a fallback if any issue arises.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis — `src/hooks.server.ts`, `src/app/features/auth/`, `src/app/services/api/apiClient.ts`, `src/app/shared/guards/adminGuard.ts` — all read 2026-03-24
- `npm view` registry queries — version numbers verified 2026-03-24 for all 7 new packages
- `.planning/research/STACK.md` — library recommendations with rationale, researched 2026-03-24
- `.planning/research/ARCHITECTURE.md` — SSR auth pattern, token refresh pattern, DataTable pattern
- `.planning/research/PITFALLS.md` — race conditions, layout guard propagation, cookie bugs
- `.planning/codebase/ARCHITECTURE.md`, `CONVENTIONS.md`, `CONCERNS.md` — direct codebase analysis

### Secondary (MEDIUM confidence)
- SvelteKit official docs — form actions, cookies API, hooks.server.ts, `use:enhance`
- TanStack Table docs — `@tanstack/table-core` framework-agnostic usage
- svelte-sonner GitHub — Svelte 5 runes refactor in v1.x confirmed
- bits-ui.com/docs — Dialog component, Svelte 5 compatibility confirmed

### Tertiary (LOW confidence — flag for validation)
- Dashboard chart endpoint existence: assumed based on `DASHBOARD_ADMIN` pattern; backend API not directly inspected
- `jwt-decode` v4 Node.js SSR compatibility: stated as cross-platform; not verified in this specific SvelteKit version combination

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified from npm registry 2026-03-24
- Architecture patterns: HIGH — based on direct codebase inspection + existing research docs
- Auth fix pattern: HIGH — root cause confirmed by code inspection; fix pattern documented in ARCHITECTURE.md
- Pitfalls: HIGH for auth/RBAC/refresh (documented in existing PITFALLS.md); MEDIUM for dashboard chart endpoint (backend unknown)
- Dashboard: MEDIUM — entity and service layer exists; chart/alerts endpoint availability is an open question

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 for stable stack items; verify dashboard backend endpoints before planning DASH-02 and DASH-03
