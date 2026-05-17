# Research Summary — PrismaPayments Admin Frontend

**Synthesized:** 2026-03-24
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
**Overall Confidence:** HIGH

---

## Executive Summary

PrismaPayments Admin Frontend is a Brazilian payment platform back-office panel built on SvelteKit 2 + Svelte 5 (runes), Tailwind CSS v4, and TypeScript strict mode. The codebase has the right architectural skeleton — clean layering (domain / data / service / presentation), an Either-based error pattern, role guards, and a shared API client — but it has a critical blocker that prevents any page from rendering: the login action writes tokens to `sessionStorage` only, while `hooks.server.ts` checks an `HttpOnly` cookie that is never written. Every authenticated route immediately redirects back to `/login`. No feature can be tested, demonstrated, or built upon until this is resolved. The auth fix is the only Phase 1 deliverable that matters.

Once the auth layer is sound, the build order is clear from feature dependencies. The `DataTable`, filter primitives, `StatusBadge`, `ConfirmDialog`, and `Toast` components are consumed by every feature that follows — they must exist before any list page is attempted. Merchants is the highest-value and most structurally complex feature (list, detail, KYC review, create) and should be built first as the template that every subsequent feature copies. Transactions, Disputes, Fees, Admin Users, Audit, and read-only views follow in dependency order.

The Brazilian payment domain introduces three non-obvious requirements that must be baked in from the start, not retrofitted: (1) all monetary arithmetic must stay in integer centavos and convert to display using `Intl.NumberFormat('pt-BR')` — never `toFixed`; (2) CPF validation requires the mod-11 checksum, and CNPJ validation must support the alphanumeric format rolling out in July 2026; (3) PIX keys require type detection before any formatting is applied. These are table-stakes correctness issues, not polish items.

---

## Key Findings

### From STACK.md — Technology Decisions

| Concern | Decision | Critical Note |
|---------|----------|---------------|
| Data tables | `@tanstack/table-core` (headless) with thin Svelte 5 `$state` adapter | Do NOT use `@tanstack/svelte-table` — broken with Svelte 5 |
| Charts | `chart.js` + `svelte5-chartjs` for standard charts; `lightweight-charts` for financial time-series | Do NOT use original `svelte-chartjs` — abandoned, Svelte 4 only |
| Forms | `sveltekit-superforms` v2 + `zod` + `formsnap` | Login form already exists — only apply to new complex forms |
| Date pickers | `bits-ui` v1 `DateRangePicker` + `@internationalized/date` | Already a transitive dep via shadcn-svelte patterns |
| PDF preview | `pdfjs-dist` v4 with worker copied to `static/` | Never use `<iframe>` for authenticated document URLs |
| JWT decode | `jwt-decode` v4 (named export) | Client-side decode is for UI display only, not access decisions |
| Currency | Native `Intl.NumberFormat('pt-BR')` — no library | Implement once in `src/lib/utils/currency.ts`, import everywhere |
| Toasts | `svelte-sonner` v1 (runes-native) | Mount `<Toaster />` once in `AdminLayout.svelte` |
| Modals | Native `<dialog>` for simple confirms; `bits-ui` Dialog for rich content | No extra installs beyond bits-ui already listed |

**Install command (all new deps at once):**
```bash
npm install @tanstack/table-core chart.js svelte5-chartjs lightweight-charts \
  sveltekit-superforms zod formsnap bits-ui @internationalized/date \
  pdfjs-dist jwt-decode svelte-sonner
```

---

### From FEATURES.md — What to Build

**Table stakes (v1, non-negotiable):**
- Dashboard with global metrics snapshot
- Merchant list (filterable, paginated) + detail page (tabbed) + status transitions with mandatory reason
- KYC document review (approve / reject) with inline document preview
- Cross-merchant transaction list (payments + withdrawals) with full filter bar
- Dispute resolution workflow (list + side-panel with timeline + resolution form)
- Fee rules CRUD (global + per-merchant) + fee simulator (inline, debounced)
- Admin user management (SUPER_ADMIN only)
- Audit log viewer with inline diff expansion
- Payment provider status cards (read-only)
- HTTP diagnostics log (filterable)
- Platform config snapshot (read-only)
- RBAC-enforced UI throughout (routes, buttons, sidebar sections)

**Should-have (v1 if low effort):**
- Pending approvals widget on dashboard (low complexity, high ops value)
- Dispute aging indicator (low complexity, regulatory relevance for MED type)
- Copy-to-clipboard on all IDs (low complexity, high support value)
- Merchant-scoped fee override indicator (low complexity)

**Defer to v2:**
- Real-time WebSocket notifications
- CSV / Excel export
- 2FA for admin login
- Bulk KYC queue processing
- Fee rule effective dates (requires backend work)
- Trace view grouping in diagnostics (medium complexity)

---

### From ARCHITECTURE.md — How to Build It

**Auth fix (exact pattern):**
- Create `src/routes/login/+page.server.ts` with a form action that calls the backend, then uses `cookies.set('access_token', ..., { httpOnly: true, secure: true, sameSite: 'strict' })` before redirecting to `/dashboard`.
- Extend `hooks.server.ts` to forward the token into `event.locals.accessToken`.
- After token refresh, call `POST /api/internal/sync-token` (a thin SvelteKit server endpoint) to re-write the HttpOnly cookie — JavaScript cannot write HttpOnly cookies directly.

**State management — keep the existing pattern:**
- Svelte 5 `$state` runes only, local to controller files (`.svelte.ts`). No Svelte stores, no global state managers.
- Every new feature produces a `<FeatureName>Controller.svelte.ts` with a `createXController()` factory. Page `.svelte` files are thin templates.
- `try/finally` on every async action to guarantee loading state reset.

**Shared infrastructure (must exist before feature work):**
- `DataTable.svelte` — generic, typed, column-definition-driven, with Svelte 5 snippet API for custom cell rendering.
- `Pagination.svelte` — internal to DataTable, derived from `PaginatedResult<T>` (`skip`, `limit`, `total`).
- Filter primitives in `src/app/shared/widgets/filters/`: `SearchInput`, `SelectFilter`, `DateRangeFilter`.
- `StatusBadge.svelte`, `ConfirmDialog.svelte`, `Toast` (via svelte-sonner).

**Feature directory structure (all new features follow this):**
```
src/app/features/<domain>/<sub-feature>/
  domain/entities/   — plain TS interfaces
  domain/repositories/  — interface (Either<Failure, T> return types)
  data/repositories/    — implementation calling apiClient
  services/             — orchestration
  presentation/controllers/  — $state + service calls
  presentation/pages/        — thin templates
  presentation/components/   — feature-specific filters, row components
```

**Route guard matrix (enforced in `hooks.server.ts` + per-route `+page.server.ts`):**

| Route | Min Role |
|-------|----------|
| `/dashboard`, `/merchants`, `/transactions`, `/fees`, `/providers` | VIEWER |
| `/merchants/[id]/kyc`, `/disputes` | SUPPORT |
| `/fees` (write), `/audit`, `/diagnostics`, `/config` | ADMIN |
| `/admin-users` | SUPER_ADMIN |

---

### From PITFALLS.md — What Will Break Without Attention

**Critical (will block the project):**

1. **Auth cookie never written** — Phase 1, fix before everything else. Symptom: login succeeds but every page redirects to `/login`.
2. **Layout-level auth guards do not propagate in SvelteKit** — Use `hooks.server.ts` as the primary guard. Leaf routes need their own checks for role-sensitive pages.
3. **Token refresh race condition** — Implement a `isRefreshing` flag + pending-request queue in `apiClient.ts`. Without it, concurrent 401s will exhaust the refresh token and log users out.
4. **`adminGuard.ts` never called anywhere** — After the cookie fix, immediately wire role checks. The app is fully authenticated but has zero authorization without this.

**High (significant rework if missed):**

5. **Float arithmetic for amounts** — All monetary calculations in integer centavos; `Intl.NumberFormat` for display only. Never `toFixed`, never `amount / 100` as basis for further math.
6. **Pagination page not reset on filter change** — Atomic state reset: any filter change sets `page = 1` before issuing the request.
7. **`params` accessed incorrectly in Svelte 5** — Dynamic routes (`[id]`) need a `+page.ts` load function; params do not arrive directly via `$props()`.
8. **CPF checksum + alphanumeric CNPJ** — Use `validation-br` (supports both). Format-only regex is wrong. Alphanumeric CNPJ is live from July 2026 — this project ships into that window.
9. **KYC IDOR via sequential document IDs** — Rely on backend signed URLs; verify access server-side; never trust file extension for MIME type.
10. **PIX key type detection** — Classify key type (UUID / phone / email / CNPJ / CPF) before applying any mask.

**Medium (painful but not catastrophic):**

11. Root redirect via `<meta http-equiv="refresh">` — Replace with `+page.server.ts` redirect.
12. 401 responses show error text instead of triggering logout — Handle globally in `apiClient.ts`.
13. Non-JSON responses throw `SyntaxError` — Guard `response.json()` with Content-Type check.
14. Service locator declared but never used — Decide on one DI pattern (direct instantiation or locator) before building feature #2.
15. Design tokens not in Tailwind config — Define custom theme tokens before building the component library (hex values are currently scattered inline).
16. Boleto date factor reset (2025) — Use `boleto-brasileiro-validator` for any barcode parsing.
17. CPF/CNPJ mask values submitted to API — Strip non-digits before submission.

---

## Cross-Cutting Themes

Three themes emerge across all four research files:

**1. Auth is the foundation of everything.**
The cookie bug (PITFALLS #1), the layout-guard propagation issue (#2), the refresh race condition (#3), and the unhooked RBAC (#5) are all auth-layer problems. None of them are discovered in isolation — they compound. Phase 1 must treat auth as a single slice: cookie fix + refresh interceptor + cookie sync endpoint + RBAC wiring in hooks. Shipping the cookie fix alone leaves a fully-authenticated but authorization-free app.

**2. Brazilian payment specifics are non-negotiable correctness requirements.**
Three pitfalls (float arithmetic, CPF/CNPJ validation, PIX key formatting) and one stack decision (Intl.NumberFormat) all stem from the same source: this is a Brazilian financial product and incorrect handling of money amounts, document numbers, or payment identifiers is immediately visible and trust-destroying for ops users. These are not "nice to have" — they are correctness requirements that must be enforced at the utility layer before any financial data page is built.

**3. Shared infrastructure gates feature velocity.**
ARCHITECTURE.md's build order and FEATURES.md's feature list both converge on the same conclusion: DataTable, filter primitives, StatusBadge, ConfirmDialog, and Toast are consumed by every single feature. Building them well in Phase 1/2 means every subsequent feature is fast. Skipping them means every feature team reinvents the same patterns with inconsistent results.

---

## Implications for Roadmap

### Suggested Phase Structure

**Phase 1 — Auth + Core Infrastructure (blocks all other work)**
- Fix auth cookie bug (login `+page.server.ts` form action)
- Add token refresh interceptor with queue pattern to `apiClient.ts`
- Add `/api/internal/sync-token` endpoint for cookie sync after refresh
- Wire `hooks.server.ts` to populate `event.locals.accessToken` + role
- Fix root redirect (replace meta-refresh with server redirect)
- Fix 401 global handling in `apiClient.ts`
- Fix non-JSON response guard in `apiClient.ts`
- `try/finally` loading state pattern — establish as code standard
- Build shared widgets: `DataTable`, `Pagination`, `StatusBadge`, `ConfirmDialog`, filter primitives, toast setup
- Define Tailwind design tokens (custom theme)
- Decide and document DI pattern
- Shared utilities: `formatBRL`, `formatCPF`/`formatCNPJ`, PIX key classifier
- Research flag: NONE — patterns are well-documented

**Phase 2 — Merchants (template feature, highest business value)**
- RBAC wiring for all routes (hooks + per-route guards)
- Merchant domain entities, repository interface + implementation, service
- Merchants list page + controller (DataTable + filter bar)
- Merchant detail page (tabbed: Info, KYC, Balance, Settings, Transactions, Credentials)
- Merchant status transitions (ConfirmDialog + mandatory reason)
- KYC document review (document gallery, PDF.js preview modal, approve/reject)
- Merchant creation form (ADMIN+, superforms + zod)
- CPF/CNPJ validation with `validation-br` (checksum + alphanumeric)
- Fix `[id]` route param pattern (`+page.ts` load functions)
- Research flag: NONE — architecture fully specified

**Phase 3 — Transactions (Payments + Withdrawals)**
- Payment domain entities + repository + service
- Cross-merchant payments list (DataTable, full filter bar including date range + merchant + status + isTest)
- Payment detail page (method-specific sections: PIX QR, Boleto barcode, Card)
- PIX key classifier utility (if not done in Phase 1)
- Boleto date factor library integration
- Withdrawals list + detail (near-copy of payments)
- Float arithmetic guard applied to all amount displays
- Research flag: NONE

**Phase 4 — Disputes**
- Dispute domain entities + repository + service
- Disputes list (tab-based status filter, aging indicator)
- Dispute side-panel (timeline + resolution form, SUPPORT+ guard)
- Research flag: NONE

**Phase 5 — Fees**
- Fee rule domain entities + repository + service
- Fee rules list (global + merchant-specific sections)
- Fee rule create/edit form (stepped inputs, basis points / centavos conversion)
- Fee simulator (inline panel, debounced, links applied rule)
- Research flag: NONE

**Phase 6 — Admin Users**
- Admin user domain entities + repository + service
- Admin users list (role badges, active toggle, "You" indicator)
- Create admin modal (SUPER_ADMIN only, no role escalation beyond caller's role)
- Edit inline / deactivate (soft delete, "Deactivate" not "Delete")
- Research flag: NONE

**Phase 7 — Audit + Diagnostics**
- Audit log list (reverse-chronological, actor/action/resource/date filters)
- Inline diff expansion (before/after key-value render, not raw JSON)
- Resource links from audit entries to affected pages
- Cursor/date-bounded pagination (flag offset pagination risk to backend team)
- Diagnostics HTTP log (path / status / merchant / traceId filters, ADMIN+ guard)
- Research flag: Audit pagination strategy — confirm backend supports cursor or date-bounded queries before building the UI pagination model

**Phase 8 — Providers + Config (read-only polish)**
- Payment provider status card grid
- Platform config snapshot (key-value display, read-only)
- Dashboard KPI widget refinements (pending approvals widget, period selector if API supports it)
- Research flag: NONE

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Auth fix pattern | HIGH | Directly derived from codebase analysis; SvelteKit docs confirm |
| RBAC wiring | HIGH | `adminGuard.ts` already correct; just needs to be called |
| Stack choices | HIGH | All libraries verified against official docs + active repos |
| Feature requirements | HIGH | Sourced from `FRONTEND_ADMIN_DOC.md` and `PROJECT.md` |
| Architecture patterns | HIGH | Based on direct codebase analysis |
| Brazilian payment specifics | HIGH | CPF/CNPJ specs from Receita Federal; PIX from BCB; Boleto from FEBRABAN |
| Audit pagination strategy | MEDIUM | Frontend UI is clear; backend pagination contract not confirmed |
| Dashboard KPI period selector | MEDIUM | Requires backend date-range params — not confirmed in API contract |

**Gaps to address during planning:**
- Confirm whether the audit log API supports cursor-based or date-bounded pagination (affects Phase 7 UX model significantly).
- Confirm whether dashboard metrics API accepts date-range parameters (affects whether the period selector is a v1 or v2 feature).
- Confirm whether KYC document URLs are already signed/time-limited on the backend, or whether the frontend must request signed URLs (affects Phase 2 KYC review security design).

---

## Sources (aggregated)

- [TanStack Table — Svelte Docs](https://tanstack.com/table/latest/docs/framework/svelte/svelte-table)
- [shadcn-svelte Data Table](https://www.shadcn-svelte.com/docs/components/data-table)
- [Superforms — SvelteKit](https://superforms.rocks/)
- [Bits UI — Date Range Picker](https://bits-ui.com/docs/components/date-range-picker)
- [pdf.js GitHub (Mozilla)](https://github.com/mozilla/pdf.js/)
- [svelte-sonner GitHub](https://github.com/wobsoriano/svelte-sonner)
- [SvelteKit layout server auth propagation issue (#6315)](https://github.com/sveltejs/kit/issues/6315)
- [Protected Routes in SvelteKit — Don't Use +layout.server.ts](https://gebna.gg/blog/protected-routes-svelte-kit)
- [Race Conditions in JWT Refresh Token Rotation](https://medium.com/@backendwithali/race-conditions-in-jwt-refresh-token-rotation-%EF%B8%8F-%EF%B8%8F-5293056146af)
- [validation-br — npm](https://www.npmjs.com/package/validation-br)
- [Brazil Alphanumeric CNPJ July 2026 — Fiscal Solutions](https://www.fiscal-requirements.com/news/5177)
- [PIX Key Format Specification — Banco Central do Brasil](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf)
- [boleto-brasileiro-validator — npm](https://www.npmjs.com/package/boleto-brasileiro-validator)
- [Boleto Factor Reset 2025 — FEBRABAN standard](https://dev.to/matheuscamarques/the-definitive-guide-to-parsing-financial-protocols-and-the-febraban-standard-5fkj)
- [Financial Precision in JavaScript — DEV Community](https://dev.to/benjamin_renoux/financial-precision-in-javascript-handle-money-without-losing-a-cent-1chc)
- [IDOR Vulnerabilities — PortSwigger Web Security Academy](https://portswigger.net/web-security/access-control/idor)
