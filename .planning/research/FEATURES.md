# Features Research — Payment Admin Panel

**Domain:** Internal back-office panel for a Brazilian payment platform (PIX, Boleto, Cards)
**Researched:** 2026-03-24
**Sources:** Project documentation (`FRONTEND_ADMIN_DOC.md`), `PROJECT.md`, established payment industry patterns

---

## Table Stakes (must-have)

Features that are non-negotiable — their absence makes the panel unusable for operations.

| Feature | Why Non-Negotiable |
|---------|-------------------|
| **Dashboard with global metrics** | Operations team needs an instant snapshot: volume, active merchants, open disputes, pending KYC. A blank first screen signals an untrustworthy panel. |
| **Merchant list with status/verification filters** | The panel's central object is a merchant. Without a filterable, paginated list, every task starts blind. Filters by `status` (PENDING/ACTIVE/SUSPENDED/BLOCKED) and `verificationStatus` (PENDING_REVIEW, etc.) are daily-use operations. |
| **Merchant detail page** | A single source-of-truth page for a merchant: identity, status, KYC docs, balance, settings, credentials, and recent transactions. Separate pages per sub-concern cause constant context-switching. |
| **Merchant status transitions with reason** | Approve, suspend, block, unblock — each backed by a mandatory `reason` field that goes to the audit log. Missing reason makes the audit trail useless. |
| **KYC document review (approve/reject)** | The platform's compliance gatekeeping function. Without it, merchant onboarding is blocked entirely. |
| **Cross-merchant transaction list (payments + withdrawals)** | Ops/support agents need to find any transaction across the entire platform. Merchant-siloed views are insufficient for admin work. |
| **Dispute resolution workflow** | Chargebacks and MEDs are time-sensitive. A way to list open disputes, view the linked payment, and record a resolution is the minimum for compliance. |
| **Fee rules CRUD** | Platform revenue depends on fee rules. Admins must be able to create, edit, activate/deactivate, and delete global and per-merchant fee rules. |
| **Fee simulator** | Before applying a rule, ops must verify what a merchant would actually be charged. A simulator prevents accidental revenue configuration errors. |
| **Admin user management (SUPER_ADMIN only)** | Creating, updating, and soft-deleting admin accounts with role assignment. Without this, admin provisioning is a backend operation. |
| **Audit log viewer** | Regulatory and operational necessity. Every sensitive action (KYC review, status change, fee creation, dispute resolution) must be traceable to a specific admin at a specific time. |
| **Payment provider status cards** | Read-only view of which payment providers are active and which payment methods each supports. Essential for diagnosing outages. |
| **HTTP diagnostics log** | The primary debugging surface for integration issues. Filtering by path, status code, merchant, trace ID, and error presence is standard for payment ops teams. |
| **Platform config snapshot** | Read-only view of current platform configuration. Useful for ops to confirm env-level settings without backend access. |
| **RBAC-enforced UI** | Buttons, routes, and entire sidebar sections must be hidden or disabled based on the JWT role. VIEWER must never see an "Approve" button. Role leakage in the UI undermines the security model. |

---

## UX Patterns by Feature

### Merchant Management

**List page pattern:**
- Full-width data table: columns = Legal Name, Document (CPF/CNPJ), Email, Status badge, Verification badge, Created date.
- Quick-filter tabs above the table: "All / Pending / Active / Suspended / Blocked" — these drive the `status` query param.
- Secondary filter bar (collapsible): verification status dropdown, free-text search on name/document/email.
- Each row links to the merchant detail page. Row-level status badge uses the color system from the enums doc (yellow = PENDING, green = ACTIVE, orange = SUSPENDED, red = BLOCKED).
- Pagination controls at the bottom, page size selector (25/50/100).

**Detail page pattern:**
- Tab-based layout within the detail page. Tabs: Info, KYC / Verification, Balance, Settings, Transactions, API Credentials.
- "Info" tab shows the immutable identity data. Status is shown as a badge + action button cluster beside it ("Suspend", "Block", "Activate") — rendered based on current status and caller's role.
- Status action opens a confirmation dialog with a required `reason` textarea and an explicit confirm button. The dialog text names the transition (e.g., "Suspending this merchant will immediately prevent them from processing payments. Enter a reason:").
- "Transactions" tab is a mini-table of recent payments and withdrawals with a "View all" link that deep-links into the transactions list pre-filtered for this merchant.

**Merchant creation form (ADMIN+):**
- Single-page form, not a wizard — the data set is small (name, document, email, phone, password, initial status, initial verification status).
- Inline validation. The `documentType` field determines the mask applied to `documentNumber` (CPF = 11 digits, CNPJ = 14 digits).
- Confirm before submit if initial status is ACTIVE or verification is VERIFIED — these bypass the normal onboarding flow.

---

### KYC Review Flow

**Entry point — Pending Verification queue:**
- A dedicated sidebar entry "Pending Verification" that navigates to the merchant list pre-filtered to `verification=PENDING_REVIEW`. This is a workflow entry point, not just a filter shortcut — it signals prioritization to the support agent.
- Count badge on the sidebar item showing the number of pending reviews updates from the dashboard data on load.

**Review UX within merchant detail:**
- "KYC / Verification" tab shows the current `verificationStatus` badge prominently at top.
- Document gallery: each uploaded document is a clickable card showing the document type label (e.g., "Selfie with document", "Proof of Address") and a thumbnail or file icon for PDFs. Document types: `IDENTITY_FRONT`, `IDENTITY_BACK`, `SELFIE`, `PROOF_OF_ADDRESS`, `ARTICLES_OF_INCORPORATION`, `OTHER`.
- Clicking a document opens a modal with a full-size preview (image) or an embedded PDF viewer. The modal has "Download" and "Close" actions.
- Approve/Reject action buttons appear below the document gallery only when `verificationStatus === "PENDING_REVIEW"` and the caller has SUPPORT+ role.
- "Approve" is the primary action (green). "Reject" is the destructive action (red outline).
- Both actions open a confirmation dialog with a `notes` textarea (optional for approval, strongly recommended for rejection — label the rejection path "Rejection reason (shown to merchant)").
- After submission, the tab reflects the new status immediately (optimistic update or re-fetch). No page reload.

**Key UX principle:** Never let the reviewer take an action without seeing at least one document. If no documents have been uploaded, replace the action buttons with an informational banner: "No documents submitted yet. Review will be available once the merchant uploads their documents."

---

### Transaction Monitoring

**Payments list (cross-merchant):**
- Columns: ID (truncated, copyable), Merchant (linked), Method badge (PIX/Boleto/Card), Amount (formatted in BRL), Fee Amount, Net Amount, Status badge, Created date.
- Filter bar: Merchant (searchable dropdown), Status (multi-select), Method (multi-select), Date range picker (from/to), Test transactions toggle (`isTest`).
- The Merchant filter is the highest-value filter — ops agents almost always start with "find all transactions for merchant X".
- `isTest` filter defaults to hiding test transactions. This is critical: production ops views should not be polluted by sandbox data by default.
- Status badges follow the color map from the enums doc.

**Withdrawals list (cross-merchant):**
- Separate tab or sub-route (`/transactions/withdrawals`). Same pattern as payments but columns adapt: Recipient PIX Key, Provider Name instead of Method.
- Status values differ: REQUESTED/PROCESSING/COMPLETED/FAILED/CANCELLED.

**Transaction detail:**
- Shows full `PaymentResponse` or `WithdrawalResponse` fields in a structured layout (not raw JSON).
- Payment method-specific section: PIX shows QR code image + copy button for EMV code. Boleto shows barcode + due date. Card shows last 4 digits + brand + installments.
- Payer section with masked document.
- Failure reason displayed prominently when `status === "FAILED"` or `"CANCELLED"`.
- Deep link to the merchant detail page (Merchant ID is always visible to admin, unlike seller view).

**Cross-merchant pattern:** The column "Merchant" appears in every transaction table and is always a clickable link to the merchant detail. This is the core navigation pattern that makes cross-merchant monitoring usable — every transaction is one click away from its owner.

---

### Dispute Resolution

**List page pattern:**
- Columns: ID (truncated), Merchant (linked), Type badge (MED / CHARGEBACK / REFUND_REQUEST), Amount (BRL), Status badge, Opened date.
- Default sort: newest first. Default filter: OPEN disputes only (ops should see actionable items first).
- Tab-based status filter: "Open / Under Review / All / Resolved" — not all statuses need equal prominence.
- Color coding: OPEN = red (urgent), UNDER_REVIEW = yellow (in progress), ACCEPTED/REJECTED/RESOLVED = neutral.

**Dispute detail / resolution panel:**
- Opens as a side panel (drawer) from the list, or as a separate page — side panel preferred because agents often need to context-switch between disputes without losing their list position.
- Panel layout: at top, linked payment info (ID, merchant, amount, payment status) with a link to the full payment detail. Below, dispute metadata (type, opened date, external ID if any).
- **Timeline** (required): A vertical timeline showing state transitions: Opened → Under Review → Resolved/Accepted/Rejected. Each node shows the date and actor where available. This is the visual anchor that prevents agents from losing track of what stage a dispute is at.
- **Resolution form:** Only visible when `status === "OPEN"` or `"UNDER_REVIEW"` and caller has SUPPORT+ role. Fields: Status dropdown (ACCEPTED / REJECTED / RESOLVED — never back to OPEN) + Resolution textarea (required). Submit button is disabled until both fields have values.
- After resolution: status badge updates, timeline adds the resolution node, form is replaced with a read-only resolution block.

**Brazilian context:** The `MED` (Mecanismo Especial de Devolução) type is PIX-specific fraud reversal. Its presence means the platform handles Central Bank dispute flows — this dispute type may have regulatory time windows. Consider adding an "opened X days ago" indicator to surface aging disputes.

---

### Fee Configuration

**Rules list layout:**
- Two sections on the same page: "Global Rules" (merchantId = null) and "Merchant-Specific Rules" (merchantId set).
- Global rules section is a compact read-and-edit table: columns = Fee Type, Calculation, Rate (formatted), Fixed Amount, Min Fee, Max Fee, Active toggle.
- Merchant-specific section has a Merchant filter (searchable dropdown) that loads rules for a specific merchant via `GET /api/v1/fees/merchants/{merchantId}/rules`.
- Active toggle directly calls PUT without a confirmation dialog — low-stakes toggle. Creating or deleting a rule requires confirmation.

**Rule form (create / edit):**
- Stepped inputs that become visible based on prior selections reduce cognitive load:
  1. Fee Type dropdown (PIX / Boleto / Credit Card / Debit Card / Withdrawal / Anticipation)
  2. Calculation type dropdown (Percentage / Fixed / Percentage + Fixed)
  3. Based on calculation type: show Rate input (displayed as %, stored as basis points — conversion note in the field: "250 basis points = 2.50%") and/or Fixed Amount input (displayed as R$, stored as centavos).
  4. Optional: Min Fee (R$), Max Fee (R$) inputs — show as a collapsible "Advanced" section.
  5. Merchant selector: "Global rule" (default, null merchantId) or specific merchant (searchable dropdown).
- Inline preview: below the form, show "Example: for a R$ 100.00 transaction, the fee would be R$ X.XX" — computed client-side from entered values without hitting the API.

**Fee simulator (sidebar or inline panel):**
- Persistent panel beside the rules list, not a separate page. Agents compare rules and simulate without context switching.
- Inputs: Fee Type, Amount (R$), Merchant (optional, null = global rule).
- Output: Gross Amount / Fee Amount / Net Amount, plus Rule ID applied and Calculation type used.
- Submit on input change (debounced, ~500ms) for interactive feel — not a submit button that requires clicking.
- Display the `ruleId` as a link to the specific rule that was applied — closes the loop between simulation and rule management.

---

### Admin User Management

**Access control:** The entire feature is only rendered for SUPER_ADMIN. Other roles see nothing — not a disabled menu, just no entry in the sidebar.

**List page:**
- Columns: Name, Email, Role badge, Active status, Created date.
- Role badges are color-coded: SUPER_ADMIN = purple, ADMIN = blue, SUPPORT = teal, VIEWER = gray.
- Active status uses a toggle that directly calls PATCH to activate/deactivate (with confirmation for deactivation).
- "You" indicator on the current user's row — and the deactivation toggle for the current user's row is always disabled (cannot deactivate self, per API spec).

**Create admin modal:**
- Modal (not a page) with fields: Name, Email, Password, Role dropdown.
- Role dropdown should not offer roles above the current user's role — a SUPER_ADMIN creating another SUPER_ADMIN is valid, but this is an edge case to consider.
- Password field with show/hide toggle.

**Edit admin:**
- Inline row expansion or small modal with editable Name and Role. `isActive` is the toggle on the list row itself.
- Do not expose the password edit path — password reset is a backend operation.

**Key principle:** Soft delete only. The DELETE endpoint marks `isActive: false`. The UI should not say "Delete user" — say "Deactivate account". This is both accurate and less alarming for admin users reviewing their own user management screen.

---

### Audit Log

**List page — timeline/table hybrid:**
- Default view: reverse-chronological table. Columns: Timestamp, Actor (name/email + type badge: ADMIN/MERCHANT/SYSTEM), Action label (human-readable, e.g., "Updated merchant status"), Resource Type + ID (linked to the affected resource), IP Address.
- Action labels must be translated from the raw action codes to human-readable strings: `UPDATE_MERCHANT_STATUS` → "Merchant status updated", `REVIEW_MERCHANT_VERIFICATION` → "KYC review completed", etc.
- Filter bar: Actor (dropdown of admin users), Action (dropdown of known action types), Resource Type (dropdown), Date range picker, IP address (text input).
- The ability to filter by actor is the most common ops use case ("what did admin X do last Tuesday?").

**Diff view (expand row):**
- Clicking a row expands it inline (accordion) to show the `changes.before` and `changes.after` objects.
- Render these as a side-by-side or stacked diff view: left column = before, right column = after. Highlight changed fields in amber/yellow — fields that are the same are muted gray.
- For null-to-value transitions (creation) or value-to-null transitions (deletion), show "—" on the empty side.
- Do not render raw JSON. Parse the objects and render each key-value pair as a labeled row. Example: `status: "PENDING" → "ACTIVE"`.
- If `changes` is null (the action was read-only or had no state change), show "No data changes recorded" in the expanded area.

**Resource links:**
- `resourceType: "MERCHANT"` + `resourceId` → link to `/merchants/{id}`
- `resourceType: "PAYMENT"` → link to `/transactions/payments/{id}`
- `resourceType: "DISPUTE"` → link to `/disputes/{id}`
- etc.
- These links turn the audit log into an operational investigation tool, not just a compliance ledger.

**Pagination:** Audit logs grow fast. Default page size 50. Always server-side pagination — never load all records into memory.

---

## Differentiators (nice-to-have)

Features that elevate the panel beyond baseline compliance, but are not required for v1 operation.

| Feature | Value Proposition | Complexity |
|---------|-------------------|------------|
| **Dashboard KPI period selector** | Toggle the dashboard metrics between "Today / 7 days / 30 days" without a full reload. The current API returns fixed metrics; this would require date-range params or client-side aggregation from transaction data. | Medium |
| **Pending approvals widget on dashboard** | A live count of merchants in `PENDING_REVIEW` KYC status, rendered as a prominent alert card on the dashboard with a direct link to the pending verification queue. Surfaces urgent work immediately. | Low |
| **Merchant-scoped fee override indicator** | In the merchant detail page, show a visual indicator when a merchant has custom fee rules that differ from the global defaults. Prevents support agents from quoting incorrect fees to merchants. | Low |
| **Dispute aging indicator** | In the disputes list, highlight disputes that have been OPEN for more than N days (configurable). Brazilian MED disputes have regulatory deadlines — surfacing aging items prevents compliance failures. | Low |
| **Trace view in diagnostics** | Grouping all HTTP log entries by `traceId` into a sequential timeline for a single request. This turns the diagnostics from a raw log into a distributed tracing tool — useful for debugging PIX payment flows that span multiple provider calls. | Medium |
| **Copy-to-clipboard on all IDs** | Transaction IDs, Trace IDs, Merchant IDs, and PIX QR codes should have a one-click copy button. Payment support calls are often resolved by pasting IDs into chat — friction here has real support cost. | Low |
| **Fee rule effective date** | Allow setting a future activation date for a fee rule change. Currently not in the API contract, but a common request from finance teams doing scheduled price changes. Requires backend support. | High |
| **Bulk KYC queue processing** | A workflow view that presents one pending KYC review at a time with "Approve / Reject / Next" navigation, without returning to the list between each review. Reduces ops time when there are many pending reviews. | Medium |

---

## Anti-features (deliberately skip in v1)

Things to explicitly not build in the first implementation pass.

| Anti-Feature | Why to Avoid | What to Do Instead |
|--------------|-------------|-------------------|
| **Real-time push notifications (WebSocket/SignalR)** | Not documented in the API contract. Building WebSocket infrastructure is a significant scope addition. The polling on page load + manual refresh is sufficient for v1 ops workflows. | Add a manual refresh button on the dashboard and dispute list. |
| **CSV/Excel export** | Explicitly marked as "if implemented" in the project spec. Export logic requires server-side generation or complex client-side streaming for large datasets. | Bookmark the anti-feature for v2. The paginated table is sufficient for operational queries. |
| **2FA for admin login** | Not specified in the admin auth endpoints. Adding TOTP or SMS-based 2FA requires backend changes that are out of scope for the frontend. | Ensure the existing JWT-based auth is correctly implemented first (the cookie bug is the priority). |
| **Inline payment refund initiation** | Issuing refunds from the admin panel is a high-risk action not present in the documented API endpoints. If added without proper reconciliation flows, it creates financial liability. | Disputes with `ACCEPTED` status imply refund is handled at the backend/provider level. |
| **Merchant impersonation / "Login as merchant"** | Common in SaaS support tools but dangerous in a payment context. Not documented in the API and would require significant security review. | Use the merchant detail page to view their data without session impersonation. |
| **Charting library for audit log** | Visualizing audit activity as charts (actions per day, top actors) is an analytics feature, not a compliance feature. It adds a charting library dependency for minimal operational value. | The filterable table provides sufficient investigative capability. |
| **Platform config editing via UI** | The API exposes a read-only config endpoint. Config is managed via env vars and deploys. Building an edit UI would require backend work and introduces risk of live config mutation. | Render the snapshot read-only as documented. |
| **Merchant self-service portal features** | Any feature that belongs in `PrismaPayments.Seller.FrontEnd` (merchant dashboard, payment creation, balance management from merchant perspective). This is a separate repository and project. | Keep a hard boundary: admin actions only, never merchant-perspective UX. |
