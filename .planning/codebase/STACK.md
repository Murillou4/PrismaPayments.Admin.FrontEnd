# Technology Stack

**Analysis Date:** 2026-03-24

## Languages

**Primary:**
- TypeScript 5.x — all application logic, services, repositories, controllers
- Svelte 5.x — component templates (`.svelte` files)

**Secondary:**
- JavaScript — config files (`svelte.config.js`)
- CSS — global styles (`src/app.css`) via Tailwind v4 `@import`

## Runtime

**Environment:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` file detected)

**Package Manager:**
- npm (inferred from `package.json`; lockfile: `package-lock.json` expected but not confirmed present)
- Module system: ESM (`"type": "module"` in `package.json`)

## Frameworks

**Core:**
- SvelteKit ^2.0.0 (`@sveltejs/kit`) — full-stack meta-framework; handles routing, SSR/SPA rendering, layouts, and navigation
- Svelte ^5.0.0 — UI component framework; uses Svelte 5 runes API (`$state`, `$props`, snippets)

**Build/Dev:**
- Vite ^6.0.0 — dev server and production bundler
- `@sveltejs/vite-plugin-svelte` ^5.0.0 — Svelte compiler integration for Vite
- `@tailwindcss/vite` ^4.0.0 — Tailwind CSS v4 Vite plugin (no `tailwind.config.*` file; configured entirely via CSS `@theme`)

**Type Checking:**
- `svelte-check` ^4.0.0 — Svelte-aware TypeScript checking
- TypeScript ^5.0.0 — strict mode enabled (`"strict": true` in `tsconfig.json`)

## Key Dependencies

**UI / Icons:**
- `lucide-svelte` ^0.475.0 — icon library (Lucide icons wrapped as Svelte components); the only runtime production dependency

**No additional UI component library** — components are hand-built using Tailwind utility classes and inline styles.

## Styling

**Framework:** Tailwind CSS v4
- Integrated via `@tailwindcss/vite` plugin; no separate config file
- Global stylesheet: `src/app.css`
- Theme tokens defined in `@theme {}` block inside `src/app.css`:
  - Brand colors: `--color-brand-magenta` (#FF00FF), `--color-brand-cyan` (#01FAFB)
  - Dark-mode-first design: `color-scheme: dark` set globally
  - Custom fonts: `Space Grotesk` (display/headings), `Outfit` (body/mono)
  - Custom radius scale, shadow scale including glow effects
- Components use a mix of Tailwind utility classes and inline `style` attributes (see `src/app/shared/widgets/AdminLayout.svelte`)

## State Management

- **Svelte 5 Runes** — local reactive state via `$state()` in controller functions
- **No global state store** — each feature creates its own controller via factory functions (e.g., `createAuthController()` in `src/app/features/auth/presentation/controllers/authController.svelte.ts`)
- **Service Locator** — `src/core/service_locator/serviceLocator.ts` provides a custom DI container (`sl`) supporting lazy singleton registration; used for wiring services and repositories
- **Token state** — auth tokens stored in `sessionStorage` via `src/app/services/storage/tokenStorage.ts`; not in a reactive store

## Build Configuration

**Entry:**
- Vite config: `vite.config.ts` — minimal; only registers `tailwindcss()` and `sveltekit()` plugins

**SvelteKit config:** `svelte.config.js`
- Adapter: `@sveltejs/adapter-auto` ^3.0.0 (auto-detects deployment platform)
- Preprocessor: `vitePreprocess()` for TypeScript in `.svelte` files
- Path aliases:
  - `$appmod` → `./src/app`
  - `$core` → `./src/core`
  - `$app/*` → SvelteKit built-ins (`$app/stores`, `$app/navigation`)

**TypeScript config:** `tsconfig.json`
- Extends `.svelte-kit/tsconfig.json` (auto-generated)
- Key options: `strict: true`, `allowJs: true`, `checkJs: true`, `esModuleInterop: true`, `sourceMap: true`, `resolveJsonModule: true`

## Dev Tooling

**Type Checking:**
```bash
npm run check          # svelte-kit sync + svelte-check
npm run check:watch    # watch mode
```

**Linting / Formatting:**
- No ESLint config detected at project root
- No Prettier config detected at project root
- No Biome config detected

**Testing:**
- No test framework detected (`jest`, `vitest`, `playwright` — none found in `package.json`)

## Platform Requirements

**Development:**
- `npm run dev` — starts Vite dev server

**Production build:**
- `npm run build` — Vite production build via SvelteKit
- `npm run preview` — preview production build locally
- Deployment target determined at build time by `adapter-auto`

---

*Stack analysis: 2026-03-24*
