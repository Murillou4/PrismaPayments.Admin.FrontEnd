---
phase: 3
slug: transactions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (if configured) / manual verification |
| **Config file** | none — Wave 0 installs if needed |
| **Quick run command** | `npm run check` |
| **Full suite command** | `npm run check && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run check`
- **After every plan wave:** Run `npm run check && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | TXN-01 | build + typecheck | `npm run check` | TBD | ⬜ pending |
| 03-01-02 | 01 | 1 | TXN-01 | build + typecheck | `npm run check` | TBD | ⬜ pending |
| 03-02-01 | 02 | 2 | TXN-02,TXN-03 | build + typecheck | `npm run check` | TBD | ⬜ pending |
| 03-03-01 | 03 | 3 | TXN-04,TXN-05 | build + typecheck | `npm run check` | TBD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install shadcn popover + range-calendar if missing
- [ ] Extend StatusBadge STATUS_MAP with payment/withdrawal statuses

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Merchant autocomplete searches by name/document | TXN-01 | Requires live API with merchant data | Type 3+ chars in merchant filter, verify dropdown shows matching merchants |
| DateRangePicker presets apply correct date ranges | TXN-01 | Visual + interaction behavior | Click "7 dias" preset, verify calendar highlights correct range |
| Payment detail shows PIX/Boleto/Card conditionally | TXN-02 | Conditional rendering requires real data | Open PIX payment detail, verify qrCode section; open Boleto, verify barcode section |
| Breadcrumbs navigate correctly | TXN-04 | Navigation flow | Click breadcrumb links on detail pages, verify correct navigation |
| Sidebar submenu collapses/expands | TXN-05 | Visual interaction | Click "Transacoes" in sidebar, verify sub-items appear/hide |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
