---
status: partial
phase: 04-disputes
source: [04-VERIFICATION.md]
started: 2026-04-16T00:00:00Z
updated: 2026-04-16T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. MED row pulse animation renderiza visualmente no browser
expected: Rows com disputeType=MED exibem border-left que pulsa entre rgba(255,59,92,0.60) e rgba(255,59,92,1.00) na listagem /disputes
result: [pending]

### 2. VIEWER role — formulário de resolução ausente do DOM
expected: Logado como VIEWER, o card 'Resolução' está completamente ausente do DOM em /disputes/:id — não desabilitado, não oculto via display:none, simplesmente não montado
result: [pending]

### 3. Filtros de Status e Tipo filtram a lista ao selecionar
expected: Selecionar Status ou Tipo dispara chamada real para GET /api/v1/admin/disputes?status=... e a tabela re-renderiza com resultados da API
result: [pending]

### 4. Submit bem-sucedido: toast + navegação
expected: Após preencher ambos os campos do formulário e submeter, toast 'Disputa resolvida com sucesso.' aparece e o browser navega para /disputes
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
