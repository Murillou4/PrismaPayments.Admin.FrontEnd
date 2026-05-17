# Phase 4: Disputes — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 04-disputes
**Areas discussed:** Timeline visual, Destaque MED, Formulário de resolução, Dados do pagamento no detalhe

---

## Timeline visual

| Option | Description | Selected |
|--------|-------------|----------|
| A | Steps derivados do status atual com timestamps inferidos (openedAt, updatedAt, resolvedAt) | |
| B | Apenas 2 pontos anchor: abertura e resolução, com status como badge separado | |
| C | Steps sempre presentes, timestamps apenas quando há dado real da API | ✓ |

**User's choice:** C
**Notes:** Usuário concordou com a recomendação. Rationale: A é problemático porque `updatedAt` não é confiável como proxy para "entrou em análise" (muda ao resolver também). B perde o valor visual do processo. C é honesto com os dados disponíveis e padrão de ferramentas profissionais de suporte (Zendesk, Stripe Radar).

---

## Destaque MED

| Option | Description | Selected |
|--------|-------------|----------|
| A | Border-left colorido (3px) + badge MED com cor de urgência na coluna Tipo | ✓ |
| B | Row inteira com background sutil âmbar/vermelho + badge tipo normal | |
| C | Badge "URGENTE" + ícone de relógio, sem alterar a row | |

**User's choice:** A
**Notes:** Padrão Linear/Jira para prioridade alta. Row inteira não muda de fundo — apenas faixa lateral + badge.

---

## Formulário de resolução

| Option | Description | Selected |
|--------|-------------|----------|
| A | Página de detalhe dedicada `/disputes/:id` com timeline + dados + formulário | ✓ |
| B | Sheet/slide-over da lista — resolução inline sem nova rota | |

**User's choice:** A
**Notes:** Usuário apontou que a decisão já estava implícita pelo padrão estabelecido nas fases anteriores e pela spec do ROADMAP ("abre detalhe de uma disputa"). Confirmado sem necessidade de discussão adicional.

---

## Dados do pagamento no detalhe

| Option | Description | Selected |
|--------|-------------|----------|
| A | Buscar pagamento via GET /admin/payments/:id e exibir card resumido no detalhe | |
| B | Exibir paymentId truncado como link para /transactions/payments/:id, sem chamada extra | ✓ |

**User's choice:** B
**Notes:** Requisitos DISP-01 a DISP-04 não exigem dados do pagamento embutidos. Sugestão da doc é UI hint, não obrigação. Decisão de manter simplicidade e zero chamadas extras.

---

## Claude's Discretion

- Cor exata do border-left MED
- Larguras de colunas e ordenação padrão da lista
- Skeleton layout durante carregamento
- Truncamento do ID nos breadcrumbs
- Comportamento pós-submit do formulário de resolução

## Deferred Ideas

- Indicador de aging (V2-02)
- Dados do pagamento embutidos no detalhe (revisitar se API evoluir)
