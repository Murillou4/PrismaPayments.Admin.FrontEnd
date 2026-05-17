---
status: partial
phase: 03-transactions
source: [03-VERIFICATION.md]
started: 2026-04-14T22:00:00Z
updated: 2026-04-14T22:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Comportamento dos filtros na lista de pagamentos e saques
expected: Navegar para /transactions/payments e aplicar cada filtro (status, metodo, merchant, periodo). As linhas da tabela devem ser filtradas; o filtro de data atualiza client-side (sem refetch); limpar filtros restaura a lista completa.
result: [pending]

### 2. Toast de copia de codigo PIX
expected: Abrir detalhe de um pagamento PIX. Clicar no icone de copiar ao lado de "Codigo PIX". Toast "Codigo PIX copiado" deve aparecer via svelte-sonner; clipboard deve receber o qrCode completo.
result: [pending]

### 3. Auto-expansao do submenu Transacoes na sidebar
expected: Navegar diretamente para /transactions/payments ou /transactions/withdrawals. O submenu "Transacoes" deve expandir automaticamente (isTxnActive = true), mostrando os sub-itens com glow ativo no item correto.
result: [pending]

### 4. DateRangePicker — presets e selecao personalizada
expected: Abrir o date picker. Clicar em "Hoje", "7 dias", "30 dias", "Este mes" — cada preset aplica e fecha o popover. Selecionar range personalizado fecha no segundo click. Filtro client-side atualiza as linhas visiveis.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
