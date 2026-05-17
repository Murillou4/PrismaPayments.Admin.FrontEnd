# Testing Patterns

**Analysis Date:** 2026-03-24

## Test Framework

**Runner:** None installed.

No test framework is present in `package.json`. The `devDependencies` and `dependencies` contain:

```json
{
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0"
  },
  "dependencies": {
    "lucide-svelte": "^0.475.0"
  }
}
```

No Vitest, Jest, Playwright, Cypress, or any other test runner is installed.

**Available scripts:**
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
```

There is no `test`, `test:unit`, `test:e2e`, or coverage script.

## Test File Organization

**No test files exist** in the project source tree.

A search for `*.test.*` and `*.spec.*` files under `src/` returns zero results. The only `.test.js` file found in the repository is `node_modules/devalue/src/utils.test.js`, which belongs to a third-party dependency.

## Test Coverage

**Overall coverage: 0%**

No application code is covered by automated tests. The following modules are completely untested:

**Core utilities — highest value to test:**
- `src/core/error/Failure.ts` — `Either` type constructors (`left`, `right`), all `Failure` subclasses
- `src/app/services/api/apiResponse.ts` — all status check helpers (`isSuccess`, `isBadRequest`, etc.)
- `src/app/shared/utils/formatters.ts` — `formatCurrency`, `formatDate`, `formatDocument`, `formatBasisPoints`, `formatPercentage`
- `src/app/features/auth/validators/authValidator.ts` — `validateLogin`, `hasErrors`

**Business logic — high value to test:**
- `src/app/shared/guards/adminGuard.ts` — `hasPermission`, `requireAuth`, `requireRole`
- `src/app/features/auth/services/AuthService.ts` — validation path, token storage path, error pass-through
- `src/app/features/dashboard/services/DashboardService.ts` — thin delegation, but verifies wiring

**Infrastructure — medium value to test (requires mocking):**
- `src/app/services/api/apiClient.ts` — HTTP method wrappers, query string building, auth header injection
- `src/app/services/storage/tokenStorage.ts` — JWT decoding, sessionStorage interaction
- `src/app/features/auth/data/repositories/AuthRepository.ts` — response mapping, failure conversion
- `src/app/features/dashboard/data/repositories/DashboardRepository.ts`

**Presentation layer — low priority without component testing setup:**
- `src/app/features/auth/presentation/controllers/authController.svelte.ts` — requires Svelte 5 rune context
- All `*Page.svelte` components

## Testing Patterns

**No patterns established.** There are no existing tests to derive patterns from.

## Recommendations for Adding Tests

**Suggested framework:** Vitest (already in the Vite ecosystem; zero-config with SvelteKit).

**Installation:**
```bash
npm install -D vitest @vitest/coverage-v8
```

**Suggested `package.json` scripts:**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Suggested `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom'
  }
});
```

**Suggested test file placement:** Co-located with source files.
- `src/app/features/auth/validators/authValidator.test.ts`
- `src/core/error/Failure.test.ts`
- `src/app/shared/utils/formatters.test.ts`
- `src/app/shared/guards/adminGuard.test.ts`

**Highest-ROI first tests to write:**

1. `authValidator.test.ts` — pure functions, no dependencies, directly testable:
   - Valid email + valid password → empty errors object
   - Missing email → `errors.email` set
   - Invalid email format → `errors.email` set
   - Password shorter than 6 chars → `errors.password` set
   - `hasErrors({})` → `false`; `hasErrors({ email: 'x' })` → `true`

2. `formatters.test.ts` — pure functions, locale-dependent:
   - `formatCurrency(10000)` → `'R$\u00a0100,00'`
   - `formatDocument('12345678901', 'CPF')` → `'123.456.789-01'`
   - `formatBasisPoints(250)` → `'2,50%'`

3. `Failure.test.ts` — class hierarchy and `Either` constructors:
   - `left(new NetworkFailure())` → `{ ok: false, failure: ... }`
   - `right('value')` → `{ ok: true, value: 'value' }`
   - Default messages for each `Failure` subclass

4. `adminGuard.test.ts` — `hasPermission` role hierarchy:
   - `hasPermission('SUPER_ADMIN', 'VIEWER')` → `true`
   - `hasPermission('VIEWER', 'ADMIN')` → `false`
   - `hasPermission(null, 'VIEWER')` → `false`

## Type Checking (Substitute for Tests)

The project uses `svelte-check` as a partial substitute for runtime test coverage:

```bash
npm run check        # One-time type-check
npm run check:watch  # Continuous type-check during development
```

`svelte-check` validates TypeScript types across `.svelte` and `.ts` files. It catches type mismatches but does not verify runtime behavior, business logic correctness, or edge cases.

---

*Testing analysis: 2026-03-24*
