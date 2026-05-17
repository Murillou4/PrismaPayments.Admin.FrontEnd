---
phase: 02-merchants
plan: "03"
subsystem: ui
tags: [svelte, pdfjs-dist, kyc, merchant-management, rbac]

requires:
  - phase: 02-merchants/02-02
    provides: MerchantDetailPage with controller stubs (updateStatus, updateVerification, kycDocs state)
provides:
  - MerchantStatusActions component: conditional status transition buttons with ConfirmDialog and required reason
  - MerchantKYCTab component: document grid with inline image/PDF preview and KYC review form
  - Status transition flow wired into MerchantDetailPage header
  - KYC tab placeholder replaced with real MerchantKYCTab in MerchantDetailPage
affects:
  - 02-04 (credentials/transactions tabs that complete MerchantDetailPage)

tech-stack:
  added: [pdfjs-dist@^5.6.205]
  patterns:
    - Dynamic import of pdfjs-dist to avoid SSR issues (client-only PDF rendering)
    - ConfirmDialog with requiresReason=true and onconfirm/oncancel callback props (Svelte 5 style, no createEventDispatcher)
    - RBAC via hasPermission(role, minRole) from adminGuard at component level

key-files:
  created:
    - src/app/features/merchants/presentation/components/MerchantStatusActions.svelte
    - src/app/features/merchants/presentation/components/MerchantKYCTab.svelte
  modified:
    - src/app/features/merchants/presentation/pages/MerchantDetailPage.svelte
    - package.json

key-decisions:
  - "ConfirmDialog uses requiresReason (not requireReason) and onconfirm/oncancel (lowercase) — adapted from reading real component API"
  - "StatusBadge accepts only status prop (no type prop) — confirmed from real implementation"
  - "pdfjs CDN worker URL used for simplicity over bundled worker (avoids vite config complexity)"

patterns-established:
  - "RBAC at component level: hasPermission(role as AdminRole, 'SUPPORT') in $derived for reactive permission checks"
  - "Dynamic pdfjs import pattern: await import('pdfjs-dist') inside async function, not at module level"

requirements-completed: [MERCH-04, MERCH-05]

duration: ~8min
completed: 2026-03-31
---

# Phase 02 Plan 03: Merchant Status Actions + KYC Tab Summary

**MerchantStatusActions with 5 RBAC-gated status transitions via ConfirmDialog, and MerchantKYCTab with 2-column document grid, inline PDF/image preview via pdfjs-dist, and KYC review form for SUPPORT+**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-31T22:43:00Z
- **Completed:** 2026-03-31T22:51:56Z
- **Tasks:** 2/2
- **Files modified:** 4 (+ package-lock.json)

## Accomplishments
- MerchantStatusActions renders conditional buttons based on merchant status and user role (5 transitions, ADMIN-only Desbloquear)
- Each status action opens ConfirmDialog with required reason field before executing
- MerchantKYCTab displays documents in 2-column grid with StatusBadge per document and inline preview (img for images, canvas for PDFs)
- PDF rendering uses pdfjs-dist via dynamic import (SSR-safe), with CDN worker URL
- KYC review form (APPROVED/REJECTED radio + notes textarea) shown only when SUPPORT+ and verificationStatus=PENDING_REVIEW
- Both components fully integrated into MerchantDetailPage (placeholders removed)

## Task Commits

1. **Task 1: MerchantStatusActions with ConfirmDialog** - `eead0a2` (feat)
2. **Task 2: MerchantKYCTab with PDF preview and KYC review** - `e1146e4` (feat)

## Files Created/Modified
- `src/app/features/merchants/presentation/components/MerchantStatusActions.svelte` - Status transition buttons with ConfirmDialog and role-based visibility
- `src/app/features/merchants/presentation/components/MerchantKYCTab.svelte` - Document grid, inline preview (img/PDF), KYC review form
- `src/app/features/merchants/presentation/pages/MerchantDetailPage.svelte` - Integrated both components, removed placeholders
- `package.json` - Added pdfjs-dist dependency

## Decisions Made
- **ConfirmDialog API adaptation:** The plan spec used `requireReason` and `onConfirm`/`onClose`, but the real component uses `requiresReason` (with 's') and `onconfirm`/`oncancel` (lowercase Svelte 5 event handler naming). Adapted to match real API.
- **StatusBadge no type prop:** Plan spec used `type="document"` prop but real StatusBadge only accepts `status`. Removed the unsupported prop.
- **pdfjs CDN worker:** Used CDN URL for pdfjs worker to avoid needing vite config changes for worker bundling.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected ConfirmDialog prop names to match real component API**
- **Found during:** Task 1 (reading ConfirmDialog.svelte before implementing)
- **Issue:** Plan spec used `requireReason`, `onConfirm`, `onClose` but real component uses `requiresReason`, `onconfirm`, `oncancel`
- **Fix:** Used correct prop names from actual ConfirmDialog implementation
- **Files modified:** MerchantStatusActions.svelte
- **Committed in:** eead0a2 (Task 1 commit)

**2. [Rule 1 - Bug] Removed unsupported `type` prop from StatusBadge**
- **Found during:** Task 2 (reading StatusBadge.svelte before implementing)
- **Issue:** Plan spec used `<StatusBadge status={doc.status} type="document" />` but real StatusBadge has no `type` prop
- **Fix:** Used `<StatusBadge status={doc.status} />` without the unsupported prop
- **Files modified:** MerchantKYCTab.svelte
- **Committed in:** e1146e4 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - reading real component APIs before implementing)
**Impact on plan:** Essential corrections for TypeScript validity. No scope creep.

## Issues Encountered
None beyond the prop name adaptations documented above.

## Known Stubs
None — both components are fully wired to controller methods (`ctrl.updateStatus` and `ctrl.updateVerification`) from the detail controller created in Plan 02-02.

## Next Phase Readiness
- MerchantDetailPage now has real status actions and KYC tab
- Plan 02-04 can proceed to implement MerchantCredentialsTab and MerchantTransactionsTab (last two lazy tabs still showing placeholders)
- No blockers

---
*Phase: 02-merchants*
*Completed: 2026-03-31*
