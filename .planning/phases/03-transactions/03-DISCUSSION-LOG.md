# Phase 3: Transactions - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 03-transactions
**Areas discussed:** Layout das listas, Página de detalhe, Navegação cruzada, Filtro por período

---

## Layout das Listas

### Organização de rotas

| Option | Description | Selected |
|--------|-------------|----------|
| Rotas separadas | /transactions/payments e /transactions/withdrawals com sidebar entries separados — já existe estrutura | ✓ |
| Tabs na mesma página | Uma única rota /transactions com tabs Pagamentos / Saques | |

**User's choice:** Rotas separadas
**Notes:** Estrutura de rotas e pastas já existe no projeto

### Organização de filtros

| Option | Description | Selected |
|--------|-------------|----------|
| Todos visíveis acima da tabela | Merchant, Status, Método, Período — mesmo padrão Phase 2 | ✓ |
| Filtros com collapse | Botão que expande/colapsa painel de filtros | |

**User's choice:** Todos visíveis acima da tabela
**Notes:** Mantém consistência com padrão estabelecido na Phase 2

### Tabs de status na lista de pagamentos

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, com tabs de status | Tabs horizontais com count por tab — 7 status | |
| Sem tabs, só select de status | Status como dropdown select — mais compacto | ✓ |

**User's choice:** Sem tabs, só select de status
**Notes:** 7 status é excessivo para tabs horizontais

### Filtros na lista de saques

| Option | Description | Selected |
|--------|-------------|----------|
| Mesmos filtros sem método | Merchant, Status, Período — API não tem filtro de método | ✓ |
| Filtros mínimos | Só merchant e status | |

**User's choice:** Mesmos filtros sem método

### Colunas da tabela de pagamentos

| Option | Description | Selected |
|--------|-------------|----------|
| Completa (8 colunas) | ID, Merchant, Método, Status, Valor, Taxa, Líquido, Data | ✓ |
| Compacta (5 colunas) | Merchant, Método, Status, Valor, Data | |

**User's choice:** Completa

### Colunas da tabela de saques

| Option | Description | Selected |
|--------|-------------|----------|
| Completa (8 colunas) | ID, Merchant, Status, Valor bruto, Taxa, Líquido, Chave PIX, Data | ✓ |
| Compacta (4 colunas) | Merchant, Status, Valor, Data | |

**User's choice:** Completa

### Filtro de merchant

| Option | Description | Selected |
|--------|-------------|----------|
| Select com busca (autocomplete) | Busca por nome/documento enquanto digita | ✓ |
| Select simples | Dropdown estático com todos os merchants | |

**User's choice:** Select com busca

### Sidebar

| Option | Description | Selected |
|--------|-------------|----------|
| Submenu colapsável | Item 'Transações' que expande para Pagamentos e Saques | ✓ |
| Entradas separadas | Itens independentes na sidebar | |

**User's choice:** Submenu colapsável

---

## Página de Detalhe

### Info por método de pagamento

| Option | Description | Selected |
|--------|-------------|----------|
| Seções condicionais | Card que renderiza condicionalmente: PIX, Boleto ou Cartão | ✓ |
| Tabs por método | Aba separada para info do método | |

**User's choice:** Seções condicionais

### QR code PIX

| Option | Description | Selected |
|--------|-------------|----------|
| Texto copiável apenas | Campo com código PIX + botão copiar — admin não escaneia | ✓ |
| Imagem QR + texto | Renderiza QR code como imagem + texto copiável | |

**User's choice:** Texto copiável apenas

### Layout detalhe pagamento

| Option | Description | Selected |
|--------|-------------|----------|
| Cards empilhados | Info Gerais → Método → Pagador → Metadata — sem abas | ✓ |
| Abas como merchants | Tabs para separar seções | |

**User's choice:** Cards empilhados

### Layout detalhe saque

| Option | Description | Selected |
|--------|-------------|----------|
| Cards empilhados | Info Gerais → Recipient — sem abas | ✓ |
| Mesmo layout de pagamento | Reutilizar estrutura do detalhe de pagamento | |

**User's choice:** Cards empilhados

---

## Navegação Cruzada

### Coluna Merchant

| Option | Description | Selected |
|--------|-------------|----------|
| Link direto para detalhe | Nome como link <a> para /merchants/{id} | ✓ |
| Tooltip + link | Hover com tooltip, click navega | |

**User's choice:** Link direto para detalhe

### Breadcrumbs

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, breadcrumbs simples | Transações > Pagamentos > #abc123 | ✓ |
| Botão voltar apenas | Seta ← com history.back | |

**User's choice:** Breadcrumbs simples

### Cross-nav merchant → transações

| Option | Description | Selected |
|--------|-------------|----------|
| Link filtrado | "Ver todas" navega para /transactions/payments?merchantId={id} | ✓ |
| Manter separado | Sem link entre aba Transações e lista global | |

**User's choice:** Link filtrado

---

## Filtro por Período

### Implementação do DateRangePicker

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn RangeCalendar | Componentes RangeCalendar + Popover do shadcn-svelte | ✓ |
| Input de texto | Dois inputs de data com formato dd/mm/yyyy | |

**User's choice:** shadcn RangeCalendar

### Presets rápidos

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, com presets | Hoje, 7 dias, 30 dias, Este mês + custom | ✓ |
| Só calendar | Apenas range calendar, sem atalhos | |

**User's choice:** Com presets

### API sem filtro de período

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side | Filtrar por createdAt no frontend | ✓ |
| Assumir que API aceita | Enviar startDate/endDate e testar | |
| Sem filtro de período | Remover o filtro | |

**User's choice:** Client-side

---

## Claude's Discretion

- Estrutura interna dos controllers
- Skeleton layout durante carregamento
- Animação de transição lista/detalhe
- Ordenação padrão das tabelas
- Truncamento de IDs e chaves PIX
- Implementação do merchant autocomplete (debounce, min chars)

## Deferred Ideas

None — discussion stayed within phase scope
