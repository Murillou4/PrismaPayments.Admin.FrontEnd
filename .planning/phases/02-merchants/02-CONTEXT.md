# Phase 2: Merchants — Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Entrega completa da feature de merchants: lista paginada com tabs de status, página de detalhe tabulada (6 abas com carregamento híbrido), ações de status via ConfirmDialog, review de KYC com documentos inline, criação via sheet/drawer, edição de configurações, criação de credenciais de API com secretKey one-time, e entrada dedicada "Verificações Pendentes" na sidebar com badge de contagem.

**Fora de escopo:** Features de transações, disputas, taxas — apenas a feature merchants completa.

</domain>

<decisions>
## Implementation Decisions

### Página de Detalhe — Abas
- **D-01:** 6 abas: Info / KYC / Saldo / Configurações / Transações / Credenciais (shadcn Tabs já instalado)
- **D-02:** Carregamento **híbrido**:
  - Info + Saldo + Configurações carregam no **mount** (compartilham o mesmo `GET /admin/merchants/{id}`)
  - KYC, Credenciais e Transações são **lazy** — carregam apenas quando o usuário clica na aba pela primeira vez
  - Abas lazy exibem skeleton (shadcn Skeleton) enquanto carregam
- **D-03:** A nota da API é explícita: `GET /admin/merchants/{id}` **não** retorna documentos KYC nem credenciais — são endpoints separados

### Preview de Documentos KYC
- **D-04:** Preview **inline** na aba KYC — renderiza diretamente abaixo do card do documento, sem modal
- **D-05:** Imagens exibidas via `<img src={fileUrl}>`. PDFs renderizados com `pdfjs-dist` (inline na aba)
- **D-06:** Grid de documentos com card por tipo (IDENTITY_FRONT, IDENTITY_BACK, SELFIE, PROOF_OF_ADDRESS, ARTICLES_OF_INCORPORATION, OTHER), status badge individual por documento (PENDING=amarelo, APPROVED=verde, REJECTED=vermelho)

### Lista de Merchants — Filtros
- **D-07:** Filtros **sempre visíveis** acima da tabela (padrão admin panel), sem collapse:
  - Tabs horizontais de status com count por tab: Todos / Pendente / Ativo / Suspenso / Bloqueado
  - Select de verification (UNVERIFIED / PENDING_REVIEW / VERIFIED / REJECTED)
  - Search input por nome/documento
- **D-08:** DataTable genérico existente reutilizado com colunas: nome, documento, email, status badge, verificação badge, data de cadastro

### Formulário de Criação de Merchant
- **D-09:** Formulário abre em **Sheet/drawer** deslizando da direita (botão "Novo Merchant" na lista)
- **D-10:** Requer instalação do componente `Sheet` do shadcn (não instalado atualmente)
- **D-11:** Campo `tenantId` é obrigatório — dropdown que carrega via `GET /api/v1/admin/tenants`
- **D-12:** Campos: legalName, tradeName, documentNumber, documentType (select CPF/CNPJ), email, phone, password, tenantId, status (opcional), verificationStatus (opcional)
- **D-13:** Visível apenas para ADMIN+ (ocultar botão para VIEWER e SUPPORT)

### Ações de Status
- **D-14:** ConfirmDialog existente com campo de motivo obrigatório para todas as ações de status
- **D-15:** Transições válidas conforme API:
  - PENDING → ACTIVE (Aprovar)
  - ACTIVE → SUSPENDED (Suspender)
  - SUSPENDED → ACTIVE (Reativar)
  - ACTIVE → BLOCKED (Bloquear)
  - BLOCKED → ACTIVE (Desbloquear — requer ADMIN+)
- **D-16:** Botões de ação exibidos condicionalmente conforme o status atual e o role do admin

### Credenciais de API
- **D-17:** Após criação (`POST …/credentials`), exibir modal com `publicKey` + `secretKey` com alerta de one-time display — usuário deve copiar antes de fechar
- **D-18:** Listagem na aba Credenciais exibe: label, `publicKey` truncada, `secretKeyLast4`, environment badge (LIVE/TEST), isActive, lastUsedAt formatado

### Sidebar — Verificações Pendentes
- **D-19:** Entrada "Verificações Pendentes" na sidebar filtra a lista por `verification=PENDING_REVIEW`
- **D-20:** Badge de contagem carregado **uma vez no mount do layout** (sem polling) — busca `GET /admin/merchants?verification=PENDING_REVIEW&limit=1` e usa o `total` do response

### Claude's Discretion
- Estrutura interna dos sub-controllers da feature (um controller por sub-feature ou controller unificado de detalhe)
- Animação e comportamento do Sheet (duração, overlay)
- Skeleton layout por aba (quantas linhas/cards simular)
- Ordem das colunas e larguras na DataTable de merchants
- Comportamento de "Transações recentes" na aba Transações do detalhe (quantos itens, link para a lista completa filtrada)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### API — Merchants (ler integralmente)
- `docs/FRONTEND_ADMIN_DOC.md` §5.3 — endpoints completos da feature merchants:
  - 5.3.1 `GET /admin/merchants` — lista com query params
  - 5.3.2 `GET /admin/merchants/{id}` — detalhe completo (info + settings + balance); **não inclui KYC docs nem credentials**
  - 5.3.3 `POST /admin/merchants` — criação (requer tenantId via `GET /admin/tenants`)
  - 5.3.4 `PUT /admin/merchants/{id}/status` — transições de status
  - 5.3.5 `PUT /admin/merchants/{id}/verification` — aprovar/rejeitar KYC
  - 5.3.6 `PUT /admin/merchants/{id}/settings` — editar configurações
  - 5.3.7 `POST /admin/merchants/{id}/credentials` — criar credencial (secretKey one-time)
  - 5.3.8 `GET /admin/merchants/{id}/credentials` — listar credenciais (secretKeyLast4)
  - 5.3.9 `GET /admin/merchants/{id}/documents` — documentos KYC com fileUrl e status individual
- `docs/FRONTEND_ADMIN_DOC.md` §7 — enums: MerchantStatus, VerificationStatus, DocumentType, CredentialEnvironment
- `docs/FRONTEND_ADMIN_DOC.md` §8 — tabela de RBAC por feature/ação (merchants)

### Arquitetura e Convenções
- `.planning/codebase/ARCHITECTURE.md` — Clean Architecture por feature, Either<Failure,T>, padrão de controllers
- `.planning/codebase/CONVENTIONS.md` — nomenclatura, estrutura de componentes, imports, Svelte 5 runes
- `.planning/phases/01-auth-core-infrastructure/01-CONTEXT.md` — decisões de Auth/RBAC (ocultar vs desabilitar, role via context, guards SSR)
- `.planning/phases/01.1-shadcn-init-e-identidade-visual-prisma/01.1-CONTEXT.md` — componentes shadcn instalados, widgets migrados, identidade Prisma

### Design System
- `docs/StyleGuide.md` — tokens de cor, tipografia, espaçamento — fonte primária de design
- `src/app.css` — CSS custom properties do tema Prisma

### Estrutura de Pastas Target
- `docs/FRONTEND_PLAN.md` — merchants dividido em `listing/`, `detail/`, `verification/` dentro de `src/app/features/merchants/`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/shared/widgets/DataTable.svelte` — reutilizar para lista de merchants e aba Transações do detalhe
- `src/app/shared/widgets/StatusBadge.svelte` — reutilizar para status e verificationStatus (variantes já existem)
- `src/app/shared/widgets/ConfirmDialog.svelte` — reutilizar para ações de status com campo de motivo
- `src/app/shared/widgets/filters/` — SearchInput, SelectFilter já disponíveis para os filtros da lista
- `src/lib/components/ui/tabs/` — shadcn Tabs instalado, pronto para a página de detalhe
- `src/lib/components/ui/badge/` — shadcn Badge para environment (LIVE/TEST) e status de documentos
- `src/lib/components/ui/skeleton/` — shadcn Skeleton para estados de loading lazy das abas
- `src/app/shared/utils/formatters.ts` — formatters de moeda BRL e data pt-BR prontos

### A Instalar
- `Sheet` do shadcn — necessário para o formulário de criação (D-10)

### Established Patterns
- Controller pattern: `createXxxController()` factory com `$state` interno — seguir para `createMerchantListController`, `createMerchantDetailController`
- Either<Failure, T> — wrapping de todas as chamadas de API no repository
- `onMount` para carregamento inicial de dados na presentation layer
- Svelte 5 runes: `$state`, `$derived`, `$effect` — sem Svelte stores

### Integration Points
- `src/routes/(admin)/merchants/+page.svelte` — stub existente, substituir com `MerchantsListPage`
- `src/routes/(admin)/merchants/[id]/+page.svelte` — stub existente, substituir com `MerchantDetailPage`
- `src/core/constants/apiPaths.ts` — adicionar paths: ADMIN_MERCHANT_CREDS, ADMIN_MERCHANT_DOCS, ADMIN_TENANTS
- `src/app/shared/widgets/AdminLayout.svelte` — adicionar entrada "Verificações Pendentes" com badge

</code_context>

<specifics>
## Specific Ideas

- O badge de "Verificações Pendentes" usa `total` do response de `GET /admin/merchants?verification=PENDING_REVIEW&limit=1` — evita carregar items desnecessários
- pdfjs-dist para preview inline de PDFs na aba KYC — verificar compatibilidade com SvelteKit SSR (pode precisar de dynamic import no cliente)
- Sheet do shadcn: `npx shadcn-svelte@latest add sheet` — seguir o mesmo processo do init da Fase 01.1
- Formulário de criação: `tenantId` vem de `GET /api/v1/admin/tenants` — carregar no open do Sheet, não antes

</specifics>

<deferred>
## Deferred Ideas

- Nenhuma ideia fora de escopo foi mencionada durante a discussão.

</deferred>

---

*Phase: 02-merchants*
*Context gathered: 2026-03-28 via discuss-phase*
