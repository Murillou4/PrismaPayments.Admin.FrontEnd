---
status: partial
phase: 01-auth-core-infrastructure
source: [01-VERIFICATION.md]
started: "2026-03-25T01:00:00.000Z"
updated: "2026-03-25T01:00:00.000Z"
---

## Current Test

[awaiting human testing]

## Tests

### 1. Cookie HttpOnly flags
expected: DevTools > Application > Cookies confirma flag `httpOnly` definida em `access_token` e `refresh_token` após login
result: [pending]

### 2. Transparent token refresh
expected: Token expirado dispara `/api/v1/auth/refresh` + retry da requisição original sem redirecionar para login
result: [pending]

### 3. RBAC sidebar — VIEWER
expected: Item de menu `Admins` ausente do DOM quando logado como VIEWER
result: [pending]

### 4. RBAC sidebar — SUPER_ADMIN
expected: Item de menu `Admins` visível quando logado como SUPER_ADMIN
result: [pending]

### 5. Bar chart period switching
expected: Cada clique de tab dispara chamada `getChartData` e atualiza o gráfico; empty state exibido quando API retorna sem pontos
result: [pending]

### 6. Alert cards conditional display
expected: Cards de alerta aparecem/desaparecem conforme `openDisputes`/`pendingKycCount` da API; cliques navegam para rotas corretas (`/disputes` e `/merchants?verification=PENDING_REVIEW`)
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
