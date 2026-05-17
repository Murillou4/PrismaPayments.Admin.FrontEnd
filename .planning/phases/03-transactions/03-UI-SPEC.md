---
phase: 3
slug: transactions
status: draft
shadcn_initialized: true
preset: new-york
created: 2026-04-07
---

# Phase 3 — UI Design Contract

> Visual and interaction contract for the Transactions phase: cross-merchant payment and withdrawal lists with filters, detail pages with conditional method rendering, sidebar collapsible submenu, breadcrumbs, and merchant autocomplete.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn-svelte 1.2.3 (nova style, "new-york" label) |
| Preset | new-york, baseColor zinc |
| Component library | bits-ui ^2.16.3 |
| Icon library | lucide-svelte ^0.475.0 |
| Font (display) | Space Grotesk |
| Font (body/UI) | Outfit |
| Font (mono) | Outfit (monospace alias) |

### shadcn Components Required (not yet installed)

| Component | Install Command | Purpose |
|-----------|----------------|---------|
| Popover | `npx shadcn-svelte@latest add popover` | DateRangePicker wrapper (D-17) |
| Range Calendar | `npx shadcn-svelte@latest add range-calendar` | Date range selection (D-17) |

### shadcn Components Already Installed

Button, Badge, Input, Select, Dialog, Table, Tabs, Calendar, Sheet, Skeleton, Tooltip, Dropdown Menu, Avatar, Separator.

---

## Spacing Scale

Declared values (base 4px, from StyleGuide.md):

| Token | Value | Usage in this phase |
|-------|-------|---------------------|
| xs | 4px | Icon-label gaps in table cells, inline padding in badges |
| sm | 8px | Gap between filter controls, icon-label spacing in sidebar sub-items |
| md | 16px | Default gap between filter row items, table cell padding, input padding |
| lg | 24px | Card padding in detail pages, section padding in filter bar |
| xl | 32px | Gap between stacked detail cards |
| 2xl | 48px | Page-level vertical padding (list pages) |
| 3xl | 64px | Not used in this phase |

Exceptions:
- Sidebar sub-item left indent: 40px (padding-left for nested nav items under collapsible "Transacoes" group)
- DateRangePicker popover internal padding: 12px (compact calendar layout)

---

## Typography

All values from StyleGuide.md. This phase uses 4 sizes and 2 weights:

| Role | Size | Weight | Line Height | Font | Usage |
|------|------|--------|-------------|------|-------|
| Caption | 12px | 400 (Regular) | 1.50 | Outfit | Table cell secondary text (truncated IDs, dates), badge labels, breadcrumb separator |
| Body | 14px | 400 (Regular) | 1.55 | Outfit | Table cell primary text, filter labels, detail card field values, detail card field names, sidebar sub-items |
| Label | 16px | 400 (Regular) | 1.60 | Outfit | Filter section labels, empty state body text |
| Heading | 20px | 600 (Semibold) | 1.40 | Space Grotesk | Page titles ("Pagamentos", "Saques"), detail card section headings, breadcrumb current page |

Weight rationale: Two weights provide sufficient hierarchy -- size differentiation (12/14/16/20) handles role distinction, while the single weight jump from 400 to 600 marks headings as the clear emphasis level. Former Medium (500) usages merged into Regular (400) with no loss of visual hierarchy since those elements already differ by size.

---

## Color

All values from StyleGuide.md CSS variables already in `app.css`.

| Role | Value | CSS Variable | Usage |
|------|-------|-------------|-------|
| Dominant (60%) | #070707 | `--color-background` | Page background, list page canvas |
| Secondary (30%) | #0F0F18 | `--color-surface` | Detail cards, filter bar background, sidebar submenu area, table rows |
| Accent (10%) | #01FAFB | `--color-brand-cyan` | Merchant name links in table, breadcrumb links, "Ver todas" cross-nav link, copy button hover, active sidebar sub-item indicator |
| Primary action | #FF00FF | `--color-brand-magenta` | Not used as CTA in this phase (no write actions). Reserved for sidebar active glow only. |
| Destructive | #FF3B5C | `--destructive` | Not used in this phase (no destructive actions) |

### StatusBadge Colors for This Phase

| Status | Color | Background | Semantic |
|--------|-------|-----------|----------|
| CREATED | #FFB300 | rgba(255,179,0,0.10) | Warning/pending |
| PENDING | #FFB300 | rgba(255,179,0,0.10) | Warning/pending |
| PAID | #00E676 | rgba(0,230,118,0.10) | Success |
| COMPLETED | #00E676 | rgba(0,230,118,0.10) | Success |
| PROCESSING | #01FAFB | rgba(1,250,251,0.10) | Info/in-progress |
| REQUESTED | #FFB300 | rgba(255,179,0,0.10) | Warning/pending |
| FAILED | #FF3B5C | rgba(255,59,92,0.10) | Destructive |
| CANCELLED | #9090A8 | rgba(144,144,168,0.10) | Neutral/inactive |
| REFUNDED | #FFB300 | rgba(255,179,0,0.10) | Warning |
| EXPIRED | #9090A8 | rgba(144,144,168,0.10) | Neutral/inactive |

### Method Badge Colors

| Method | Color | Background |
|--------|-------|-----------|
| PIX | #01FAFB | rgba(1,250,251,0.10) |
| BOLETO | #FFB300 | rgba(255,179,0,0.10) |
| CREDIT_CARD | #FF00FF | rgba(255,0,255,0.10) |
| DEBIT_CARD | #722283 | rgba(114,34,131,0.10) |

---

## Copywriting Contract

| Element | Copy (pt-BR) |
|---------|-------------|
| Page title — Payments list | "Pagamentos" |
| Page title — Withdrawals list | "Saques" |
| Page title — Payment detail | "Pagamento #[id-truncado]" |
| Page title — Withdrawal detail | "Saque #[id-truncado]" |
| Empty state heading — Payments | "Nenhum pagamento encontrado" |
| Empty state body — Payments | "Ajuste os filtros acima ou aguarde novas transacoes." |
| Empty state heading — Withdrawals | "Nenhum saque encontrado" |
| Empty state body — Withdrawals | "Ajuste os filtros acima ou aguarde novas solicitacoes." |
| Error state — List load failure | "Erro ao carregar dados. Verifique sua conexao e tente novamente." |
| Error state — Detail load failure | "Nao foi possivel carregar os detalhes. Volte para a lista e tente novamente." |
| Filter label — Merchant | "Merchant" |
| Filter label — Status | "Status" |
| Filter label — Method | "Metodo" |
| Filter label — Period | "Periodo" |
| Filter placeholder — Merchant autocomplete | "Buscar merchant..." |
| Filter reset option — All selects | "Todos" |
| Date preset — Today | "Hoje" |
| Date preset — 7 days | "7 dias" |
| Date preset — 30 days | "30 dias" |
| Date preset — This month | "Este mes" |
| Date preset — Custom | "Personalizado" |
| Breadcrumb root | "Transacoes" |
| Breadcrumb — Payments | "Pagamentos" |
| Breadcrumb — Withdrawals | "Saques" |
| Sidebar group label | "Transacoes" |
| Sidebar sub-item 1 | "Pagamentos" |
| Sidebar sub-item 2 | "Saques" |
| Detail card — General info | "Informacoes Gerais" |
| Detail card — Method details | "Detalhes do Metodo" |
| Detail card — Payer | "Pagador" |
| Detail card — Metadata | "Metadata" |
| Detail card — Recipient | "Destinatario" |
| PIX — QR code label | "Codigo PIX" |
| PIX — Copy button | "Copiar" |
| PIX — Copy success toast | "Codigo PIX copiado" |
| Boleto — Barcode label | "Codigo de barras" |
| Boleto — Link label | "Ver boleto" |
| Boleto — Due date label | "Vencimento" |
| Card — Last digits label | "Cartao" |
| Card — Installments label | "Parcelas" |
| Merchant link — Tooltip | "Ver merchant" |
| Cross-nav — "Ver todas" link | "Ver todas as transacoes" |
| Loading skeleton — Table | 5 skeleton rows with pulse animation |
| Destructive confirmation | Not applicable — no destructive actions in this phase |

---

## Component Inventory

### New Components to Build

| Component | Location | Reusable? | Description |
|-----------|----------|-----------|-------------|
| MerchantAutocomplete | `src/app/features/transactions/shared/components/MerchantAutocomplete.svelte` | Yes (Disputes, Fees) | Select with search input, debounce 300ms, min 2 chars, fetches merchant list via API |
| DateRangePicker | `src/app/shared/widgets/filters/DateRangePicker.svelte` | Yes (all future phases) | shadcn Popover + RangeCalendar with preset buttons (Hoje, 7 dias, 30 dias, Este mes) |
| Breadcrumbs | `src/app/shared/widgets/Breadcrumbs.svelte` | Yes (all detail pages) | Generic breadcrumb with typed segments array: `{ label: string; href?: string }[]` |
| PaymentMethodCard | `src/app/features/transactions/payments/presentation/components/PaymentMethodCard.svelte` | No | Conditional PIX/Boleto/Card rendering based on payment.method |
| PaymentMethodBadge | Inline in cellSnippet | No | Colored badge for PIX/BOLETO/CREDIT_CARD/DEBIT_CARD in table column |

### Existing Components to Reuse

| Component | Modifications Needed |
|-----------|---------------------|
| DataTable | None — use with new ColumnDef arrays |
| StatusBadge | Add new status mappings (CREATED, PAID, FAILED, CANCELLED, REFUNDED, EXPIRED, REQUESTED, PROCESSING, COMPLETED) |
| SelectFilter | None — reuse for status and method dropdowns |
| SearchInput | None — reuse if needed |
| Pagination | None — reuse for server-side page controls |
| AdminLayout sidebar | Add collapsible "Transacoes" submenu with chevron toggle and sub-items |

---

## Interaction Contracts

### List Pages (Payments + Withdrawals)

| Interaction | Behavior |
|-------------|----------|
| Page load | Show 5-row skeleton table while loading. Fetch page 1 with limit 20. |
| Filter change (status, method) | Reset to page 1, trigger new API call immediately |
| Filter change (merchant autocomplete) | Debounce 300ms, min 2 chars before search. On select, reset to page 1, trigger API call. On clear, remove merchantId filter. |
| Filter change (date range) | Apply client-side filter to current page data (D-19). Do NOT trigger new API call. |
| Pagination | Prev/Next buttons below table. Trigger new API call with updated skip. |
| Row click — Merchant column | Navigate to `/merchants/{merchantId}` |
| Row click — ID column | Navigate to detail page `/transactions/payments/{id}` or `/transactions/withdrawals/{id}` |
| Empty results | Show empty state card centered in table area |
| API error | Show error toast via svelte-sonner + inline error message in table area |

### Detail Pages (Payment + Withdrawal)

| Interaction | Behavior |
|-------------|----------|
| Page load | Fetch single record by ID. Show skeleton cards while loading. |
| Breadcrumb click | Navigate to parent list page |
| Copy PIX code | Copy to clipboard, show success toast "Codigo PIX copiado" |
| Boleto link click | Open boletoUrl in new tab (`target="_blank"`) |
| Merchant ID link (in detail) | Navigate to `/merchants/{merchantId}` |
| API error / 404 | Show error card with "Volte para a lista" link |

### Sidebar Submenu

| Interaction | Behavior |
|-------------|----------|
| Click "Transacoes" group | Toggle submenu open/close with chevron rotation (180deg) |
| Navigate to any /transactions/* route | Auto-expand submenu, highlight active sub-item |
| Active sub-item style | Same glow pattern as other active sidebar items, applied to sub-item |

### DateRangePicker

| Interaction | Behavior |
|-------------|----------|
| Click trigger button | Open popover with RangeCalendar and preset buttons on left |
| Select preset (Hoje, 7 dias, etc.) | Apply date range immediately, close popover |
| Select custom range | User picks start date, then end date on calendar. Apply on second click. |
| Clear | Remove date filter, show all results |

---

## Layout Specifications

### Focal Points

| Screen Type | Focal Point | Rationale |
|-------------|-------------|-----------|
| List pages (Payments, Withdrawals) | DataTable occupying the full content width below the filter bar | The table is the primary data surface; page title and filters serve as navigation context above it. User's eye enters at the page title then drops to the first data row. |
| Detail pages (Payment, Withdrawal) | "Informacoes Gerais" card — the first and largest card in the stacked layout | Contains status badge, monetary values, and key identifiers. All other cards (Method, Payer, Metadata, Recipient) are supplementary detail expanding from this anchor. |

### List Page Layout

```
+----------------------------------------------------------+
| [Page Title: "Pagamentos"]                               |
|                                                          |
| [Merchant v] [Status v] [Metodo v] [Periodo v]          |  <- filter bar, 8px gap between
|                                                          |
| +------------------------------------------------------+ |
| | ID  | Merchant | Metodo | Status | Valor | Taxa | ...| |  <- DataTable
| | ... | ...      | ...    | ...    | ...   | ...  | ...| |
| +------------------------------------------------------+ |
|                                                          |
| [< Anterior]                          [Proximo >]        |  <- Pagination
+----------------------------------------------------------+
```

- Filter bar: flex-wrap, 8px gap, 24px padding below page title, 16px padding below filters to table
- Table: full width, 16px cell padding horizontal, 12px cell vertical
- Pagination: flex justify-between, 16px above

### Detail Page Layout

```
+----------------------------------------------------------+
| Transacoes > Pagamentos > #abc12345                      |  <- Breadcrumbs
|                                                          |
| Pagamento #abc12345                                      |  <- h5 heading
|                                                          |
| +------------------------------------------------------+ |
| | Informacoes Gerais                                    | |  <- Card (surface bg)
| | Status: [StatusBadge]  Metodo: [Badge]                | |
| | Valor: R$ 150,00   Taxa: R$ 3,00   Liquido: R$ 147   | |
| | Criado em: 07/04/2026 14:30   Pago em: ...            | |
| +------------------------------------------------------+ |
|                                                32px gap   |
| +------------------------------------------------------+ |
| | Detalhes do Metodo                                    | |  <- Conditional card
| | [PIX: codigo copiavel] OR [Boleto: barcode+link]      | |
| | OR [Cartao: **** 1234 Visa 3x]                        | |
| +------------------------------------------------------+ |
|                                                32px gap   |
| +------------------------------------------------------+ |
| | Pagador                                               | |
| | Nome: ...  Documento: ...  Email: ...  Telefone: ...  | |
| +------------------------------------------------------+ |
|                                                32px gap   |
| +------------------------------------------------------+ |
| | Metadata                                              | |
| | key: value (rendered as key-value pairs)              | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

- Cards: `--color-surface` background, 24px padding, 16px border-radius, `--shadow-md` shadow, `--border-default` border
- Card heading: 16px Outfit regular 400, `--color-foreground`
- Card field labels: 14px Outfit regular 400, `--color-foreground-secondary`
- Card field values: 14px Outfit regular 400, `--color-foreground`
- Gap between cards: 32px
- Page padding: 48px top, 24px sides

---

## ID and Key Truncation

| Field | Display | Full value |
|-------|---------|-----------|
| Payment/Withdrawal ID (table) | First 8 characters | Tooltip on hover with full ID |
| Payment/Withdrawal ID (detail page title) | First 8 characters | Full ID shown in "Informacoes Gerais" card |
| Merchant ID (table link) | First 8 characters | Link navigates to merchant detail |
| PIX key (withdrawal table) | First 12 characters + "..." | Full value on detail page |
| PIX QR code (payment detail) | Full value in scrollable `<code>` block | Copy button copies full value |
| Boleto barcode (payment detail) | Full value in scrollable `<code>` block | - |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn-svelte official | popover, range-calendar | not required (official registry) |
| Third-party | none | not applicable |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
