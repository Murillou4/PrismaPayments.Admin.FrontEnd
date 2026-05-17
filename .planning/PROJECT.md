# PrismaPayments Admin Frontend

## What This Is

Painel administrativo interno da plataforma Prisma Payments, usado pela equipe interna para monitorar métricas globais, gerenciar merchants (aprovação, KYC, suspensão), visualizar transações cross-merchant, resolver disputas, configurar regras de taxas, gerenciar usuários admin e acessar diagnósticos e logs HTTP. Construído com SvelteKit + TypeScript + Tailwind seguindo Clean Architecture (domain → data → presentation por feature).

## Core Value

Equipe interna deve conseguir operar e supervisionar toda a plataforma de pagamentos — aprovar merchants, resolver disputas e monitorar saúde do sistema — através de uma interface confiável e com controle de acesso por role.

## Requirements

### Validated

- ✓ Estrutura de projeto SvelteKit + TypeScript + Tailwind — existente
- ✓ Clean Architecture por feature (domain/data/presentation) — padrão estabelecido
- ✓ API Client com interceptors de auth e erro — existente (`apiClient.ts`, `apiResponse.ts`)
- ✓ Tela de login admin com validação de formulário — existente
- ✓ Layout admin com sidebar de navegação — existente (`AdminLayout.svelte`)
- ✓ Dashboard com métricas globais da plataforma — existente (`DashboardPage.svelte`)
- ✓ Sistema de roteamento SvelteKit com grupo `(admin)` — existente
- ✓ Entidade `AdminUser` e contrato `IAuthRepository` — existente
- ✓ Service Locator e padrão Either<Failure, T> — existente
- ✓ **shadcn-svelte inicializado** com style new-york/zinc, 13 componentes em `src/lib/components/ui/` — Validated in Phase 01.1: shadcn-init-e-identidade-visual-prisma
- ✓ **Tema Prisma aplicado** em app.css (14 CSS vars shadcn → tokens Prisma, nenhum HSL cinza) — Validated in Phase 01.1
- ✓ **Widgets migrados para shadcn/bits-ui** (ConfirmDialog, StatusBadge, Pagination, DataTable, filtros) — Validated in Phase 01.1
- ✓ **Glow Prisma na sidebar** (item ativo com border magenta + box-shadow) — Validated in Phase 01.1
- ✓ **Merchants — Lista**: tabela paginada com filtros (status, verificação), tabs de contagem, sidebar badge — Validated in Phase 02: merchants
- ✓ **Merchants — Detalhe**: página com 6 abas (Info, Saldo, KYC, Configurações, Credenciais, Transações) — Validated in Phase 02
- ✓ **Merchants — KYC Review**: aprovação/rejeição com pdfjs preview e role guard SUPPORT+ — Validated in Phase 02
- ✓ **Merchants — Status Actions**: transitions condicionais com ConfirmDialog + motivo obrigatório — Validated in Phase 02
- ✓ **Merchants — Criar**: CreateMerchantSheet com formulário completo + dropdown tenants — Validated in Phase 02
- ✓ **Merchants — Credenciais API**: lista, criação, SecretKeyModal one-time display, role ADMIN+ — Validated in Phase 02

### Active

- [ ] **Fix auth crítico**: cookie `access_token` nunca escrito no login — toda navegação redireciona para `/login`
- [ ] **Auth guards ativos**: `adminGuard.ts` existe mas nunca é chamado em nenhuma rota
- [ ] **Token refresh automático**: interceptor de refresh para sessões expirantes
- [ ] **Transações — Pagamentos**: lista cross-merchant com filtros (merchant, status, método, período)
- [ ] **Transações — Saques**: lista cross-merchant com filtros (merchant, status)
- [ ] **Disputas**: lista + resolução de chargebacks (role SUPPORT+)
- [ ] **Taxas — CRUD**: listagem, criação, edição e exclusão de regras de taxas (globais e por merchant)
- [ ] **Taxas — Simulador**: formulário para simular taxa por tipo, valor e merchant
- [ ] **Admin Users**: CRUD de usuários administrativos (role SUPER_ADMIN)
- [ ] **Auditoria**: log cronológico de ações com filtros e diff visual (before/after)
- [ ] **Provedores**: cards read-only de provedores de pagamento e seus status
- [ ] **Diagnósticos**: lista de logs HTTP com filtros avançados, detalhe de request/response, trace view e estatísticas
- [ ] **Configuração da Plataforma**: snapshot read-only de configuração (role ADMIN+)
- [ ] **RBAC na UI**: ocultar ações e menus baseado no role do JWT (VIEWER/SUPPORT/ADMIN/SUPER_ADMIN)
- [ ] **Componentes compartilhados**: ~~DataTable, Pagination, Filters, StatusBadge, ConfirmDialog~~ migrados para shadcn — Toast pendente
- [ ] **Error boundary**: `+error.svelte` global

### Out of Scope

- Portal Merchant (Seller) — projeto separado (`PrismaPayments.Seller.FrontEnd`)
- Checkout público (`/pay/{code}`) — projeto separado
- WebSocket/SignalR para notificações em tempo real — não documentado para o Admin
- Exportação para CSV — mencionada na doc como "se implementado", fora do escopo v1
- 2FA (Two-Factor Auth) para login admin — não especificado nos endpoints admin

## Context

**Estado atual do codebase:**
- A estrutura de pastas segue Clean Architecture com 10 features mapeadas, mas apenas Auth (login) tem implementação completa
- Dashboard tem implementação parcial (busca e exibe métricas, sem período filtering ou refresh)
- 9 de 10 páginas de feature são stubs com "Em implementação..."
- Bug crítico: `hooks.server.ts` verifica cookie `access_token` mas `AuthService` salva tokens apenas em `sessionStorage` — o cookie nunca é escrito, impedindo qualquer navegação autenticada

**API Backend:**
- Base URL: `{VITE_API_BASE_URL}/api/v1` (configurado via env)
- Auth: JWT Bearer Token
- Envelope padrão: `ApiResponse<T>` com `responseType`, `message`, `data`, `status`
- Endpoints admin: `/api/v1/admin/*`, `/api/v1/fees/*`, `/api/v1/diagnostics/*`, `/api/v1/dashboard/admin`

**Roles hierárquicos (nível 1-4):**
- `VIEWER` (1) — somente leitura
- `SUPPORT` (2) — ações de suporte (alterar status merchant, resolver disputas)
- `ADMIN` (3) — quase tudo, exceto gestão de admins
- `SUPER_ADMIN` (4) — acesso total

**Referência de arquitetura:** `docs/murillo's-architecture-frontend.md` (arquitetura agnóstica de framework)

## Constraints

- **Stack**: SvelteKit + TypeScript + Tailwind — definido, não negociável
- **Arquitetura**: Clean Architecture por feature (domain/data/presentation) — padrão do projeto
- **Auth**: JWT decodificado no cliente para extrair role; verificação da assinatura é responsabilidade do backend
- **API**: Todos os endpoints consomem `ApiResponse<T>` — sem exceções
- **Roles**: Controle de acesso deve estar tanto nos route guards quanto na renderização condicional de UI
- **Separação**: Este repo é exclusivamente o painel admin — não inclui código do portal merchant

## Key Decisions

| Decisão | Racional | Outcome |
|---------|----------|---------|
| Cookie SSR + sessionStorage cliente para tokens | `hooks.server.ts` precisa de cookie para guards SSR; cliente usa sessionStorage para acesso rápido | ⚠️ Revisitar — cookie nunca escrito atualmente (bug crítico) |
| Either<Failure, T> para error handling | Força tratamento explícito de erros em todas as camadas sem exceções não capturadas | — Pending |
| Service Locator disponível mas não mandatório | Facilita DI futura sem forçar refactor de todo o código existente | — Pending |
| Route files sem lógica (thin shell) | SvelteKit routes importam apenas o page component — toda lógica fica na feature | ✓ Estabelecido |

## Evolution

Este documento evolui a cada transição de fase e milestone.

**Após cada transição de fase** (via `/gsd:transition`):
1. Requirements invalidados? → Mover para Out of Scope com motivo
2. Requirements validados? → Mover para Validated com referência da fase
3. Novos requirements emergiram? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions
5. "What This Is" ainda preciso? → Atualizar se tiver drifted

**Após cada milestone** (via `/gsd:complete-milestone`):
1. Revisão completa de todas as seções
2. Core Value check — ainda é a prioridade certa?
3. Auditoria de Out of Scope — motivos ainda válidos?
4. Atualizar Context com estado atual

---
*Last updated: 2026-04-07 after Phase 02 (merchants) completion — feature completa com 9/9 requirements verificados, fase marcada como completa no ROADMAP*
