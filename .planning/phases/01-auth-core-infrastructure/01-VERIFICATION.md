---
phase: 01-auth-core-infrastructure
verified: 2026-03-25T12:00:00Z
status: human_needed
score: 21/21 requirements verified
re_verification:
  previous_status: gaps_found
  previous_score: 17/21
  gaps_closed:
    - "Gráfico de volume e transações por período está disponível no dashboard (DASH-02)"
    - "Alertas visuais de disputas abertas e verificações pendentes de KYC exibidos no dashboard (DASH-03)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Fazer login com admin válido e verificar que cookie access_token aparece como HttpOnly no DevTools"
    expected: "DevTools > Application > Cookies mostra access_token com flag HttpOnly marcado"
    why_human: "Flags de cookie não são verificáveis via grep no código-fonte"
  - test: "Simular token expirado e fazer uma request autenticada, verificar que o refresh é transparente"
    expected: "Request é executada com sucesso após refresh automático sem redirecionamento para login; Network tab mostra request para /api/v1/auth/refresh seguida de retry da request original"
    why_human: "Comportamento de interceptação de rede e retry é comportamento em runtime"
  - test: "Fazer login como VIEWER e verificar que o item 'Admins' não aparece na sidebar"
    expected: "Sidebar não contém link '/admin-users' para role VIEWER"
    why_human: "Renderização condicional de DOM requer browser; a lógica está wired mas a renderização final depende do JWT do backend"
  - test: "Fazer login como SUPER_ADMIN e verificar que o item 'Admins' aparece na sidebar"
    expected: "Sidebar contém link '/admin-users' para role SUPER_ADMIN"
    why_human: "Renderização condicional de DOM requer browser"
  - test: "Verificar que o bar chart de volume/transações renderiza corretamente ao trocar as tabs Hoje/Esta semana/Este mês/Este ano"
    expected: "Cada tab dispara uma nova chamada à API /api/v1/dashboard/admin/series?period={period}; o gráfico atualiza com os dados recebidos; empty state 'Sem dados para o período selecionado.' é exibido quando a API retorna array vazio"
    why_human: "Comportamento de re-fetch reativo ($effect + period tabs) requer browser com API real ou mock server"
  - test: "Verificar que alert cards de disputas e KYC são exibidos somente quando os counts > 0"
    expected: "Com openDisputes=3: card de danger com '3 disputas abertas' aparece acima dos metric cards e navega para /disputes ao clicar. Com pendingKycCount=2: card de warning com '2 verificações pendentes' aparece e navega para /merchants?verification=PENDING_REVIEW ao clicar. Com ambos = 0: nenhum alert card é exibido."
    why_human: "Renderização condicional depende de dados retornados pela API em runtime"
---

# Phase 01: Auth Core Infrastructure — Verification Report

**Phase Goal:** Auth + Core Infrastructure completa — login/logout com cookie HttpOnly, SSR guards, token refresh com fila, RBAC por role, sidebar filtrada, componentes shared e dashboard
**Verified:** 2026-03-25
**Status:** human_needed (all automated checks passed; 6 runtime behaviors require browser verification)
**Re-verification:** Yes — after gap closure via plan 01-05

---

## Re-verification Context

Previous verification (initial, 2026-03-25) found status `gaps_found` with score 17/21. Two gaps were identified:

- DASH-02: `DashboardPage.svelte` had no chart implementation despite `svelte5-chartjs` being installed
- DASH-03: `AdminMetrics` lacked `openDisputes`/`pendingKycCount` fields; no alert section in page

Plan 01-05 was created to close these gaps. This re-verification confirms both gaps are now closed.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin submete email/senha e cookie HttpOnly access_token é escrito | ✓ VERIFIED | `+page.server.ts` linha 44-45: `cookies.set('access_token', ..., { httpOnly: true })` |
| 2 | Após login, admin permanece logado via cookie SSR | ✓ VERIFIED | `hooks.server.ts` lê `event.cookies.get('access_token')` e injeta em `event.locals.accessToken` |
| 3 | Logout limpa cookie HttpOnly e sessionStorage | ✓ VERIFIED | `/logout/+page.server.ts` deleta cookies; `logout/+page.svelte` chama `tokenStorage.clearTokens()` em onMount |
| 4 | Rotas admin sem cookie redirecionam para /login | ✓ VERIFIED | `hooks.server.ts` faz `redirect(303, '/login')` quando `!isPublic && !token` |
| 5 | Token expirado (401) renovado automaticamente pelo apiClient | ✓ VERIFIED | `apiClient.ts` linha 17-18: `let isRefreshing = false`, `let refreshQueue[]`; intercepta 401 e retry com `_isRetry: true` |
| 6 | Múltiplas requisições 401 concorrentes disparam apenas um refresh | ✓ VERIFIED | `let isRefreshing = false` + `refreshQueue.push()` garante single-refresh pattern (linhas 109-115) |
| 7 | Role do admin disponível via getContext em todo componente filho | ✓ VERIFIED | `(admin)/+layout.svelte` chama `setContext('adminRole', ...)` com valor de `data.adminRole` (SSR) |
| 8 | Item de menu /admin-users ausente do DOM para roles não-SUPER_ADMIN | ✓ VERIFIED | `AdminLayout.svelte` usa `$derived` com `hasPermission(role, 'SUPER_ADMIN')` para filtrar navItems |
| 9 | 403 do backend exibe mensagem inline (infraestrutura) | ✓ VERIFIED | `ForbiddenFailure`, `isForbidden()`, `routeMessages.ts` implementam pipeline 403; rendering por feature em Phase 2+ |
| 10 | Guards SSR em (admin) bloqueiam acesso por role | ✓ VERIFIED | `+layout.server.ts` expõe `adminRole` via locals; `adminGuard.ts` provê `requireRole()` para uso por feature pages |
| 11 | Navegação para / redireciona para /dashboard sem flash | ✓ VERIFIED | `+page.server.ts` lança `redirect(302, '/dashboard')` server-side |
| 12 | Erros não tratados exibem UI amigável | ✓ VERIFIED | `+error.svelte` exibe `$page.status`, "Algo deu errado", `$page.error?.message`, botão Voltar |
| 13 | StatusBadge exibe badge com cor correta para 15 status | ✓ VERIFIED | `StatusBadge.svelte` tem `STATUS_MAP` com 15 entradas; MED tem animação pulsante |
| 14 | ConfirmDialog abre/fecha programaticamente com campo de motivo opcional | ✓ VERIFIED | `ConfirmDialog.svelte` usa `$effect(() => dialog.showModal()/close())`; `requiresReason` prop; `canConfirm` derivado |
| 15 | DataTable<T> renderiza linhas paginadas com sorting | ✓ VERIFIED | `DataTable.svelte` importa `createTable`, `getCoreRowModel`, `getSortedRowModel` de `@tanstack/table-core` |
| 16 | Filtros SearchInput/SelectFilter/DateRangeFilter disponíveis e funcionais | ✓ VERIFIED | Três componentes existem em `src/app/shared/widgets/filters/` com debounce, dropdown, date inputs |
| 17 | formatCurrency converte centavos para BRL pt-BR | ✓ VERIFIED | 3 testes passando confirmam `formatCurrency(1000)` contém 'R$' e '10' |
| 18 | Dashboard exibe gráfico de barras de volume e transações com 4 tabs de período | ✓ VERIFIED | `DashboardPage.svelte`: `import { Bar } from 'svelte5-chartjs'`, `ChartJS.register(...)`, `activePeriod` state, `PERIODS` array com Hoje/Esta semana/Este mês/Este ano, `$effect` que chama `service.getChartData(period)`, `<Bar data={barChartData} .../>` |
| 19 | Dashboard exibe alert cards de disputas abertas e KYC pendente acima dos metric cards | ✓ VERIFIED | `DashboardPage.svelte` linha 152: `{#if metrics && (metrics.openDisputes > 0 \|\| metrics.pendingKycCount > 0)}`; `AlertTriangle` e `Clock` de lucide-svelte; navigate para `/disputes` e `/merchants?verification=PENDING_REVIEW` |
| 20 | AdminMetrics entity contém campos openDisputes e pendingKycCount | ✓ VERIFIED | `AdminMetrics.ts` linha 11-12: `openDisputes: number` e `pendingKycCount: number` adicionados |
| 21 | DashboardService/DashboardRepository expõem getChartData(period) wired para API real | ✓ VERIFIED | `DashboardRepository.getChartData` chama `apiClient.get(API_PATHS.DASHBOARD_ADMIN_SERIES(period))`; `DashboardService.getChartData` delega para repo |

**Score:** 21/21 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/routes/login/+page.server.ts` | Form action que escreve cookie HttpOnly | ✓ VERIFIED | `cookies.set('access_token', ..., { httpOnly: true })` linha 44 |
| `src/routes/api/internal/sync-token/+server.ts` | POST endpoint para re-sincronizar cookie | ✓ VERIFIED | `export const POST` com `cookies.set('access_token', { httpOnly: true })` |
| `src/hooks.server.ts` | Guard SSR que injeta locals | ✓ VERIFIED | `event.locals.accessToken = token` + `event.locals.adminRole` via jwtDecode |
| `src/routes/(admin)/+layout.server.ts` | Load function que expõe adminRole | ✓ VERIFIED | `export const load` retorna `{ adminRole: locals.adminRole }` |
| `src/app.d.ts` | Declaração de App.Locals | ✓ VERIFIED | `interface Locals { accessToken: string \| null; adminRole: string \| null }` |
| `src/app/services/api/apiClient.ts` | Interceptor de refresh com fila | ✓ VERIFIED | `let isRefreshing = false`, `let refreshQueue`, `refreshAccessToken()`, sync-token call |
| `src/routes/(admin)/+layout.svelte` | setContext + Toaster | ✓ VERIFIED | `setContext('adminRole', ...)`, `<Toaster .../>` |
| `src/app/shared/widgets/AdminLayout.svelte` | RBAC menu com Lucide icons | ✓ VERIFIED | `hasPermission(role, 'SUPER_ADMIN')` em `$derived`, LogOut icon, form action logout |
| `src/routes/logout/+page.server.ts` | Limpa cookies e redireciona | ✓ VERIFIED | `cookies.delete('access_token')`, `redirect(303, '/login')` |
| `src/routes/+page.server.ts` | Redirect 302 para /dashboard | ✓ VERIFIED | `throw redirect(302, '/dashboard')` |
| `src/routes/+error.svelte` | Error boundary global | ✓ VERIFIED | `$page.error?.message`, "Algo deu errado", botão Voltar |
| `src/app/shared/widgets/StatusBadge.svelte` | Badge com 15 status mapeados | ✓ VERIFIED | STATUS_MAP com 15 entradas; MED com pulsing animation |
| `src/app/shared/widgets/ConfirmDialog.svelte` | Dialog com requiresReason | ✓ VERIFIED | `dialog.showModal()` via `$effect`, `requiresReason` prop, `canConfirm` derivado |
| `src/app/shared/widgets/DataTable.svelte` | Tabela genérica com @tanstack/table-core | ✓ VERIFIED | `createTable`, `getCoreRowModel`, empty state "Nenhum resultado", skeleton-pulse |
| `src/app/shared/widgets/Pagination.svelte` | Controles prev/next | ✓ VERIFIED | `onPageChange` prop, `min-height: 44px` |
| `src/app/shared/widgets/filters/SearchInput.svelte` | Input com debounce e ícone | ✓ VERIFIED | Search icon inset, `debounceMs` prop, clearTimeout pattern |
| `src/app/shared/widgets/filters/SelectFilter.svelte` | Dropdown com checkmark | ✓ VERIFIED | Check icon cyan `#01FAFB`, dropdown com overlay para fechar ao clicar fora |
| `src/app/shared/widgets/filters/DateRangeFilter.svelte` | Dois inputs de data | ✓ VERIFIED | Dois `type="date"`, Calendar icon inset, `onChange({ from, to })` |
| `src/app/services/storage/tokenStorage.ts` | usa jwt-decode | ✓ VERIFIED | `import { jwtDecode } from 'jwt-decode'`; exporta `decodeJwtPayload` |
| `vitest.config.ts` | Vitest com jsdom | ✓ VERIFIED | `environment: 'jsdom'`, `include: ['src/**/*.{test,spec}.{js,ts}']` |
| `src/app/features/dashboard/domain/entities/AdminMetrics.ts` | DASH-03: openDisputes e pendingKycCount | ✓ VERIFIED | Campos presentes nas linhas 11-12: `openDisputes: number; pendingKycCount: number` |
| `src/app/features/dashboard/domain/entities/DashboardSeries.ts` | DASH-02: tipos de série temporal | ✓ VERIFIED | Criado com `DashboardPeriod`, `DashboardSeriesPoint`, `DashboardChartData` — todos exportados |
| `src/app/features/dashboard/data/repositories/DashboardRepository.ts` | getChartData(period) | ✓ VERIFIED | Método presente na linha 28; chama `API_PATHS.DASHBOARD_ADMIN_SERIES(period)` via `apiClient.get` |
| `src/app/features/dashboard/services/DashboardService.ts` | getChartData delegando para repo | ✓ VERIFIED | Método presente na linha 13; delega para `this.repo.getChartData(period)` |
| `src/core/constants/apiPaths.ts` | DASHBOARD_ADMIN_SERIES | ✓ VERIFIED | `DASHBOARD_ADMIN_SERIES: (period: string) => \`/api/v1/dashboard/admin/series?period=${period}\`` na linha 51 |
| `src/app/features/dashboard/presentation/pages/DashboardPage.svelte` | DASH-02: bar chart + tabs; DASH-03: alert cards | ✓ VERIFIED | `import { Bar } from 'svelte5-chartjs'`; `ChartJS.register`; `activePeriod` state; `$effect` com `service.getChartData`; `PERIODS` com 4 entradas; `openDisputes`/`pendingKycCount` renderizados condicionalmente |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `+page.server.ts` (login) | `cookies.set(access_token)` | form action SvelteKit | ✓ WIRED | linha 44: `cookies.set('access_token', ...)` com `httpOnly: true` |
| `hooks.server.ts` | `event.locals.accessToken` | `event.cookies.get('access_token')` | ✓ WIRED | linha 11-12: token lido e injetado em locals |
| `(admin)/+layout.server.ts` | `locals.adminRole` via data | `return { adminRole: locals.adminRole }` | ✓ WIRED | retorna adminRole decodificado pelo hooks |
| `apiClient.ts` | `/api/internal/sync-token` | fetch POST após refresh bem-sucedido | ✓ WIRED | fire-and-forget fetch após setTokens |
| `(admin)/+layout.svelte` | `getContext(adminRole)` | `setContext('adminRole', roleFromSSR)` | ✓ WIRED | setContext com valor SSR fallback sessionStorage |
| `AdminLayout.svelte` | `hasPermission` para filtrar menu | `$derived` com `hasPermission(role, 'SUPER_ADMIN')` | ✓ WIRED | navItems `$derived` usa hasPermission |
| `DashboardPage.svelte` | `DashboardService.getChartData` | `$effect(() => service.getChartData(activePeriod))` | ✓ WIRED | linha 49: `service.getChartData(period).then(...)` dentro de `$effect` |
| `DashboardRepository` | `/api/v1/dashboard/admin/series?period=` | `apiClient.get(API_PATHS.DASHBOARD_ADMIN_SERIES(period))` | ✓ WIRED | linha 30: `apiClient.get<DashboardChartData>(API_PATHS.DASHBOARD_ADMIN_SERIES(period))` |
| `DashboardPage.svelte` | `metrics.openDisputes` / `metrics.pendingKycCount` | `{#if metrics.openDisputes > 0}` e `{#if metrics.pendingKycCount > 0}` | ✓ WIRED | linhas 154 e 182: campos renderizados condicionalmente |
| `DashboardPage.svelte` | `svelte5-chartjs Bar` | `import { Bar } from 'svelte5-chartjs'` + `<Bar data={barChartData} .../>` | ✓ WIRED | linha 12 (import) e linha 267 (`<Bar .../>`); ChartJS.register na linha 22 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `DashboardPage.svelte` | `metrics` (AdminMetrics) | `DashboardService.getMetrics()` → `DashboardRepository` → `apiClient.get(DASHBOARD_ADMIN)` | Sim — chama API real `/api/v1/dashboard/admin` | ✓ FLOWING |
| `DashboardPage.svelte` | `chartData` (DashboardChartData) | `service.getChartData(activePeriod)` → `DashboardRepository.getChartData` → `apiClient.get(DASHBOARD_ADMIN_SERIES(period))` | Sim — chama API real `/api/v1/dashboard/admin/series?period={period}` | ✓ FLOWING |
| `DashboardPage.svelte` | `metrics.openDisputes` / `metrics.pendingKycCount` | mesma origin de `metrics` — campos do `AdminMetrics` retornados pelo `getMetrics()` | Sim — campos presentes na interface, aguardados da API real | ✓ FLOWING |
| `(admin)/+layout.svelte` | `data.adminRole` | `+layout.server.ts` → `locals.adminRole` → `hooks.server.ts` → JWT decode | Sim — decodifica JWT real do cookie | ✓ FLOWING |

---

### Behavioral Spot-Checks

Step 7b: Servidor não está em execução no ambiente de verificação. Checks estáticos executados; comportamentos de runtime roteados para verificação humana.

| Behavior | Status |
|----------|--------|
| Module exports: `tokenStorage.getAdminRole()` exportado | ✓ PASS — verificado via leitura do arquivo |
| `hasPermission('VIEWER', 'SUPER_ADMIN')` retorna false | ✓ PASS — 6 testes RBAC passando no vitest (relatado no SUMMARY 01-05: 12/12 passando) |
| `formatCurrency(1000)` contém 'R$' e '10' | ✓ PASS — 3 testes de formatCurrency passando no vitest |
| `Bar` importado de `svelte5-chartjs` e `ChartJS.register` executado em DashboardPage | ✓ PASS — verificado via leitura direta do arquivo |
| `getChartData` wired de DashboardPage → DashboardService → DashboardRepository → apiClient | ✓ PASS — cadeia de chamadas verificada via leitura dos 4 arquivos |
| Alert cards condicionais para openDisputes e pendingKycCount | ✓ PASS — `{#if metrics.openDisputes > 0}` e `{#if metrics.pendingKycCount > 0}` presentes no template |
| Dashboard chart rendering com dados reais (browser) | ? SKIP — requer browser com API real |
| RBAC de menu por role (browser) | ? SKIP — requer browser com JWT real |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| AUTH-01 | 01-01 | Login com email/senha via /api/v1/auth/admin/login | ✓ SATISFIED | `+page.server.ts` faz fetch para o endpoint correto com email/password |
| AUTH-02 | 01-01 | Tokens persistidos em cookie HttpOnly + sessionStorage | ✓ SATISFIED | Cookie escrito server-side; `tokenStorage.setTokens()` chamado no `use:enhance` callback |
| AUTH-03 | 01-02 | Refresh transparente com fila de concorrência | ✓ SATISFIED | `apiClient.ts` com `isRefreshing`, `refreshQueue[]`, retry pattern |
| AUTH-04 | 01-01 | Rotas admin redirecionam sem cookie | ✓ SATISFIED | `hooks.server.ts` redireciona para `/login` quando token ausente |
| AUTH-05 | 01-02 | Role extraído do JWT disponível globalmente | ✓ SATISFIED | `jwtDecode` em `tokenStorage.getAdminRole()`; `setContext('adminRole')` no layout admin |
| AUTH-06 | 01-01 | Logout limpa tokens e redireciona | ✓ SATISFIED | `/logout/+page.server.ts` deleta cookies + redirect 303; `clearTokens()` em onMount |
| RBAC-01 | 01-02 | Rotas protegidas por role mínimo | ✓ SATISFIED | `hasPermission()` em `adminGuard.ts`; `requireRole()` disponível para feature pages |
| RBAC-02 | 01-02 | Itens de menu ocultados (não desabilitados) quando role insuficiente | ✓ SATISFIED | `AdminLayout.svelte` remove item `/admin-users` do DOM via `$derived` |
| RBAC-03 | 01-02 | 403 exibe mensagem inline (não redireciona para login) | ✓ SATISFIED | `ForbiddenFailure`, `isForbidden()`, `routeMessages.ts` formam pipeline completo; renderização por feature |
| RBAC-04 | 01-02 | Guards em SSR e cliente | ✓ SATISFIED | SSR: `hooks.server.ts` + `+layout.server.ts`; cliente: `requireRole()`/`requireAuth()` disponíveis |
| INFRA-01 | 01-04 | DataTable<T> genérico com paginação e cell slots | ✓ SATISFIED | `DataTable.svelte` com `@tanstack/table-core`, sorting, paginação, empty state, skeleton |
| INFRA-02 | 01-04 | Filtros reutilizáveis: texto, status, período | ✓ SATISFIED | `SearchInput`, `SelectFilter`, `DateRangeFilter` em `src/app/shared/widgets/filters/` |
| INFRA-03 | 01-03 | StatusBadge com mapeamento de cor por entidade | ✓ SATISFIED | 15 status mapeados; MED com pulsing animation |
| INFRA-04 | 01-03 | ConfirmDialog com campo de motivo opcional | ✓ SATISFIED | Native `<dialog>` com `requiresReason`, `canConfirm` derivado, backdrop |
| INFRA-05 | 01-02 | Toast/notificação svelte-sonner | ✓ SATISFIED | `<Toaster>` montado em `(admin)/+layout.svelte`; svelte-sonner em package.json |
| INFRA-06 | 01-03 | Error boundary +error.svelte | ✓ SATISFIED | Exibe `$page.status`, "Algo deu errado", mensagem de erro, botão Voltar |
| INFRA-07 | 01-03 | Redirect de / para /dashboard server-side | ✓ SATISFIED | `+page.server.ts` com `redirect(302, '/dashboard')` |
| INFRA-08 | 01-03 | formatCurrency centavos para BRL pt-BR | ✓ SATISFIED | 3 testes passando; implementação via `Intl.NumberFormat` |
| DASH-01 | 01-04 (implícito) | Cards de métricas globais: volume, transações, saldo, taxas, merchants | ✓ SATISFIED | `DashboardPage.svelte` exibe 4 metric cards com dados reais via `getMetrics()` |
| DASH-02 | 01-05 | Gráfico de volume e transações por período (diário/semanal/mensal) | ✓ SATISFIED | `DashboardPage.svelte` renderiza `<Bar>` via `svelte5-chartjs` com 4 period tabs; dados de `getChartData(activePeriod)` via `$effect`; `DashboardSeries.ts` + `DashboardRepository.getChartData` + `DASHBOARD_ADMIN_SERIES` wired |
| DASH-03 | 01-05 | Alertas visuais: disputas abertas, verificações pendentes de KYC | ✓ SATISFIED | `AdminMetrics` tem `openDisputes` e `pendingKycCount`; `DashboardPage.svelte` renderiza alert cards danger/warning condicionalmente acima dos metric cards; navegação para `/disputes` e `/merchants?verification=PENDING_REVIEW` |

**Nota de cobertura:** DASH-01 foi implementado implicitamente em 01-04 (nenhum plano o reivindicou explicitamente no frontmatter `requirements:`). DASH-02 e DASH-03 foram reivindicados e entregues pelo plano 01-05.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/auth/__tests__/auth.test.ts` | 46-51 | `expect(Array.isArray([])).toBe(true)` — placeholder que sempre passa | ⚠️ Warning | Teste de AUTH-03 não testa a lógica real da fila de refresh; dá false confidence. Nenhum bloqueador funcional — lógica real foi verificada via leitura direta de `apiClient.ts`. |

Nenhum anti-padrão novo introduzido pelo plano 01-05. DashboardPage.svelte não tem `return null`, `return []`, `return {}` ou handlers vazios — a implementação é substantiva e wired.

---

### Human Verification Required

**1. Cookie HttpOnly após login**

**Test:** Fazer login com credenciais válidas; abrir DevTools > Application > Cookies > `localhost`
**Expected:** Cookie `access_token` presente com flag HttpOnly marcada; `refresh_token` também HttpOnly
**Why human:** Flags de cookie HTTP-only não podem ser inspecionadas via JavaScript ou grep de código-fonte

**2. Refresh transparente de token**

**Test:** Usar DevTools para expirar ou substituir o `access_token` por um token inválido no cookie; fazer qualquer ação autenticada na UI
**Expected:** A ação completa com sucesso após o refresh automático, sem redirecionamento para login; Network tab mostra request para `/api/v1/auth/refresh` seguida de retry da request original
**Why human:** Comportamento de interceptação de rede e retry é comportamento em runtime

**3. RBAC de menu por role (VIEWER)**

**Test:** Login como VIEWER (role no JWT = 'VIEWER'); inspecionar sidebar
**Expected:** VIEWER não vê item "Admins" (/admin-users) na sidebar
**Why human:** Renderização condicional de DOM requer browser; a lógica está wired mas a renderização final depende do JWT do backend

**4. RBAC de menu por role (SUPER_ADMIN)**

**Test:** Login como SUPER_ADMIN; inspecionar sidebar
**Expected:** SUPER_ADMIN vê item "Admins" na sidebar
**Why human:** Renderização condicional de DOM requer browser

**5. Bar chart renderiza e atualiza ao trocar período**

**Test:** Navegar para /dashboard logado; clicar nas tabs Hoje / Esta semana / Este mês / Este ano em sequência
**Expected:** Cada clique dispara request para `/api/v1/dashboard/admin/series?period={today|week|month|year}`; gráfico de barras atualiza com dados do período; "Sem dados para o período selecionado." exibido quando API retorna pontos vazios
**Why human:** Reatividade `$effect` + troca de period tabs requer browser com servidor real ou mock; não é verificável estaticamente

**6. Alert cards de disputas e KYC exibidos condicionalmente**

**Test:** Com backend retornando `openDisputes > 0`: verificar card danger vermelho acima dos metric cards, clicar e confirmar navegação para /disputes. Com `pendingKycCount > 0`: verificar card warning amarelo, clicar e confirmar navegação para /merchants?verification=PENDING_REVIEW. Com ambos = 0: confirmar ausência de qualquer alert.
**Expected:** Alert cards aparecem/desaparecem conforme os counts retornados pela API; hover effects visuais funcionam; cliques navegam para rotas corretas
**Why human:** Depende de dados retornados pela API em runtime; condicional `{#if metrics.openDisputes > 0}` está corretamente implementado mas requer dados reais para validação end-to-end

---

### Re-verification: Gap Closure Confirmation

| Gap (Previous) | Status | Evidence |
|----------------|--------|----------|
| DASH-02: DashboardPage sem chart | CLOSED | `Bar` de `svelte5-chartjs` importado e renderizado; `ChartJS.register` executado; `activePeriod` state reativo com `$effect` que chama `service.getChartData(period)` |
| DASH-03: AdminMetrics sem openDisputes/pendingKycCount; sem alertas | CLOSED | `AdminMetrics.ts` linha 11-12 tem ambos os campos; DashboardPage.svelte renderiza condicionalmente dois alert cards (danger + warning) com ícones Lucide e navegação |

**Regressions:** Nenhuma. Todos os 17 itens verificados na verificação inicial foram confirmados via regressão rápida (grep anchors nas chaves estruturais: `cookies.set + httpOnly`, `isRefreshing + refreshQueue`, `hasPermission + $derived`, wiring de setContext).

---

### Gaps Summary

Nenhum gap automaticamente verificável restante.

Todos os 21 requisitos de Phase 1 (AUTH-01 a AUTH-06, RBAC-01 a RBAC-04, INFRA-01 a INFRA-08, DASH-01 a DASH-03) estão implementados, substantivos e wired para dados reais. A fase está funcionalmente completa.

Os únicos itens pendentes são 6 verificações de comportamento em runtime que requerem browser com API disponível — listados na seção Human Verification Required acima.

---

_Verified: 2026-03-25_
_Verifier: Claude (gsd-verifier)_
_Re-verification after gap closure via plan 01-05_
