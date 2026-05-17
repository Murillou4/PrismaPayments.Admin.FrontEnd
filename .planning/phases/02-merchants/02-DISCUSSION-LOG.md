# Phase 2: Merchants — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 02-merchants
**Areas discussed:** Abas do detalhe, Preview KYC, Filtros da lista, Formulário de criação

---

## Abas do detalhe

| Option | Description | Selected |
|--------|-------------|----------|
| Lazy por aba | Todas as abas carregam sob demanda ao clicar | |
| Tudo no mount | 5 requests simultâneos ao abrir a página | |
| Híbrido | Info/Saldo/Config no mount; KYC/Credenciais/Transações lazy com skeleton | ✓ |

**User's choice:** Híbrido
**Notes:** Faz sentido natural dado o shape da API — Info+Saldo+Config compartilham um único endpoint; KYC, Credenciais e Transações têm endpoints separados.

---

## Preview de documentos KYC

| Option | Description | Selected |
|--------|-------------|----------|
| Inline embed | Renderiza diretamente abaixo do card do documento na aba | ✓ |
| Modal/lightbox | Abre dialog centralizado com preview em tamanho maior | |
| Abre em nova aba | `window.open(fileUrl)` — sem pdfjs-dist | |

**User's choice:** Inline
**Notes:** pdfjs-dist para PDFs. Grid de cards por tipo de documento com status badge individual.

---

## Filtros da lista de merchants

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs sempre visíveis + select | Tabs de status com count + select de verification expostos | ✓ |
| Todos os filtros expostos | Tabs + select + search sempre visíveis (mais denso) | |
| Botão "Filtros" com collapse | Filtros escondidos por padrão | |

**User's choice:** Padrão admin — tabs sempre visíveis
**Notes:** Tabs horizontais (Todos/Pendente/Ativo/Suspenso/Bloqueado) com count por tab + select de verification + search input. Tudo exposto, zero clique.

---

## Formulário de criação de merchant

| Option | Description | Selected |
|--------|-------------|----------|
| Página separada `/merchants/new` | Navegação dedicada, mais simples | |
| Sheet/drawer | Painel lateral deslizando da direita, lista visível ao fundo | ✓ |
| Modal dialog | Dialog centralizado (Dialog já instalado, mas apertado para formulários longos) | |

**User's choice:** Sheet
**Notes:** Requer instalação do componente Sheet do shadcn. Formulário inclui dropdown de tenantId carregado via `GET /api/v1/admin/tenants` no open do Sheet.

---

## Claude's Discretion

- Estrutura interna dos controllers da feature
- Animação e comportamento do Sheet
- Skeleton layout por aba
- Ordem e larguras das colunas na DataTable
- Comportamento da aba Transações (quantidade de itens, link para lista completa)

## Deferred Ideas

Nenhuma ideia fora de escopo mencionada durante a discussão.

---

## Nota de investigação

Durante a análise, a primeira leitura parcial do `FRONTEND_ADMIN_DOC.md` identificou aparentes lacunas (GET de credenciais, endpoint de documentos KYC, shape completo do detalhe). Verificação completa do doc (seções 5.3.x) confirmou que tudo está documentado — a leitura inicial cobriu apenas as seções 5.2.x (versão resumida). Não há dependências de backend não documentadas para esta fase.
