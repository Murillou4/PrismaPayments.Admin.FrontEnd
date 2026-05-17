# Phase 4: Disputes — Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Lista paginada de disputas com filtros por status e tipo, destaque visual para MEDs time-sensitive, página de detalhe com timeline visual dos estados e formulário de resolução (SUPPORT+). Inclui navegação cruzada para o pagamento relacionado via link.

**Fora de escopo:** Busca de dados do pagamento embutidos no detalhe, exportação, notificações em tempo real.

</domain>

<decisions>
## Implementation Decisions

### Lista de Disputas — Filtros e Colunas
- **D-01:** Filtros sempre visíveis acima da tabela (mesmo padrão Phase 2 D-07 e Phase 3 D-02)
- **D-02:** Filtros: status (select: OPEN/UNDER_REVIEW/ACCEPTED/REJECTED/RESOLVED) + tipo (select: MED/CHARGEBACK/REFUND_REQUEST)
- **D-03:** MerchantAutocomplete disponível como filtro opcional (padrão Phase 3) — Claude pode incluir se o endpoint suportar merchantId como query param
- **D-04:** Colunas sugeridas: ID (truncado), Merchant (link), Tipo (badge + destaque MED), Status (StatusBadge), Valor (R$), Data abertura

### Destaque MED (DISP-04)
- **D-05:** Rows de disputa com `disputeType === "MED"` recebem **border-left colorido** (3px sólido, cor âmbar/vermelho) + badge `MED` com cor de urgência na coluna Tipo
- **D-06:** Fundo da row **não** muda — apenas a faixa lateral + badge. Padrão: border-left como Linear/Jira para prioridade alta

### Timeline Visual (DISP-02)
- **D-07:** Timeline com **3 steps sempre presentes**: Aberta → Em Análise → Resolvida (renderiza independente do status atual)
- **D-08:** Cada step exibe timestamp **apenas quando há dado real**:
  - "Aberta": `openedAt` (sempre disponível)
  - "Em Análise": sem timestamp próprio na API — exibe step como ativo se `status >= UNDER_REVIEW`, sem data
  - "Resolvida": `resolvedAt` quando não-null
- **D-09:** Steps concluídos: círculo preenchido + cor ativa. Step atual: highlighted. Steps futuros: círculo vazio + cor neutra
- **D-10:** Rationale: não inventar timestamps (ex: usar `updatedAt` como proxy para "Em Análise" seria desonesto — `updatedAt` muda ao resolver também)

### Página de Detalhe (DISP-02 + DISP-03)
- **D-11:** Página dedicada `/disputes/:id` — mesmo padrão das fases anteriores (payments, withdrawals)
- **D-12:** Layout em cards empilhados (padrão Phase 3 D-10):
  1. Informações da Disputa (tipo, status, valor, reason, externalId, datas)
  2. Timeline visual (D-07 a D-09)
  3. Pagamento relacionado — apenas `paymentId` como link para `/transactions/payments/:id` (sem chamada extra de API)
  4. Formulário de Resolução (SUPPORT+ apenas)
- **D-13:** Formulário de resolução: dropdown de status (`ACCEPTED | REJECTED | RESOLVED`) + textarea de resolução — **ambos obrigatórios** antes de habilitar submit (DISP-03)
- **D-14:** Role guard: formulário de resolução **oculto** para VIEWER (não desabilitado) — padrão RBAC do projeto
- **D-15:** Breadcrumbs: Disputas > #abc123 (padrão Phase 3 D-15)

### Dados do Pagamento no Detalhe
- **D-16:** **Sem chamada extra de API** — exibir `paymentId` truncado como link navegável para `/transactions/payments/:id`
- **D-17:** Rationale: DISP-01 a DISP-04 não exigem dados do pagamento embutidos; sugestão da doc é UI hint, não requisito

### Claude's Discretion
- Cor exata do border-left MED (âmbar `#F59E0B` vs vermelho `#EF4444` vs magenta Prisma)
- Larguras de colunas e ordenação padrão da lista (provavelmente `openedAt DESC`)
- Skeleton layout durante carregamento do detalhe
- Truncamento do ID de disputa nos breadcrumbs (8 chars como Phase 3)
- Comportamento do formulário após submit bem-sucedido (redirect para lista ou atualiza detalhe in-place)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### API — Disputas
- `docs/FRONTEND_ADMIN_DOC.md` §5.6 — endpoints completos de disputas:
  - §5.6.1 `GET /api/v1/admin/disputes` — lista com query params (status, disputeType, skip, limit)
  - §5.6.1 DisputeResponse — DTO: id, paymentId, merchantId, disputeType, status, amount, reason, resolution, externalId, openedAt, resolvedAt, createdAt, updatedAt
  - §5.6.2 `PUT /api/v1/admin/disputes/{id}` — resolver disputa (role mínimo: SUPPORT), body: `{ resolution: string, status: "ACCEPTED" | "REJECTED" | "RESOLVED" }`
- `docs/FRONTEND_ADMIN_DOC.md` §7 — enums: DisputeType (MED/CHARGEBACK/REFUND_REQUEST), DisputeStatus (OPEN/UNDER_REVIEW/ACCEPTED/REJECTED/RESOLVED)
- `docs/FRONTEND_ADMIN_DOC.md` §8 — RBAC: Disputas (listar) VIEWER+, Disputas (resolver) SUPPORT+

### Rotas
- `docs/FRONTEND_ADMIN_DOC.md` linhas 1840-1841 — `/disputes` e `/disputes/:id`

### Padrão de referência — Phase 3 (detalhe em cards)
- `.planning/phases/03-transactions/03-CONTEXT.md` — D-10 a D-15: layout cards empilhados, breadcrumbs, navegação cruzada
- `src/app/features/transactions/payments/presentation/pages/PaymentDetailPage.svelte` — referência de estrutura de página de detalhe

### Padrão de referência — Phase 2 (ações com role guard)
- `.planning/phases/02-merchants/02-CONTEXT.md` — D-14 a D-16: ConfirmDialog, transições de status, ocultar vs desabilitar
- `src/app/features/merchants/detail/presentation/components/MerchantStatusActions.svelte` — referência de role guard em ações

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
- `src/app/shared/widgets/DataTable.svelte` — reutilizar para lista de disputas
- `src/app/shared/widgets/StatusBadge.svelte` — adicionar mapeamento para DisputeStatus e DisputeType
- `src/app/shared/widgets/ConfirmDialog.svelte` — disponível mas formulário de resolução é inline (não usa dialog)
- `src/app/shared/widgets/filters/SelectFilter.svelte` — reutilizar para filtros status e tipo
- `src/app/shared/widgets/Breadcrumbs.svelte` — reutilizar para `/disputes/:id`
- `src/app/features/transactions/shared/components/MerchantAutocomplete.svelte` — reutilizar para filtro por merchant
- `src/app/shared/utils/formatters.ts` — formatCurrency (amount em centavos) e formatDate (openedAt, resolvedAt)
- `src/core/constants/apiPaths.ts` — adicionar ADMIN_DISPUTES e ADMIN_DISPUTE(id)

### Stubs Existentes
- `src/app/features/disputes/presentation/pages/DisputesListPage.svelte` — stub "Em implementação..." — substituir
- `src/routes/(admin)/disputes/+page.svelte` — rota existente — atualizar para importar DisputesListPage
- `src/routes/(admin)/disputes/[id]/+page.svelte` — **não existe ainda** — criar

### Established Patterns
- Controller pattern: `createXxxController()` com Svelte 5 runes (`$state`, `$derived`)
- Repository pattern: `IXxxRepository` + implementação concreta
- Either monad: `Either<Failure, T>` para resultados de API
- Route files thin shell: SvelteKit routes importam apenas o page component

### Integration Points
- `src/app/shared/widgets/AdminLayout.svelte` — adicionar entrada "Disputas" na sidebar (se não existir)
- `src/core/constants/apiPaths.ts` — adicionar ADMIN_DISPUTES, ADMIN_DISPUTE(id)

</code_context>

<specifics>
## Specific Ideas

- Border-left para MED: aplicar via classe CSS condicional na row do DataTable — verificar se o DataTable genérico suporta `rowClass` prop ou similar; se não, adicionar essa prop
- Timeline component: considerar criar `DisputeTimeline.svelte` como componente isolado dentro de `disputes/detail/presentation/components/` — reutilizável em fases futuras se a API evoluir para incluir histórico de eventos

</specifics>

<deferred>
## Deferred Ideas

- Indicador de aging de disputas (tempo em aberto desde `openedAt`) — mencionado em REQUIREMENTS.md como V2-02
- Buscar dados do pagamento embutidos no detalhe — decidido postergar (D-16/D-17); revisitar se a API evoluir para um endpoint de detalhe de disputa que embuta o pagamento

</deferred>

---

*Phase: 04-disputes*
*Context gathered: 2026-04-15 via discuss-phase*
