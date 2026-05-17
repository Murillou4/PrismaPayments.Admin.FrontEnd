# Phase 3: Transactions - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Listas cross-merchant de pagamentos e saques com filtros completos (merchant, status, método, período) e páginas de detalhe por transação — com informações específicas renderizadas condicionalmente por método de pagamento (PIX, Boleto, Cartão). Inclui navegação cruzada entre transações e merchants.

**Fora de escopo:** Disputas, taxas, ações de status sobre transações (não existem na API), exportação CSV.

</domain>

<decisions>
## Implementation Decisions

### Layout das Listas
- **D-01:** Rotas separadas: `/transactions/payments` e `/transactions/withdrawals` — estrutura de pastas e rotas já existe no projeto
- **D-02:** Filtros **sempre visíveis** acima da tabela (mesmo padrão Phase 2 D-07)
- **D-03:** Status filtrado via **select dropdown** (sem tabs de contagem) — 7 status de pagamento é demais para tabs horizontais
- **D-04:** Filtro de merchant como **select com busca (autocomplete)** — busca por nome/documento enquanto digita
- **D-05:** Filtros de pagamentos: merchant (select busca), status (select), método (select PIX/BOLETO/CREDIT_CARD/DEBIT_CARD), período (date range)
- **D-06:** Filtros de saques: merchant (select busca), status (select REQUESTED/PROCESSING/COMPLETED/FAILED/CANCELLED), período (date range) — sem filtro de método (API não suporta)
- **D-07:** Sidebar com **submenu colapsável** "Transações" expandindo para sub-itens Pagamentos e Saques

### Colunas das Tabelas
- **D-08:** Tabela de pagamentos — 8 colunas: ID (truncado), Merchant (link), Método (badge), Status (StatusBadge), Valor (R$), Taxa (R$), Líquido (R$), Data
- **D-09:** Tabela de saques — 8 colunas: ID (truncado), Merchant (link), Status (StatusBadge), Valor bruto (R$), Taxa (R$), Líquido (R$), Chave PIX (truncada), Data

### Página de Detalhe — Pagamentos
- **D-10:** Layout em **cards empilhados** verticalmente (sem abas): Informações Gerais → Detalhes do Método → Pagador → Metadata
- **D-11:** Seção "Detalhes do Método" **renderizada condicionalmente** conforme `method`:
  - PIX: código copiável (qrCode string) + botão copiar — **sem renderização de imagem QR** (admin só verifica, não escaneia)
  - Boleto: código de barras + link para boleto (boletoUrl) + vencimento (dueDate)
  - Cartão: últimos 4 dígitos + bandeira + parcelas
- **D-12:** Valores monetários formatados em R$ via `Intl.NumberFormat('pt-BR')` (INFRA-08)

### Página de Detalhe — Saques
- **D-13:** Layout em **cards empilhados**: Informações Gerais (status, valores bruto/taxa/líquido) → Recipient (chave PIX, tipo, nome, documento)

### Navegação Cruzada
- **D-14:** Coluna Merchant nas listas é **link direto** para `/merchants/{id}` — atende TXN-02
- **D-15:** **Breadcrumbs** nas páginas de detalhe: Transações > Pagamentos > #abc123
- **D-16:** Aba Transações do detalhe de merchant (Phase 2) terá link **"Ver todas"** que navega para `/transactions/payments?merchantId={id}` com filtro pré-aplicado

### Filtro por Período
- **D-17:** DateRangePicker usando **shadcn RangeCalendar + Popover** (bits-ui) — consistente com design system
- **D-18:** **Presets rápidos**: Hoje, 7 dias, 30 dias, Este mês + seleção custom via calendar
- **D-19:** Filtro de período aplicado **client-side** (filtra por createdAt após receber dados) — API não documenta startDate/endDate como query params

### Claude's Discretion
- Estrutura interna dos controllers (um por sub-feature ou controller unificado transactions)
- Skeleton layout durante carregamento
- Animação de transição entre lista e detalhe
- Ordenação padrão das tabelas (createdAt desc presumido)
- Truncamento de IDs e chaves PIX (quantos chars exibir)
- Implementação interna do merchant autocomplete (debounce, min chars)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### API — Transações
- `docs/FRONTEND_ADMIN_DOC.md` §5.5 — endpoints completos de pagamentos e saques:
  - §5.5.1 `GET /admin/payments` — lista com query params (merchantId, status, method, skip, limit)
  - §5.5.1 PaymentResponse — DTO completo com pix/boleto/card condicionais, payer, metadata
  - §5.5.2 `GET /admin/withdrawals` — lista com query params (merchantId, status, skip, limit)
  - §5.5.2 WithdrawalResponse — DTO com recipient (pixKey, pixKeyType, name, documentNumber)

### API — Paths já configurados
- `src/core/constants/apiPaths.ts` — ADMIN_PAYMENTS, ADMIN_PAYMENT(id), ADMIN_WITHDRAWALS, ADMIN_WITHDRAWAL(id) já definidos

### Rotas sugeridas
- `docs/FRONTEND_ADMIN_DOC.md` linhas 1835-1838 — rotas /transactions/payments, /transactions/payments/:id, /transactions/withdrawals, /transactions/withdrawals/:id

### Padrão de referência — Merchants (Phase 2)
- `.planning/phases/02-merchants/02-CONTEXT.md` — padrão de lista + detalhe + filtros a ser replicado
- `src/app/features/merchants/` — implementação completa para referência de Clean Architecture

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **DataTable genérico** (`src/app/shared/widgets/`): reutilizar com ColumnDef[] para ambas as listas
- **StatusBadge**: já suporta mapeamento por entidade — precisa adicionar mappings para Payment e Withdrawal status
- **Pagination**: componente pronto para paginação skip/limit
- **SelectFilter / SearchInput**: reutilizar para filtros de status e método
- **formatCurrency**: `Intl.NumberFormat('pt-BR')` já disponível em `src/app/shared/utils/formatters.ts`
- **apiClient**: HTTP client com interceptors de auth e erro pronto
- **apiPaths**: endpoints de transactions já configurados

### Established Patterns
- **Clean Architecture**: domain → data → presentation por feature (replicar merchants)
- **Controller pattern**: `createXxxController` com Svelte 5 runes (`$state`, `$derived`)
- **Repository pattern**: interface `IXxxRepository` + implementação concreta
- **Service Locator**: `sl.get<T>()` para DI
- **Either monad**: `Either<Failure, T>` para resultados de operação

### Integration Points
- **Rotas SvelteKit**: `/routes/(admin)/transactions/payments/` e `/withdrawals/` já existem com placeholder
- **AdminLayout sidebar**: precisa adicionar submenu colapsável "Transações"
- **Merchant detail TransactionsTab**: link "Ver todas" para lista filtrada (cross-nav)

</code_context>

<specifics>
## Specific Ideas

- Merchant select com busca (autocomplete) é um componente novo que pode ser reutilizado em fases futuras (Disputes, Fees)
- DateRangePicker com presets é um componente compartilhado reutilizável
- Breadcrumbs é um padrão novo — considerar criar componente genérico para todas as páginas de detalhe

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-transactions*
*Context gathered: 2026-04-07*
