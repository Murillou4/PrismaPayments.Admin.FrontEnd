# Stack Research — Payment Admin Panel

**Project:** PrismaPayments Admin Frontend
**Researched:** 2026-03-24
**Overall confidence:** HIGH (all recommendations verified against official docs or active maintained repos)

---

## Current Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | SvelteKit | ^2.0.0 | With Svelte 5 (runes) |
| Language | TypeScript | ^5.0.0 | Strict mode assumed |
| Styling | Tailwind CSS | ^4.0.0 | v4 — new Vite plugin approach |
| Build | Vite | ^6.0.0 | |
| Icons | lucide-svelte | ^0.475.0 | Already installed |
| Adapter | @sveltejs/adapter-auto | ^3.0.0 | |

**What is missing:** Every feature area (tables, charts, forms, auth token decoding, toasts, modals, date pickers, file preview, currency formatting) has zero library coverage. All of the below must be added.

---

## Recommended Libraries

### Data Tables

**Recommendation: `@tanstack/table-core` (headless) with a custom Svelte 5 adapter, following the shadcn-svelte data-table pattern.**

| Library | Version | Why |
|---------|---------|-----|
| `@tanstack/table-core` | ^8.x | The headless core works fine with Svelte 5. The official `@tanstack/svelte-table` adapter uses `svelte/internal` (broken in Svelte 5), but the core is framework-agnostic and can be driven directly with `$state`. |

**Implementation approach:** Create a thin `createSvelteTable` wrapper that wraps `createTable()` from `@tanstack/table-core` and exposes a `$state`-based reactive table object. This is the exact pattern documented at `jamesoclaire.com/2025/04/09/easiest-way-to-get-tanstack-table-v8-working-with-svelte-5` and used by shadcn-svelte's Data Table component.

**Why not alternatives:**

- `svelte-headless-table` / `humanspeak/svelte-headless-table` — Svelte 4 stores API, not runes-native. Adds friction.
- `@careswitch/svelte-data-table` — small, client-side only, no virtualization. Fine for toy tables, insufficient for 1000+ transaction rows with server pagination.
- SVAR Svelte DataGrid — full-featured but opinionated styling, fights Tailwind v4. Commercial license required for advanced features.

**Required features for this project:**
- Server-side pagination (merchants, transactions, disputes can have thousands of rows)
- Columnwise sorting sent to API as query params
- Multi-filter state (status, merchant, date range) as URL search params
- No client-side virtualization needed when using server-side pagination

```bash
npm install @tanstack/table-core
```

---

### Charts / Metrics

**Recommendation: `chart.js` + `svelte5-chartjs` wrapper for standard metrics dashboards. Use `lightweight-charts` directly for time-series financial charts.**

| Library | Version | Purpose |
|---------|---------|---------|
| `chart.js` | ^4.x | Bar charts (volume by day), doughnut (transaction status split), line charts |
| `svelte5-chartjs` | latest | Svelte 5 wrapper for chart.js — explicit Svelte 5 fork of the inactive `svelte-chartjs` |
| `lightweight-charts` | ^4.x | TradingView's performant canvas-based time-series area/line charts (45kB) |

**Rationale:**
- `chart.js` is the lowest-friction option for standard admin dashboard charts (bar, pie, line). The `svelte5-chartjs` fork was created specifically because the original `svelte-chartjs` is abandoned and Svelte 4 only.
- `lightweight-charts` (TradingView) is purpose-built for financial time-series: transaction volume over time, rolling averages. Canvas-based, performant with large datasets. No Svelte wrapper needed — use `onMount` to initialize.
- Carbon Charts (`@carbon/charts-svelte`) is over-engineered for this use case and brings IBM Design System dependencies.

**Why not Highcharts:** Commercial license required for non-open-source projects.

```bash
npm install chart.js svelte5-chartjs lightweight-charts
```

---

### Forms

**Recommendation: `sveltekit-superforms` + `zod` for all complex forms (fee rules, merchant creation, dispute resolution).**

| Library | Version | Purpose |
|---------|---------|---------|
| `sveltekit-superforms` | ^2.x | Form state, server action binding, validation, tainted detection |
| `zod` | ^3.25+ | Schema validation (v3.25+ required for Zod 4 adapter support in superforms) |
| `formsnap` | ^2.x | Accessible form field/label/error binding components for superforms |

**Rationale:**
- Superforms is the dominant SvelteKit form library with no credible alternative. It handles server-action roundtrips, progressive enhancement, nested schemas, and multiple forms per page — all needed here (fee rules have nested tiers, merchant creation is multi-section).
- Svelte 5 runes compatibility: Superforms v2 works with Svelte 5 in legacy stores mode. The `$props()` issue was resolved. A v3 with native runes is in progress but not needed now.
- Zod provides schema-as-source-of-truth, which enforces the same validation shapes used by the TypeScript domain layer.
- Formsnap wraps Superforms + shadcn-svelte form components with accessible label/error binding.

**Caveat:** Do not use Superforms for the login form (already implemented). Only introduce it for new complex forms.

```bash
npm install sveltekit-superforms zod formsnap
```

---

### Date Pickers

**Recommendation: `bits-ui` `DateRangePicker` and `DatePicker` components, surfaced via shadcn-svelte's date-picker recipe.**

| Library | Version | Purpose |
|---------|---------|---------|
| `bits-ui` | ^1.x (Svelte 5 version) | Headless accessible date picker, date range picker, calendar |
| `@internationalized/date` | ^3.x | Required peer dependency for bits-ui date components (CalendarDate, DateRange types) |

**Rationale:**
- Bits UI's date components are the most mature, WAI-ARIA compliant, keyboard-navigable date pickers available for Svelte 5. They support single date and range selection — both needed (transaction filters use date ranges, fee rule effective-date uses single).
- shadcn-svelte's Date Picker is literally a Bits UI wrapper with Tailwind styling applied — since the project uses Tailwind v4, copying the shadcn-svelte recipe gives a ready-made styled component.
- Bits UI is already the headless primitive beneath shadcn-svelte (which is already the modal/dialog pattern chosen below), so it introduces zero additional transitive dependencies.

```bash
npm install bits-ui @internationalized/date
```

---

### KYC Document Preview

**Recommendation: Native `<img>` for images. `pdf.js` (`pdfjs-dist`) for PDF preview. No heavy library.**

| Library | Version | Purpose |
|---------|---------|---------|
| `pdfjs-dist` | ^4.x | Render PDF documents onto HTML5 canvas in-browser |

**Rationale:**
- KYC documents are uploaded by merchants and accessed via authenticated API URLs. The review flow is: load URL, display full-size preview, approve or reject.
- For JPEG/PNG identity documents: native `<img src="{authenticatedUrl}" />` is sufficient. Add zoom via CSS `transform: scale()`.
- For PDF documents (bank statements, company filings): `pdfjs-dist` is the only production-grade open-source option (42k GitHub stars, Mozilla-maintained). The worker file must be configured to point to a CDN or bundled worker.
- Avoid commercial SDKs (Nutrient, Syncfusion) — overkill, costly, and unnecessary for a read-only review workflow.
- Do not use `<iframe src="...">` for authenticated URLs — the browser will not forward the Authorization header.

**Worker setup note:** Copy `pdfjs-dist/build/pdf.worker.min.mjs` to the `static/` folder and set `GlobalWorkerOptions.workerSrc` on `onMount`.

```bash
npm install pdfjs-dist
```

---

### JWT Decoding

**Recommendation: `jwt-decode` v4 (Auth0) — named export, TypeScript-native, zero dependencies.**

| Library | Version | Purpose |
|---------|---------|---------|
| `jwt-decode` | ^4.0.0 | Decode JWT payload in browser to extract `role` claim; no signature verification |

**Rationale:**
- `jwt-decode` v4 is the canonical browser-side JWT payload decoder. It does not verify the signature — correct for this use case, as the backend is responsible for signature validation.
- v4 changed to named exports: `import { jwtDecode } from 'jwt-decode'`. Full ESM support. TypeScript types built-in. 900-byte bundle.
- The alternative (rolling your own with `atob(token.split('.')[1])`) is 3 lines of code, but `jwt-decode` handles base64url padding edge cases correctly and is audited.
- The PROJECT.md constraint explicitly states: "JWT decodificado no cliente para extrair role; verificação da assinatura é responsabilidade do backend." This library is the exact fit.

```bash
npm install jwt-decode
```

---

### Currency Formatting

**Recommendation: Native `Intl.NumberFormat` — no library needed.**

```typescript
// Create once, reuse across components
export const formatBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Usage: centavos integer (backend stores amounts as integer centavos)
export function formatCentavos(centavos: number): string {
  return formatBRL.format(centavos / 100); // e.g., 150000 → "R$ 1.500,00"
}
```

**Rationale:**
- The `Intl.NumberFormat` API with `'pt-BR'` locale and `'BRL'` currency produces correct output: `R$ 1.500,00` (period thousands separator, comma decimal separator).
- Available in all modern browsers and Node.js. Zero bundle size.
- The backend stores amounts as integers in centavos — divide by 100 before formatting.
- Third-party libraries like `dinero.js`, `currency.js`, or `format-money` add bundle weight for zero benefit when Intl is available everywhere the admin panel will run (Chromium-based internal tool).

**No package needed.** Implement as a shared utility at `src/lib/utils/currency.ts`.

---

### Notifications / Toast

**Recommendation: `svelte-sonner` — Svelte 5 native, Tailwind-compatible, imperative API.**

| Library | Version | Purpose |
|---------|---------|---------|
| `svelte-sonner` | ^1.x | Toast notifications for success/error/loading states |

**Rationale:**
- `svelte-sonner` v1.0+ was refactored to use Svelte 5 runes and snippets. The API is imperative (`toast.success('...')`) which fits the use pattern: call from repository methods or page event handlers after API responses.
- Tailwind-compatible out of the box — no CSS conflicts with Tailwind v4.
- It is the toast implementation that shadcn-svelte recommends and vendors, so it aligns with the bits-ui + shadcn-svelte ecosystem already chosen.
- Supports promise-based toasts (`toast.promise(apiCall, { loading: '...', success: '...', error: '...' })`), which maps directly to the Either<Failure, T> pattern: resolve on Right, reject on Left.

```bash
npm install svelte-sonner
```

**Setup:** Mount `<Toaster />` once in `AdminLayout.svelte`.

---

### Dialogs / Modals

**Recommendation: Native HTML `<dialog>` element with a thin Svelte wrapper. Use `bits-ui` Dialog for complex accessible cases.**

**Pattern A — Simple confirm dialogs** (destructive actions: suspend merchant, delete fee rule):

Use the native `<dialog>` element driven by `$state`. No library needed. The native `<dialog>` handles focus trapping and `Escape` key natively since all modern browsers support it.

```svelte
<!-- ConfirmDialog.svelte -->
<script lang="ts">
  let { open = $bindable(false), onconfirm, title, message } = $props();
  let dialogEl: HTMLDialogElement;
  $effect(() => { open ? dialogEl?.showModal() : dialogEl?.close(); });
</script>
<dialog bind:this={dialogEl} class="...">
  <h2>{title}</h2>
  <p>{message}</p>
  <button onclick={() => { onconfirm(); open = false; }}>Confirm</button>
  <button onclick={() => open = false}>Cancel</button>
</dialog>
```

**Pattern B — Rich content dialogs** (KYC document review, dispute resolution form inside modal):

Use `bits-ui` `Dialog` component (already a dependency for date pickers). Provides WAI-ARIA `role="dialog"`, `aria-modal`, focus trap, and scroll lock without custom JavaScript.

**Why not Melt UI directly:** Bits UI wraps Melt UI with a Component API that is less verbose. For this admin panel, Bits UI is the right level of abstraction.

**No additional packages needed** beyond `bits-ui` already listed under Date Pickers.

---

## Anti-Recommendations

| Library | Reason to Avoid |
|---------|----------------|
| `@tanstack/svelte-table` | Uses `svelte/internal` — **broken with Svelte 5**. Use `@tanstack/table-core` directly instead. |
| `svelte-chartjs` (original, SauravKanchan) | Abandoned, Svelte 4 only. Use `svelte5-chartjs` fork. |
| `@carbon/charts-svelte` | Pulls in IBM Carbon design tokens. Style conflicts with Tailwind. Overkill for this project. |
| `Highcharts` | Commercial license required. |
| `svelte-headless-table` (bryanmylee) | Svelte 4 stores API, not runes-compatible. Limited maintenance. |
| `@svelte-plugins/datepicker` | No range picker in the main package. Limited TypeScript types. |
| `beyond/svelte-datepicker` | Requires special dayjs packaging workarounds in SvelteKit. Low maintenance. |
| `dinero.js` / `currency.js` | No benefit over `Intl.NumberFormat` for a display-only use case. Adds bundle weight. |
| Flowbite Svelte | Ships its own component system that conflicts with a custom Tailwind v4 design. Use bits-ui + shadcn-svelte patterns instead. |
| Commercial PDF SDKs (Nutrient, Syncfusion) | Licensing cost, server-side processing dependencies, unnecessary for read-only KYC review. |
| `svelte-french-toast` | Svelte 4 only. Not maintained for Svelte 5 runes. |

---

## Full Install Command

```bash
npm install \
  @tanstack/table-core \
  chart.js svelte5-chartjs lightweight-charts \
  sveltekit-superforms zod formsnap \
  bits-ui @internationalized/date \
  pdfjs-dist \
  jwt-decode \
  svelte-sonner
```

**No extra install for:** currency formatting (Intl), modals (native dialog + bits-ui already included), icons (lucide-svelte already installed).

---

## Confidence Levels

| Area | Confidence | Source / Notes |
|------|-----------|---------------|
| Data Tables (TanStack core + Svelte 5 adapter) | HIGH | Official TanStack docs confirm core is framework-agnostic; Svelte 5 adapter pattern verified at jamesoclaire.com and walker-tx/svelte5-tanstack-table-examples |
| Charts (chart.js + svelte5-chartjs + lightweight-charts) | HIGH | svelte5-chartjs confirmed as explicit Svelte 5 fork; lightweight-charts + Svelte wrapper confirmed active at trash-and-fire/svelte-lightweight-charts |
| Forms (superforms + zod + formsnap) | HIGH | Superforms v2 Svelte 5 compatibility confirmed in GitHub releases; formsnap is the official companion used by shadcn-svelte |
| Date Pickers (bits-ui) | HIGH | bits-ui.com/docs/components/date-range-picker confirmed for Svelte 5; `next.bits-ui.com` shows active Svelte 5 development |
| KYC Preview (pdfjs-dist) | HIGH | Mozilla-maintained, 42k stars, no Svelte-specific concerns, works with onMount |
| JWT Decoding (jwt-decode v4) | HIGH | npm page and Auth0 GitHub confirm v4 is stable, named export, full ESM, TypeScript |
| Currency Formatting (Intl.NumberFormat) | HIGH | Native browser API, pt-BR + BRL verified in MDN and multiple Brazilian developer sources |
| Toast (svelte-sonner) | HIGH | v1.x release confirmed Svelte 5 runes/snippets refactor; listed as official toast option in shadcn-svelte docs |
| Dialogs (native dialog + bits-ui) | HIGH | Native HTML dialog has full browser support; bits-ui Dialog component documented for Svelte 5 |

---

## Sources

- [TanStack Table — Svelte Docs](https://tanstack.com/table/latest/docs/framework/svelte/svelte-table)
- [Easiest way to get TanStack Table v8 working with Svelte 5](https://jamesoclaire.com/2025/04/09/easiest-way-to-get-tanstack-table-v8-working-with-svelte-5/)
- [walker-tx/svelte5-tanstack-table-examples](https://github.com/walker-tx/svelte5-tanstack-table-examples)
- [shadcn-svelte Data Table](https://www.shadcn-svelte.com/docs/components/data-table)
- [svelte5-chartjs GitHub](https://github.com/LupusAI/svelte5-chartjs)
- [trash-and-fire/svelte-lightweight-charts](https://github.com/trash-and-fire/svelte-lightweight-charts)
- [TradingView lightweight-charts](https://tradingview.github.io/lightweight-charts/docs)
- [Superforms — SvelteKit](https://superforms.rocks/)
- [sveltekit-superforms GitHub Releases](https://github.com/ciscoheat/sveltekit-superforms/releases)
- [Bits UI — Date Range Picker](https://bits-ui.com/docs/components/date-range-picker)
- [Bits UI — Date Picker](https://bits-ui.com/docs/components/date-picker)
- [shadcn-svelte Date Picker](https://www.shadcn-svelte.com/docs/components/date-picker)
- [pdf.js GitHub (Mozilla)](https://github.com/mozilla/pdf.js/)
- [jwt-decode npm](https://www.npmjs.com/package/jwt-decode)
- [jwt-decode GitHub (Auth0)](https://github.com/auth0/jwt-decode)
- [svelte-sonner GitHub](https://github.com/wobsoriano/svelte-sonner)
- [svelte-sonner — shadcn-svelte docs](https://www.shadcn-svelte.com/docs/components/sonner)
- [Bits UI — Dialog](https://bits-ui.com/docs/components/dialog)
- [Formatting BRL with Intl.NumberFormat — DEV Community](https://dev.to/vitorfreitas/formatting-currencies-with-intl-numberformat-jhg)
- [Best Chart Libraries for Svelte 2026 — Weavelinx](https://weavelinx.com/best-chart-libraries-for-svelte-projects-in-2026/)
