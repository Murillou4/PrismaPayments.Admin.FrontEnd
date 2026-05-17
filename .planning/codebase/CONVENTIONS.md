# Coding Conventions

**Analysis Date:** 2026-03-24

## Naming Patterns

**Files:**
- Svelte components: `PascalCase.svelte` — e.g., `LoginPage.svelte`, `AdminLayout.svelte`
- Svelte controllers (with runes): `camelCase.svelte.ts` — e.g., `authController.svelte.ts`
- TypeScript services: `PascalCase.ts` — e.g., `AuthService.ts`, `DashboardService.ts`
- TypeScript repositories: `PascalCase.ts` — e.g., `AuthRepository.ts`, `DashboardRepository.ts`
- TypeScript interfaces/repositories (domain): `IPascalCase.ts` — e.g., `IAuthRepository.ts`
- Utility/helper modules: `camelCase.ts` — e.g., `apiClient.ts`, `apiResponse.ts`, `tokenStorage.ts`, `formatters.ts`
- Validator modules: `camelCaseValidator.ts` — e.g., `authValidator.ts`
- Payload types: `PascalCasePayload.ts` — e.g., `LoginPayload.ts`
- Constants modules: `camelCase.ts` — e.g., `apiPaths.ts`, `env.ts`

**Functions:**
- Exported standalone functions: `camelCase` — e.g., `validateLogin`, `hasErrors`, `formatCurrency`, `requireAuth`
- Factory functions (return controller objects): `createPascalCase` — e.g., `createAuthController`
- Boolean predicate helpers: `isXxx` / `hasXxx` — e.g., `isSuccess`, `isUnauthorized`, `hasErrors`, `hasPermission`

**Variables and Constants:**
- Local variables and function parameters: `camelCase`
- Exported singleton objects: `camelCase` — e.g., `apiClient`, `tokenStorage`, `sl`
- Exported constant maps: `SCREAMING_SNAKE_CASE` — e.g., `API_PATHS`, `ROLE_LEVELS`
- String constant keys: `SCREAMING_SNAKE_CASE` — e.g., `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`

**Types and Interfaces:**
- Interfaces: `PascalCase` prefixed with `I` only for repository contracts — e.g., `IAuthRepository`, `IAuthRepository`
- All other interfaces: `PascalCase` without prefix — e.g., `AuthState`, `AuthValidationErrors`, `ApiResponse`, `RouteMessage`
- Type aliases: `PascalCase` — e.g., `HttpMethod`, `ResponseType`, `Either`, `AdminRole`
- Enums: Not used; string union types are preferred — e.g., `'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'VIEWER'`

**Classes:**
- `PascalCase` matching the file name — e.g., `AuthService`, `AuthRepository`, `ServiceLocator`
- Abstract base classes: `PascalCase` — e.g., `Failure` (abstract)

## TypeScript Usage Patterns

**Strict mode:** Enabled via `tsconfig.json` (inferred from `svelte-check` usage).

**`interface` vs `type`:**
- Use `interface` for object shapes (entities, API contracts, state shapes, repository contracts)
- Use `type` for unions, aliases, and discriminated unions — e.g., `HttpMethod`, `ResponseType`, `Either`, `AdminRole`

**Generics:**
- Used extensively for type safety — e.g., `ApiResponse<T>`, `Either<F, S>`, `PaginatedResult<T>`, `ServiceLocator.get<T>()`
- Generic type parameter `T` is the default name; `F` and `S` used in `Either` for Failure/Success

**`readonly`:**
- Class constructor properties injected via DI are declared `private readonly` — e.g., `private readonly repo: IAuthRepository`
- Constant objects use `as const` — e.g., `API_PATHS`, `env`

**Optional chaining and nullability:**
- Nullable values typed as `T | null` (not `undefined`) for explicit intent
- Optional interface properties use `?` — e.g., `code?: string` in `Failure`
- Non-null assertion `!` used sparingly and only where value is provably present

**Type imports:**
- Use `import type` for type-only imports consistently — e.g., `import type { Either, Failure }`, `import type { Snippet }`

**`unknown` over `any`:**
- `unknown` is used when type is genuinely unknown — e.g., `body?: unknown` in `RequestOptions`, `Map<string, unknown>` in `ServiceLocator`

## Component Structure Patterns

**Svelte 5 runes are used throughout** (Svelte 5.x):
- Reactive state: `$state<T>(initialValue)` — e.g., `let metrics = $state<AdminMetrics | null>(null)`
- Derived values: `$derived(expression)` — e.g., `const metricCards = $derived(metrics ? [...] : [])`
- Props: `$props()` with destructuring and inline type — e.g., `let { children }: { children: Snippet } = $props()`
- Event handlers: inline arrow functions on DOM events — e.g., `oninput={(e) => ctrl.setEmail(...)}`

**Page components** (`*Page.svelte`):
- Declare local state with `$state` at top of `<script lang="ts">`
- Instantiate service + repository directly (no DI container in pages)
- Use `onMount` for data fetching
- Derive computed values with `$derived`
- Render loading/error/content states with `{#if}` blocks
- No explicit `export` from page components

**Layout/Widget components** (`AdminLayout.svelte`):
- Accept children via `Snippet` prop named `children` or `content`
- Use `{@render snippetName()}` to render passed snippets
- Navigation data defined as static arrays inside `<script>`
- Active route detection via `$page.url.pathname` from `$app/stores`

**Controller pattern** (`*.svelte.ts`):
- Factory function (not a class) named `createXxxController`
- Internal state object typed with a local `interface XxxState`
- State managed with `$state<XxxState>({...})`
- Service instantiated inside the factory function
- Returned object exposes: `get state()` getter, action methods, setter methods
- File extension `.svelte.ts` enables runes outside `.svelte` files

**Route pages** (`src/routes/**`):
- Thin shell files — import and render the feature page component, nothing else
- Example pattern:
  ```svelte
  <script lang="ts">
    import DashboardPage from '$appmod/features/dashboard/presentation/pages/DashboardPage.svelte';
  </script>
  <DashboardPage />
  ```

## Import/Export Patterns

**Path aliases** (defined in `svelte.config.js`):
- `$appmod` → `./src/app`
- `$core` → `./src/core`
- `$app/*` → SvelteKit built-ins (e.g., `$app/navigation`, `$app/stores`)
- `$env/static/public` → SvelteKit environment variable access

**Import ordering (observed pattern):**
1. SvelteKit / framework imports (`$app/*`, `svelte`, `@sveltejs/kit`)
2. Core layer imports (`$core/...`)
3. App module imports (`$appmod/...`)
4. Relative imports (same feature, same layer)

**Export styles:**
- Utility functions and types: named exports at declaration site
- Singleton objects: `export const name = { ... }` at bottom of file
- Classes: named export at declaration site
- Factory functions: named export at declaration, re-exported with `export { createAuthController }` pattern
- No default exports anywhere in the codebase

**Barrel files:** Not used. Each file is imported directly by path.

## Error Handling Patterns

**`Either` monad pattern** is the primary error-handling strategy:
```typescript
// Definition in src/core/error/Failure.ts
export type Either<F extends Failure, S> =
  | { ok: false; failure: F }
  | { ok: true; value: S };
```
- `left(failure)` wraps an error result
- `right(value)` wraps a success result
- Callers check `result.ok` before accessing `.value` or `.failure`

**Failure class hierarchy** (`src/core/error/Failure.ts`):
- Abstract base: `Failure` (has `message: string`, optional `code?: string`)
- Concrete types: `NetworkFailure`, `UnauthorizedFailure`, `ForbiddenFailure`, `NotFoundFailure`, `ValidationFailure`, `ServerFailure`
- Error messages are written in Brazilian Portuguese

**Repository layer:**
- Wraps all HTTP calls in `try/catch`
- Returns `left(new NetworkFailure())` on network exception
- Maps HTTP status codes to specific `Failure` subtypes before returning
- Never throws — always returns `Either`

**Service layer:**
- Runs validation before delegating to repository
- Returns validation errors as `left(new ValidationFailure(message))`
- Passes repository `Either` results through unchanged

**Controller/presentation layer:**
- Checks `result.ok` — on failure, writes `result.failure.message` to state
- Sets a loading flag `false` before returning on error
- User-facing error messages come entirely from `Failure.message`

**HTTP status check helpers** (`src/app/services/api/apiResponse.ts`):
- `isSuccess`, `isNoContent`, `isBadRequest`, `isUnauthorized`, `isForbidden`, `isNotFound`, `isServerError`
- Used in repository implementations to decide which `Failure` type to return

**`catch` blocks:** Use empty `catch {}` (catch without binding) to discard the error and return a typed `NetworkFailure` instead.

## Code Organization Within Files

**Ordering within TypeScript files:**
1. Imports
2. Local constants (non-exported)
3. Type / interface declarations
4. Implementation (functions, classes)
5. Exported singleton / object at the end of file

**Ordering within Svelte component `<script lang="ts">`:**
1. Imports
2. Props declaration (`$props()`)
3. Local state (`$state`)
4. Service/repository instantiation
5. Lifecycle hooks (`onMount`)
6. Derived values (`$derived`)
7. Event handler functions

**Comments:**
- Inline comments used sparingly for intent clarification — e.g., `// Stateless — token clearing handled by tokenStorage`
- HTML comments used for section labels in templates — e.g., `<!-- Logo / Brand -->`, `<!-- Form -->`
- No JSDoc/TSDoc annotations present

**Function size:** Functions are small and single-purpose. Repository methods are typically 10-15 lines; utility functions 3-7 lines.

**Locale:** All user-facing strings are in Brazilian Portuguese (`pt-BR`). Formatting uses `Intl.NumberFormat` and `Intl.DateTimeFormat` with `'pt-BR'` locale.

---

*Convention analysis: 2026-03-24*
