# Pitfalls Research — Payment Admin Panel

**Domain:** Internal admin panel — Brazilian payment platform
**Researched:** 2026-03-24
**Confidence:** HIGH (SSR auth, token refresh, RBAC, financial arithmetic) / MEDIUM (KYC security, audit logs) / HIGH (Brazilian payment specifics, confirmed via official sources)

---

## Critical (project-killers)

### 1. Auth Cookie Never Written — Already Present in This Codebase

- **Risk**: `hooks.server.ts` checks `event.cookies.get('access_token')` but `AuthService` writes tokens only to `sessionStorage`. The cookie is never set. Every page load after login triggers a server-side redirect back to `/login`. The entire authenticated portion of the app is inaccessible. This is the single highest-priority blocker.
- **Warning signs**: Login succeeds (200 response, token received) but the browser immediately lands back on `/login`. `document.cookie` shows no `access_token`. Network tab shows a redirect 302 on every navigation.
- **Prevention**: On successful login, write the access token to an `HttpOnly`, `Secure`, `SameSite=Strict` cookie from a SvelteKit server action (`+page.server.ts` form action or `+server.ts` endpoint). The client `sessionStorage` copy can still exist for fast client-side reads, but the cookie is the authoritative source for SSR guards. Never split the two without a deliberate synchronization step.
- **Phase**: Phase 1 (Auth fix) — must be resolved before any other feature is useful.

---

### 2. `+layout.server.ts` Auth Guard Does Not Propagate to Leaf Routes

- **Risk**: Placing auth logic only in `+layout.server.ts` creates a false sense of security. SvelteKit runs layout and page load functions in parallel during client-side navigation. A leaf `+page.server.ts` can execute and return data before the layout check has a chance to redirect. Authenticated data is sent to the client even when the guard should have blocked it. This is a documented SvelteKit security issue (see sveltejs/kit issue #6315).
- **Warning signs**: Navigating directly to a deep route via the browser address bar bypasses the layout guard. Routes return data for users who should be blocked when navigating client-side after a session expires.
- **Prevention**: Use `hooks.server.ts` `handle()` as the primary guard — it runs unconditionally before any load function. For role-specific pages, call `await event.parent()` at the start of the leaf `+page.server.ts` to create an explicit dependency chain, or check the role inside each `+page.server.ts` directly. Do not rely on layout protection alone for sensitive routes.
- **Phase**: Phase 1 (Auth fix) / Phase 2 (RBAC) — foundational.

---

### 3. Token Refresh Race Condition — Multiple Concurrent 401s

- **Risk**: When the access token expires, multiple in-flight API requests each independently detect a 401 and each attempt to call the refresh endpoint simultaneously. This triggers multiple refresh calls with the same refresh token. Most backends implement refresh token rotation (each use invalidates the old token and issues a new one). The second refresh call arrives with an already-invalidated token and fails with 401. The user is logged out mid-session despite having a valid refresh token.
- **Warning signs**: Users report random logouts, especially after browser tab is left idle then used. Network tab shows multiple simultaneous `POST /auth/refresh` calls. Occasionally only some requests recover; others fail.
- **Prevention**: Implement a refresh lock with a pending-request queue. The pattern: when a 401 arrives and no refresh is in progress, set a `isRefreshing = true` flag and begin the refresh. Subsequent 401s while `isRefreshing === true` push their retry callbacks into a queue instead of calling refresh again. When the refresh resolves (success or failure), drain the queue — retry all queued requests with the new token or reject all on failure. This must live in the `apiClient.ts` interceptor layer, not in individual repositories.
- **Phase**: Phase 1 (Auth fix) — the refresh interceptor and the cookie fix are part of the same auth slice.

---

### 4. JWT Role Extracted Client-Side Without Signature Verification

- **Risk**: `tokenStorage.ts` decodes the JWT using `atob` + `JSON.parse` on the raw payload segment. Any string can be base64-decoded. A user who manipulates their JWT payload (e.g., by crafting a token with `"role":"SUPER_ADMIN"`) can fool the client-side role checks and see UI elements they should not see. The backend is the actual authority, but this creates a misleading UI that can expose sensitive operation buttons to unauthorized users.
- **Warning signs**: Role-based UI hiding/showing components using data read from `tokenStorage.getRole()` without cross-referencing with a server-validated session.
- **Prevention**: The JWT signature is validated server-side on every API call — that is the correct trust boundary. Client-side role extraction from the JWT payload is acceptable for UI rendering only (showing/hiding menus), not for access decisions. Never use the decoded client-side role as a substitute for server-side authorization. Explicitly comment role reads as "for display only." The real guard is the API rejecting the request. Also: pass the verified role from `hooks.server.ts` (which has already sent the token to the backend) down to pages via `event.locals`, not from re-decoding the token in the browser.
- **Phase**: Phase 1 (Auth) / Phase 2 (RBAC).

---

### 5. RBAC Enforced in UI Only — No Route-Level Guard Called Anywhere

- **Risk**: `adminGuard.ts` exists with `requireRole()` but is never called from any page, layout, or server load function. Every authenticated route is accessible to every role — a `VIEWER` can reach pages restricted to `SUPER_ADMIN`. Fixing the cookie bug (Pitfall 1) without simultaneously wiring the role guards means the app will be authenticated but have no authorization at all.
- **Warning signs**: A `VIEWER`-role session can manually navigate to `/admin-users` or `/fees` and the page loads without error.
- **Prevention**: After fixing the cookie, immediately wire `hooks.server.ts` to extract and attach the role to `event.locals`. Each route group that requires a minimum role should check `event.locals.role` in its `+page.server.ts` load function. The UI role-based rendering (hiding menus, disabling buttons) is a secondary UX layer on top of this server enforcement, not a replacement.
- **Phase**: Phase 2 (RBAC) — must follow Phase 1 auth fix.

---

## High (significant rework if missed)

### 6. Float Arithmetic for Financial Amounts — Do Not Use Native JS Numbers

- **Risk**: Brazilian payment amounts are stored as centavos (integer) in the backend but displayed as reais with decimal formatting in the UI. If any calculation is done in the UI using native JavaScript `Number` (e.g., dividing centavos by 100, adding percentages, computing fee simulations), floating-point precision errors accumulate. Classic example: `0.1 + 0.2 === 0.30000000000000004`. For a fee simulator or dispute amount, this can produce visually wrong numbers that erode trust.
- **Warning signs**: Fee simulator shows amounts like `R$ 3.300000000000001`. Displayed totals differ from backend-calculated totals by a few centavos.
- **Prevention**: Keep all arithmetic in centavos as integers. Convert to display format only at the final rendering step using `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. For any calculation that cannot be done in integer centavos (e.g., percentage-based fees), use a library: `dinero.js` for monetary arithmetic or `decimal.js` / `big.js` for general precision. Never do `amount / 100` as the basis for further arithmetic — only for display.
- **Phase**: Phase 3 (Transactions / Fees) — apply the rule when building any page that displays or calculates amounts.

---

### 7. Pagination State Not Reset When Filters Change

- **Risk**: A user is on page 5 of a merchants list filtered by "active." They change the filter to "suspended." The filter resets the dataset to 2 pages but the current page index stays at 5. The API request fires with `page=5` on a 2-page dataset. Most APIs return an empty result or an error. The table shows "no results" when there are actually 2 pages of suspended merchants on page 1. This is a recurring bug across table libraries (TanStack Table, PrimeVue, React Admin all have open issues on this pattern).
- **Warning signs**: Filters produce "no results" when data clearly exists. API calls show `page=N` where N exceeds the total page count.
- **Prevention**: Every time a filter value changes (any filter, not just the primary one), reset the page index to 1 before issuing the new API request. In the DataTable component, treat filters and pagination as a single state unit: `{ filters, page: 1 }` is the atomic reset, not `filters` and `page` separately. Also guard against empty-page responses on the API side: if the response returns 0 results and `page > 1`, auto-navigate to page 1.
- **Phase**: Phase 3 (any list page — merchants, transactions, disputes, audit).

---

### 8. KYC Document Preview — IDOR and Content-Type Confusion

- **Risk**: KYC document previews fetched by document ID (`/kyc/documents/{id}`) are vulnerable to IDOR if the ID is sequential or guessable. An authenticated admin with `VIEWER` role could access documents belonging to any merchant by iterating IDs. Separately, if the frontend renders document preview URLs in an `<iframe>` or `<img>` based solely on file extension without server-side Content-Type validation, a malicious upload of an HTML file named `document.jpg` could execute scripts in the admin context.
- **Warning signs**: Document URLs use sequential integers (`/documents/1234`). Preview renders an `<iframe>` with a URL that hasn't been checked for MIME type. No role check before fetching the document URL.
- **Prevention**: (1) Document access must be authorized server-side — the backend should verify the requesting admin has access to that merchant before serving the document URL. Use opaque, non-guessable document tokens rather than sequential IDs. (2) On the frontend, always request a signed, time-limited URL from the backend rather than rendering a permanent document URL directly. (3) Render PDFs in a sandboxed `<iframe sandbox="allow-scripts">` or use a PDF.js embed. Render images only if the server-confirmed MIME type is an image type. Never trust the file extension. (4) Large files (>10MB) should be lazy-loaded with a "Download" link rather than previewed inline to avoid memory pressure.
- **Phase**: Phase 4 (KYC Review).

---

### 9. Audit Log Queries Become Unusable at Scale — Offset Pagination Degrades

- **Risk**: Offset-based pagination (`LIMIT 50 OFFSET 5000`) requires the database to scan and discard 5000 rows before returning results. For audit logs that accumulate hundreds of thousands of entries, page 100 takes significantly longer than page 1. The UI shows a loading spinner for seconds on deep pages. Users abandon the audit log because it "feels broken." This is distinct from the frontend — it's a backend query pattern — but the frontend must not encourage deep offset pagination through its design.
- **Warning signs**: Audit log page 1 loads in 80ms. Page 50 loads in 3 seconds. Loading indicator shows for unexpectedly long times on non-recent records.
- **Prevention**: (1) Design the audit log UI to default to time-bounded queries (last 7 days, last 30 days) rather than a raw "all records" unbounded view. (2) Use cursor-based pagination (next-page token from the last record's ID or timestamp) rather than page numbers if the backend supports it. (3) Always provide date range filters as the primary navigation tool — drilling to a specific day's records is faster than paginating to offset 10000. (4) Include a "load more" pattern rather than traditional numbered pages for the audit feed — this naturally prevents deep offset queries. Flag to the backend team if they are using offset pagination on the audit table.
- **Phase**: Phase 5 (Audit log).

---

### 10. Loading State Not Reset on Navigation Failure

- **Risk**: `authController.svelte.ts` never resets `state.loading` to `false` on successful login before calling `goto('/dashboard')`. If navigation fails (e.g., the dashboard page throws), the login button stays permanently disabled and the loading spinner spins forever. The user must refresh the page to try again. This pattern — setting `loading = true` but only resetting on explicit error paths — is a common frontend mistake.
- **Warning signs**: Login button is unclickable after a failed navigation. User must hard-refresh to get the login form back.
- **Prevention**: Always use a `try/finally` pattern for loading state: `loading = true; try { await action(); } finally { loading = false; }`. The `finally` block runs regardless of success or failure, ensuring loading state is always cleaned up. Apply this pattern to every async action in every controller throughout the project.
- **Phase**: Phase 1 (Auth fix) — and establish this as a code standard for all subsequent controllers.

---

### 11. `hooks.server.ts` Deletes Session on Any Validation Error — Transient Logout

- **Risk**: If the `hooks.server.ts` guard calls the backend to validate the token (e.g., to check if it is revoked) and the backend is temporarily unavailable (network hiccup, deploy, timeout), the guard should not interpret the failure as "invalid token" and delete the session. Overly aggressive session deletion on transient errors permanently logs out users who had valid sessions, causing confusion and support tickets.
- **Warning signs**: Users report being logged out during peak hours or deploys. Logs show session deletions correlating with backend timeouts, not 401 responses.
- **Prevention**: Distinguish between "backend says token is invalid" (401/403 — correct to log out) and "backend is unreachable" (network error, 503 — should fail open, keep session, return an error page). Only clear cookies on explicit auth rejection. For unreachable backends, return a 503 error page rather than a redirect to `/login`.
- **Phase**: Phase 1 (Auth fix).

---

## Medium (annoying but fixable)

### 12. Root Redirect via HTML Meta Refresh

- **Risk**: `src/routes/+page.svelte` uses `<meta http-equiv="refresh" content="0; url=/dashboard">`. This is not intercepted by the SvelteKit router, causes a visible flash before redirect, and does not work without JavaScript in some server-rendering edge cases. It is also not semantically correct for a login-gated root.
- **Warning signs**: Visible white flash on initial load before reaching the dashboard. The redirect appears as a full page navigation in the network tab instead of a SvelteKit client-side transition.
- **Prevention**: Replace with a SvelteKit server redirect in `src/routes/+page.server.ts`: `throw redirect(302, '/dashboard')`. The server-side redirect is instantaneous and correct.
- **Phase**: Phase 1 (Auth fix) — trivial to fix alongside the cookie bug.

---

### 13. 401 Responses Do Not Trigger Logout or Redirect

- **Risk**: `DashboardRepository` maps 401 to `UnauthorizedFailure` and `DashboardPage.svelte` displays it as an error string. The user sees "Não autorizado" on screen but is not redirected to `/login` and the expired session is not cleared. The user is stuck on a broken dashboard with stale session data.
- **Warning signs**: Dashboard shows an error message instead of redirecting after session expiry.
- **Prevention**: The `apiClient.ts` interceptor should handle 401 globally: clear session cookies (via a `DELETE /auth/logout` server endpoint that clears the `HttpOnly` cookie, or a form action), then `goto('/login')`. Individual repositories should not need to handle 401 — the interceptor catches it universally.
- **Phase**: Phase 1 (Auth fix).

---

### 14. Non-JSON API Responses Throw Unhandled `SyntaxError`

- **Risk**: `apiClient.ts` calls `await response.json()` unconditionally. A 502 gateway error returning an HTML error page, or a CORS failure returning an empty body, will throw a `SyntaxError` instead of a structured `NetworkFailure`. The error is caught but the message is the raw parse error, not a user-friendly message.
- **Warning signs**: Console shows `SyntaxError: Unexpected token '<'` during network errors. Error toasts show technical JSON parse errors to users.
- **Prevention**: Check `response.headers.get('Content-Type')` before parsing. If it does not contain `application/json`, return a structured `NetworkFailure` with a generic message and log the raw response text for debugging. Pattern: `const text = await response.text(); try { return JSON.parse(text); } catch { throw new NetworkFailure(...) }`.
- **Phase**: Phase 1 (Auth / core infrastructure).

---

### 15. Service Locator Declared but Never Used — DI Inconsistency

- **Risk**: `serviceLocator.ts` exports a DI container but every page instantiates dependencies directly with `new`. As the number of features grows, this inconsistency makes it impossible to swap implementations, write unit tests, or trace dependency graphs. The project will accumulate tight coupling.
- **Warning signs**: Every new feature page contains `new FeatureService(new FeatureRepository())` inline. No feature has a mock implementation for testing.
- **Prevention**: Either adopt the service locator consistently (register all repositories and services at app startup, resolve via `sl.get()` in pages) or delete it and document that direct instantiation is the pattern. The inconsistency itself is the problem — pick one and apply it uniformly across all new features being built.
- **Phase**: Phase 2 (first new feature) — establish the pattern before building 9 more features.

---

### 16. Design Tokens Not Established — Color Duplication at Scale

- **Risk**: The color palette (`#070707`, `#0F0F18`, `#0A0A0F`, `#1A1A28`, `#F6F6FF`, `#9090A8`, `#FF00FF`, `#01FAFB`) is duplicated as inline styles across every existing file. With 10+ feature pages to build, this will grow to hundreds of scattered hex strings. A brand color change requires grep-and-replace across the entire codebase.
- **Warning signs**: Files contain hardcoded hex values. Tailwind config has no custom theme extension.
- **Prevention**: Define the palette as Tailwind CSS custom theme tokens in `tailwind.config.ts` (e.g., `prisma-bg`, `prisma-surface`, `prisma-accent-cyan`, `prisma-accent-magenta`). Use Tailwind utility classes throughout new components. Refactor existing inline styles incrementally as each feature page is built.
- **Phase**: Phase 2 (before building the first new feature component library).

---

### 17. SvelteKit Route Params Accessed Incorrectly in Svelte 5

- **Risk**: `src/routes/(admin)/merchants/[id]/+page.svelte` accesses route params via `let { params } = $props<{ params: { id: string } }>()`. In SvelteKit 2 + Svelte 5, dynamic route parameters must be loaded via a `+page.ts` or `+page.server.ts` load function and passed through the `data` prop. The current pattern likely receives `undefined` for `params.id`, silently breaking the merchant detail page.
- **Warning signs**: `MerchantDetailPage` receives `merchantId` as `undefined`. API call to `/merchants/undefined` returns a 404 or 400.
- **Prevention**: Add a `+page.ts` (or `+page.server.ts` for SSR) with `export function load({ params }) { return { merchantId: params.id }; }`. The page component receives `merchantId` via `let { data } = $props()`. Apply this pattern to every dynamic route (`[id]` segments) in the admin routes.
- **Phase**: Phase 4 (Merchant Detail) — must be fixed when that page is implemented.

---

## Brazilian Payment Specifics

### 18. CPF Validation — Checksum Required, Not Just Format

- **Risk**: Validating CPF by format only (`/^\d{3}\.\d{3}\.\d{3}-\d{2}$/`) allows structurally correct but mathematically invalid CPFs through. CPF has a mod-11 checksum on the last two digits. A typo that preserves the format (e.g., transposing digits) will pass format validation but is an invalid document. In a KYC context, this can mean a merchant is onboarded with an incorrect CPF that fails government verification.
- **Warning signs**: CPF input accepts `000.000.000-00` or `111.111.111-11` (known invalid sequences that pass format checks but fail checksum). These are also "CPFs that are always invalid" regardless of checksum and must be explicitly blocked.
- **Prevention**: Use a proper CPF validator that implements the mod-11 checksum algorithm, not a regex. Recommended library: `cpf-cnpj-validator` (npm) or `validation-br`. Block known all-same-digit sequences (`000.000.000-00` through `999.999.999-99`) explicitly. Apply validation both in form inputs (real-time feedback) and on form submission.
- **Phase**: Phase 4 (Merchant Detail / KYC forms).

---

### 19. CNPJ — Alphanumeric Format Becomes Valid in July 2026

- **Risk**: All new CNPJ registrations from July 2026 onward use an alphanumeric format (letters + numbers in the first 12 characters, numeric check digits). Any CNPJ validator using `^\d{14}$` or similar purely numeric patterns will reject valid CNPJs for companies registered after the rollout date. This is directly relevant: the project is being built in March 2026, meaning by the time it reaches production stability, new merchants may already be registering with alphanumeric CNPJs.
- **Warning signs**: Merchant creation form rejects a CNPJ that the merchant insists is valid. Backend accepts it but frontend validation blocks submission.
- **Prevention**: Use or implement a CNPJ validator that supports the alphanumeric format. The `validation-br` npm library has been updated to support alphanumeric CNPJs. The checksum algorithm (mod-11) remains the same, applied to character codes. Ensure the input mask also permits letters in the first 12 positions. Existing numeric CNPJs remain valid indefinitely — the validator must support both.
- **Phase**: Phase 4 (Merchant forms) — implement alphanumeric support from the start, not as a later patch.

---

### 20. PIX Key Type Detection — Must Disambiguate Before Formatting

- **Risk**: PIX keys have five distinct types — CPF (11 digits), CNPJ (14 digits numeric, or alphanumeric from July 2026), phone (`+55XXXXXXXXXXX`), email (contains `@`), and random key (UUID format). Displaying a PIX key without knowing its type means no formatting can be applied. Applying the wrong format (e.g., formatting a random key as a CPF) produces visually broken output. Many implementations naively format all PIX keys as CPF/CNPJ when the key just happens to be numeric.
- **Warning signs**: A random UUID-format key is displayed with CPF punctuation. A phone number key is displayed without the international `+55` prefix.
- **Prevention**: Implement a PIX key type detector that classifies the key before formatting. Classification order: (1) matches UUID pattern → random key (display as-is); (2) starts with `+` → phone (format as `+55 (XX) XXXXX-XXXX`); (3) contains `@` → email (display as-is); (4) 14 characters → CNPJ (apply mask); (5) 11 characters → CPF (apply mask). Never apply CPF/CNPJ masks to keys that haven't been positively identified as those types.
- **Phase**: Phase 3 (Transactions — payments list and detail views show PIX keys).

---

### 21. Centavos Display — `toFixed(2)` Is Not Safe for Currency Formatting

- **Risk**: A common pattern for displaying BRL amounts is `(valorEmCentavos / 100).toFixed(2)`. This has two problems: (1) `toFixed` rounds using "round half to even" in some JS engines, producing inconsistent results; (2) it does not apply Brazilian locale formatting (comma decimal separator, dot thousands separator, `R$` symbol). Displaying `1234.56` instead of `R$ 1.234,56` is immediately visible to Brazilian users and signals a broken UI.
- **Warning signs**: Currency amounts display with period as decimal separator. Amounts over 999.99 have no thousands separator. The `R$` prefix is hardcoded as a string concatenation rather than locale-formatted.
- **Prevention**: Always use `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorEmCentavos / 100)`. Create a single shared `formatBRL(centavos: number): string` utility function and import it everywhere. Never use `toFixed`, string concatenation, or manual formatting. The `Intl` API correctly handles locale-specific separators and the `R$` symbol.
- **Phase**: Phase 2 (shared utilities, before any financial data page is built).

---

### 22. Boleto Date Factor — "Y2K-Like" Reset in 2025

- **Risk**: Boleto barcodes contain a 4-digit "factor de vencimento" (due date factor) calculated as the number of days since October 7, 1997. This counter overflowed and reset in 2025. Any boleto barcode validator using the naive factor-to-date formula without accounting for the 2025 reset will calculate incorrect expiry dates for boletos issued after the reset point. This affects the Diagnostics and Transactions pages if they display boleto expiry dates decoded from barcode data.
- **Warning signs**: Boleto expiry dates appear as dates in 1997-2000 for recent boletos. Date validation logic rejects valid boletos as "expired."
- **Prevention**: Use an up-to-date boleto validation library that handles the factor reset: `boleto-brasileiro-validator` (npm) or `@mrmgomes/boleto-utils` have been updated. If implementing barcode parsing manually, apply the adjusted formula: if `factor < 1000`, add 9000 days to the base date to account for the wraparound. Always display the decoded date from the API response rather than re-calculating client-side if the backend already handles this.
- **Phase**: Phase 3 (Transactions — payments list) and Phase 6 (Diagnostics — if boleto data appears in HTTP logs).

---

### 23. CPF/CNPJ Input Masking — Stripping Mask Before API Submission

- **Risk**: Input masks (format: `000.000.000-00`) are applied to CPF/CNPJ fields for user readability. The masked value is frequently submitted to the API without stripping the punctuation. The backend may reject `123.456.789-09` and expect `12345678909`, or vice versa. This causes silent form submission failures when the API contract expects unmasked values but the form sends masked ones.
- **Warning signs**: Form submission returns a validation error from the API despite the field appearing valid in the UI. API logs show CPFs like `"123.456.789-09"` when the backend expects `"12345678909"`.
- **Prevention**: Store the raw unmasked value in the form model; apply the mask only for display. On submission, send the raw digits. Alternatively, strip non-digit characters before submission: `cpf.replace(/\D/g, '')`. Confirm the API contract for each field — check whether the backend expects masked or unmasked format and document it in the repository interface.
- **Phase**: Phase 4 (Merchant forms / KYC) — applies to every CPF/CNPJ field.

---

## Phase-Specific Warning Summary

| Phase | Topic | Key Pitfall | Mitigation Priority |
|-------|-------|-------------|---------------------|
| 1 | Auth cookie fix | Cookie never written; SSR guard always redirects | CRITICAL — fix before all else |
| 1 | Token refresh | Race condition with multiple 401s | HIGH — implement queue pattern in apiClient |
| 1 | Loading state | `finally` block missing on async actions | HIGH — establish pattern now |
| 2 | RBAC wiring | Layout-level guards don't propagate | CRITICAL — use hooks.server.ts + page-level checks |
| 2 | Design tokens | Hex colors duplicated across files | MEDIUM — define Tailwind theme before building components |
| 2 | DI pattern | Service locator vs direct instantiation | MEDIUM — decide once, apply consistently |
| 3 | Financial arithmetic | Float precision in fee calculations | HIGH — use `Intl.NumberFormat` + integer centavos |
| 3 | PIX key display | Type detection before formatting | MEDIUM — build classifier utility |
| 3 | Pagination + filters | Page index not reset on filter change | HIGH — atomic state reset |
| 4 | Merchant routes | `params` accessed via wrong Svelte 5 pattern | HIGH — add `+page.ts` load functions |
| 4 | CPF validation | Format-only check allows invalid documents | HIGH — implement checksum validation |
| 4 | CNPJ future-proofing | Alphanumeric format active July 2026 | HIGH — support both formats from day one |
| 4 | KYC preview | IDOR via sequential document IDs | HIGH — use signed URLs, verify access server-side |
| 4 | Input masking | Mask sent to API instead of raw value | MEDIUM — strip before submission |
| 5 | Audit log | Offset pagination degrades at scale | MEDIUM — use date-bounded queries + cursor pagination |
| 3/6 | Boleto dates | Factor reset in 2025 breaks date calculation | MEDIUM — use updated library |

---

## Sources

- [SvelteKit layout server auth propagation issue (sveltejs/kit #6315)](https://github.com/sveltejs/kit/issues/6315)
- [Protected Routes in SvelteKit — Don't Use +layout.server.ts](https://gebna.gg/blog/protected-routes-svelte-kit)
- [SvelteKit Auth Race Condition Debugging](https://shanechang.com/p/sveltekit-auth-race-condition-debugging/)
- [Securing Your SvelteKit App — Captain Codeman](https://www.captaincodeman.com/securing-your-sveltekit-app)
- [Race Conditions in JWT Refresh Token Rotation — Medium](https://medium.com/@backendwithali/race-conditions-in-jwt-refresh-token-rotation-%EF%B8%8F-%EF%B8%8F-5293056146af)
- [Refresh Token Race Condition — Apideck](https://developers.apideck.com/guides/refresh-token-race-condition)
- [Financial Precision in JavaScript — DEV Community](https://dev.to/benjamin_renoux/financial-precision-in-javascript-handle-money-without-losing-a-cent-1chc)
- [Currency Calculations in JavaScript — Honeybadger](https://www.honeybadger.io/blog/currency-money-calculations-in-javascript/)
- [IDOR Vulnerabilities — PortSwigger Web Security Academy](https://portswigger.net/web-security/access-control/idor)
- [cpf-cnpj-validator — npm](https://www.npmjs.com/package/cpf-cnpj-validator)
- [validation-br — npm](https://www.npmjs.com/package/validation-br)
- [Brazil Alphanumeric CNPJ July 2026 — Fiscal Solutions](https://www.fiscal-requirements.com/news/5177)
- [PIX Key Format Specification — Banco Central do Brasil](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf)
- [boleto-brasileiro-validator — npm](https://www.npmjs.com/package/boleto-brasileiro-validator)
- [Boleto Factor Reset 2025 — DEV Community (FEBRABAN standard)](https://dev.to/matheuscamarques/the-definitive-guide-to-parsing-financial-protocols-and-the-febraban-standard-5fkj)
- [Pagination state not reset after filter change — TanStack Table #4797](https://github.com/TanStack/table/issues/4797)
- [Building Audit Trails — Medium](https://medium.com/@tony.infisical/guide-to-building-audit-logs-for-application-software-b0083bb58604)
- [RBAC Frontend Access Control — LogRocket](https://blog.logrocket.com/choosing-best-access-control-model-frontend/)
