# Phase 5: Fees — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 05-fees
**Areas discussed:** Layout da Página, Formulário de Criação/Edição, Conversão de Unidades, Simulador

---

## Layout da Página

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs: Global / Por Merchant | Duas abas no topo. Tab Global mostra regras sem merchantId; tab Por Merchant exibe filtro de merchant + tabela das regras daquele merchant. | ✓ |
| Seções na mesma página | Página única com duas seções separadas por título via scroll. | |

**User's choice:** Tabs: Global / Por Merchant
**Notes:** Padrão escolhido pela clareza visual e separação de contexto.

---

## Formulário de Criação/Edição

| Option | Description | Selected |
|--------|-------------|----------|
| Sheet/Drawer lateral | Desliza da direita; mesmo padrão Phase 2 (CreateMerchantSheet). Sheet shadcn já instalado. | ✓ |
| Dialog / Modal centralizado | Modal sobre a página; menos espaço vertical. | |

**User's choice:** Sheet/Drawer lateral
**Notes:** Consistência com o padrão estabelecido na Phase 2.

---

## Conversão de Unidades

| Option | Description | Selected |
|--------|-------------|----------|
| Feedback em tempo real | Exibe conversão abaixo do input enquanto digita (ℹ️ = 250 basis points). | ✓ |
| Conversão apenas ao salvar | Input simples, conversão interna no submit. | |
| Inputs duplos lado a lado | Dois inputs sincronizados (% e bp). | |

**User's choice:** Feedback em tempo real
**Notes:** Melhor UX — elimina ambiguidade de unidades na hora do preenchimento.

---

## Simulador

| Option | Description | Selected |
|--------|-------------|----------|
| Panel lateral fixo na página | Sempre visível à direita das tabelas (~35% da largura). Doc sugere "formulário lateral". | ✓ |
| Seção abaixo das tabelas | Simulador no final da página, acessível via scroll. | |
| Botão que abre Drawer separado | Drawer isolado, abre sob demanda. | |

**User's choice:** Panel lateral fixo na página
**Notes:** Melhor acessibilidade para uso frequente; alinha com a sugestão da doc.

---

## Claude's Discretion

- Skeleton/loading state durante carregamento das listas
- Ordenação padrão das regras na tabela
- Colunas exatas da DataTable
- Comportamento pós-save do Sheet (fechar + toast)
- Empty state da tab "Por Merchant" antes de selecionar merchant

## Deferred Ideas

Nenhuma ideia fora do escopo surgiu.
