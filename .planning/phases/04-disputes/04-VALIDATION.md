---
phase: 4
slug: disputes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest@2.1.9 (instalado, config básica em vitest.config.ts) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/rbac` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Validação manual no browser (smoke test)
- **Before `/gsd:verify-work`:** Checklist manual completo (success criteria do ROADMAP)
- **Max feedback latency:** N/A — validação predominantemente manual (out of scope v1)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01 | 01 | 1 | DISP-01 | manual | — | ❌ W0 | ⬜ pending |
| 4-02 | 02 | 1 | DISP-02/04 | manual | — | ❌ W0 | ⬜ pending |
| 4-03 | 03 | 2 | DISP-03 | manual | — | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Nenhum — política do projeto: sem testes automatizados de feature para v1.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lista paginada de disputas com filtros por status e tipo | DISP-01 | Testes de componente out of scope v1 | Acessar `/disputes` e verificar lista, aplicar filtros, navegar páginas |
| Disputas MED com border-left #FF3B5C e badge de urgência | DISP-01/04 | Verificação visual necessária | Confirmar rows MED com faixa lateral vermelha e badge destacado |
| Timeline visual 3 steps (Aberta → Em Análise → Resolvida) | DISP-02 | Visual; sem browser test configurado | Abrir detalhe de disputa e verificar 3 steps com estados corretos |
| Formulário resolução: campos obrigatórios habilitam submit | DISP-03 | Smoke test manual | Tentar submit sem preencher; verificar botão desabilitado. Preencher ambos; verificar habilitação |
| Formulário oculto para VIEWER | DISP-03 | Role-guard visual | Logar como VIEWER e confirmar ausência do formulário no detalhe |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < N/A (manual)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
