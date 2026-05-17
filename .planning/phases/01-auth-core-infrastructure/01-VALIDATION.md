---
phase: 1
slug: auth-core-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | AUTH-01 | unit | `npx vitest run src/lib/auth` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | AUTH-02 | unit | `npx vitest run src/lib/auth` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | AUTH-03 | unit | `npx vitest run src/lib/auth` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | AUTH-04 | unit | `npx vitest run src/lib/auth` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 1 | AUTH-05 | unit | `npx vitest run src/lib/auth` | ❌ W0 | ⬜ pending |
| 1-01-06 | 01 | 1 | AUTH-06 | unit | `npx vitest run src/lib/auth` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | RBAC-01 | unit | `npx vitest run src/lib/rbac` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | RBAC-02 | unit | `npx vitest run src/lib/rbac` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 1 | RBAC-03 | unit | `npx vitest run src/lib/rbac` | ❌ W0 | ⬜ pending |
| 1-02-04 | 02 | 1 | RBAC-04 | unit | `npx vitest run src/lib/rbac` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | INFRA-01 | unit | `npx vitest run src/lib/components` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 2 | INFRA-02 | unit | `npx vitest run src/lib/components` | ❌ W0 | ⬜ pending |
| 1-03-03 | 03 | 2 | INFRA-03 | unit | `npx vitest run src/lib/components` | ❌ W0 | ⬜ pending |
| 1-03-04 | 03 | 2 | INFRA-04 | unit | `npx vitest run src/lib/components` | ❌ W0 | ⬜ pending |
| 1-03-05 | 03 | 2 | INFRA-05 | unit | `npx vitest run src/lib/components` | ❌ W0 | ⬜ pending |
| 1-03-06 | 03 | 2 | INFRA-06 | unit | `npx vitest run src/lib/components` | ❌ W0 | ⬜ pending |
| 1-03-07 | 03 | 2 | INFRA-07 | unit | `npx vitest run src/lib/components` | ❌ W0 | ⬜ pending |
| 1-03-08 | 03 | 2 | INFRA-08 | unit | `npx vitest run src/lib/components` | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 3 | DASH-01 | integration | `npx vitest run src/routes/\(admin\)/dashboard` | ❌ W0 | ⬜ pending |
| 1-04-02 | 04 | 3 | DASH-02 | integration | `npx vitest run src/routes/\(admin\)/dashboard` | ❌ W0 | ⬜ pending |
| 1-04-03 | 04 | 3 | DASH-03 | integration | `npx vitest run src/routes/\(admin\)/dashboard` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/auth/__tests__/auth.test.ts` — stubs para AUTH-01 a AUTH-06
- [ ] `src/lib/rbac/__tests__/rbac.test.ts` — stubs para RBAC-01 a RBAC-04
- [ ] `src/lib/components/__tests__/components.test.ts` — stubs para INFRA-01 a INFRA-08
- [ ] `src/routes/(admin)/dashboard/__tests__/dashboard.test.ts` — stubs para DASH-01 a DASH-03
- [ ] `vitest.config.ts` — se não existir, instalar e configurar vitest

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cookie HttpOnly escrito no browser real | AUTH-01 | Vitest não acessa browser storage real | Abrir DevTools > Application > Cookies, verificar `access_token` com HttpOnly flag |
| Refresh silencioso em múltiplas abas | AUTH-03 | Race condition entre abas não é reproduzível em unit test | Abrir 2 abas, expirar token, verificar que ambas renovam sem erro |
| Redirect 403 no SSR | RBAC-03 | SSR redirect requer browser real | Acessar rota protegida com role insuficiente, verificar redirect |
| Dashboard gráfico por período | DASH-02 | Backend endpoint pode não existir ainda | Selecionar período no filtro, verificar dados no gráfico |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
