---
phase: 5
slug: fees
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest@2.1.9 + @vitest/coverage-v8@2.1.9 |
| **Config file** | `vite.config.ts` (integrado) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~10 seconds |

**Nota do projeto:** REQUIREMENTS.md §"Out of Scope" explicita "Testes automatizados: fora do escopo v1". Vitest está instalado mas não será usado para features nesta fase. Toda a verificação é manual via success criteria do ROADMAP.

---

## Sampling Rate

- **After every task commit:** Verificação manual (TypeScript build via `npx tsc --noEmit`)
- **After every plan wave:** Inspeção visual no browser dev server
- **Before `/gsd:verify-work`:** All success criteria must be confirmed manually
- **Max feedback latency:** N/A (manual verification)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | FEES-01 | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | FEES-01 | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | FEES-04 | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | FEES-02 | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | FEES-03 | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Nenhum — o projeto não usa testes automatizados para features v1. "Existing infrastructure covers all phase requirements" (TypeScript check via `npx tsc --noEmit`).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Duas tabs Global / Por Merchant visualmente distintas | FEES-01 | Fora do escopo v1 (testes UI) | Acessar `/fees` no browser — verificar presença das duas tabs, tabela global carrega ao abrir, tab Por Merchant mostra empty state sem merchant selecionado |
| Formulário Sheet criação/edição com conversão correta | FEES-02 | Fora do escopo v1 | Abrir Sheet "+ Nova Regra", digitar 2.5% → verificar hint "250 basis points"; salvar e confirmar regra na lista |
| ConfirmDialog exclui regra e remove da lista | FEES-03 | Fora do escopo v1 | Clicar excluir numa regra, confirmar no dialog → regra não deve aparecer mais na tabela |
| Simulador exibe bruto/taxa/líquido + ruleId | FEES-04 | Fora do escopo v1 | Preencher tipo, valor e (opcional) merchant → clicar "Simular" → verificar exibição dos três valores e da regra aplicada |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < N/A (manual)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
