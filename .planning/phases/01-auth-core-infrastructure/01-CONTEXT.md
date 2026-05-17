# Phase 1: Auth + Core Infrastructure — Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Corrigir o fluxo SSR de autenticação (cookie HttpOnly nunca escrito), implementar token refresh automático com fila para requisições concorrentes, aplicar RBAC guards (SSR + cliente), e criar a camada de componentes compartilhados (DataTable, StatusBadge, ConfirmDialog, Toast, filtros, error boundary) que todas as features seguintes vão consumir. Inclui melhorias no Dashboard existente.

**Fora de escopo:** Implementação de features (Merchants, Transactions, etc.) — apenas infraestrutura reutilizável.

</domain>

<decisions>
## Implementation Decisions

### Componentes de UI
- **Biblioteca base: shadcn-svelte** — componentes copiados para o projeto (`src/lib/components/ui/`), Tailwind CSS, Svelte 5 nativo. Usa `bits-ui` por baixo. Zero lock-in, controle total sobre o markup.
- DataTable, Dialog, Toast, Badge, Input, Select, Button e demais componentes shared seguem o padrão shadcn-svelte
- `svelte-sonner` para sistema de toast (já identificado na research)
- `@tanstack/table-core` (não `@tanstack/svelte-table`) para lógica de tabela — headless, funciona com `$state` do Svelte 5

### Auth SSR
- **Fluxo de login: `+page.server.ts` com form action + `use:enhance` no cliente**
  - O `+page.server.ts` de `/login` recebe as credenciais, chama o backend, e escreve o cookie `access_token` via `cookies.set()` do SvelteKit
  - `use:enhance` no `LoginPage.svelte` faz a submissão progressiva sem reload de página
  - Após login bem-sucedido, o server action faz redirect para `/dashboard`
- **Cookie HttpOnly: sim** — `access_token` escrito como HttpOnly pelo server, inacessível ao JS do cliente
- **sessionStorage no cliente:** o accessToken também é salvo em sessionStorage para que o `apiClient.ts` o injete nas requisições fetch do cliente sem precisar fazer round-trip ao servidor
- **Sincronização pós-refresh:** após renovar o token no cliente, um endpoint interno `/api/internal/sync-token` (POST, SvelteKit API route) re-escreve o cookie HttpOnly para manter o SSR sincronizado

### Token Refresh
- Interceptor dentro de `apiClient.ts` — detecta 401, faz refresh, re-executa requisição
- **Fila de concorrência:** requisições que chegam durante o refresh são enfileiradas e re-executadas após o refresh completar (não disparam múltiplos refreshes simultâneos)
- Refresh falhou → logout completo (limpa cookie + sessionStorage)

### RBAC na UI
- **Elementos sem permissão: ocultar** (não desabilitar) — botões e menus inexistentes no DOM para o role insuficiente
- **Role disponível via `setContext`/`getContext`** — injetado no layout admin (`+layout.svelte`) após decodificar o JWT do sessionStorage, consumível por qualquer componente filho
- Helper `hasPermission(userRole, requiredRole)` → compara níveis numéricos (VIEWER=1, SUPPORT=2, ADMIN=3, SUPER_ADMIN=4)
- Guards SSR em `+layout.server.ts` do grupo `(admin)` — lê cookie, decodifica JWT, injeta em `event.locals`, retorna redirect 302 para `/login` se não autenticado, 403 se role insuficiente
- `adminGuard.ts` existente pode ser reaproveitado como helper cliente-side, mas a fonte de verdade do SSR é `hooks.server.ts` + `+layout.server.ts`

### Dashboard
- **Filtro de período: tabs rápidas** — "Hoje / Esta semana / Este mês / Este ano" — sem date picker
- **Gráfico: bar chart** — barras por período (dia/semana/mês conforme tab selecionada) para volume e transações
- Biblioteca de gráfico: `chart.js` + wrapper Svelte 5 (ver research STACK.md)
- Alertas: disputas abertas + KYC pendentes como cards de alerta clicáveis acima das métricas

### Infraestrutura Compartilhada
- Redirecionamento de `/` para `/dashboard`: substituir meta refresh por `redirect(302, '/dashboard')` em `+page.server.ts`
- Formatação de moeda: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` — helper em `src/app/shared/utils/formatters.ts` (já existe, completar)
- `+error.svelte` global em `src/routes/+error.svelte`

### Claude's Discretion
- Estrutura interna do DataTable genérico (column defs API, slot para custom cells)
- Variantes do StatusBadge (cores por enum)
- Props do ConfirmDialog (texto, botões, campo de motivo opcional)
- Animações e transições dos componentes shadcn

</decisions>

<canonical_refs>
## Canonical References

Downstream agents MUST read these before planning or implementing.

### Arquitetura e Padrões
- `.planning/codebase/ARCHITECTURE.md` — Clean Architecture por feature, padrão Either<Failure,T>
- `.planning/codebase/CONVENTIONS.md` — nomenclatura, estrutura de componentes, imports
- `.planning/codebase/CONCERNS.md` — bugs conhecidos (cookie, adminGuard, meta refresh)

### Research
- `.planning/research/STACK.md` — bibliotecas recomendadas com versões (tanstack, chart.js, jwt-decode, svelte-sonner)
- `.planning/research/ARCHITECTURE.md` — padrão SSR auth, token refresh com fila, DataTable genérico
- `.planning/research/PITFALLS.md` — race condition de refresh, CNPJ alfanumérico, float aritmético

### Projeto
- `.planning/REQUIREMENTS.md` — AUTH-01 a AUTH-06, RBAC-01 a RBAC-04, INFRA-01 a INFRA-08, DASH-01 a DASH-03
- `.planning/ROADMAP.md` — Phase 1 success criteria

### Design System
- `docs/StyleGuide.md` — Style guide visual do projeto (cores, tipografia, espaçamento, componentes) — DEVE ser seguido pelo UI researcher ao gerar o UI-SPEC

### Código Existente (ler antes de modificar)
- `src/hooks.server.ts` — guard SSR atual (lê cookie, precisa ser expandido com role check)
- `src/app/features/auth/services/AuthService.ts` — salva tokens em sessionStorage (precisa também escrever cookie)
- `src/app/features/auth/presentation/pages/LoginPage.svelte` — migrar para form action
- `src/app/services/api/apiClient.ts` — adicionar interceptor de refresh
- `src/app/shared/guards/adminGuard.ts` — helper existente, integrar no fluxo
- `src/app/shared/utils/formatters.ts` — completar formatação de moeda

</canonical_refs>

<specifics>
## Specific Ideas

- O `authController.svelte.ts` existente usa padrão `createAuthController()` com `$state` — manter este padrão para novos controllers
- shadcn-svelte: instalar via CLI (`npx shadcn-svelte@latest init`) para gerar `components.json` e estrutura base
- O `ServiceLocator` existente pode ser ignorado por hora — não é prioridade desta fase

</specifics>

<deferred>
## Deferred Ideas

- Nenhuma ideia fora de escopo foi mencionada durante a discussão.

</deferred>

---

*Phase: 01-auth-core-infrastructure*
*Context gathered: 2026-03-24 via discuss-phase*
