 # Repository Guidelines

## Project Structure & Module Organization
- `src/routes/` — SvelteKit pages and endpoints (`+page.svelte`, `+layout.*`, `+server.ts`).
- `src/lib/components/` — reusable UI in PascalCase; `src/lib/api/` — typed API client wrappers; `src/lib/utils/` — helpers; `src/lib/types/` — shared types.
- `static/` — public assets served at `/`.
- `tests/` — unit/component tests; see `tests/setup.ts` for globals and SvelteKit mocks.

## Build, Test, and Development Commands
- `yarn dev` — run local dev server with HMR.
- `yarn build` — Vite build using Node adapter into `build/`; `yarn preview` to preview.
- `yarn check` / `yarn typecheck` — Svelte + TypeScript checks.
- `yarn lint` — Prettier check and ESLint; `yarn format` — auto-format.
- `yarn test` / `yarn test:watch` — Vitest (jsdom, Testing Library).
- Docker: `yarn docker:dev` (compose dev), `yarn docker:prod` (compose prod), `yarn docker:build` (production image).

## Coding Style & Naming Conventions
- 2-space indentation; format with Prettier (v3) + `prettier-plugin-svelte` and Tailwind plugin.
- TypeScript-first: avoid `any`, prefer explicit return types in `src/lib/**`.
- Components: PascalCase `.svelte` with focused props; re-export groups via `index.ts` files.
- Routes follow SvelteKit conventions (`+page.svelte`, `+layout.svelte`, `+server.ts`).
- Libraries (`src/lib/**`): keep filenames descriptive; match neighboring patterns; export a minimal public surface via `index.ts`.

## Testing Guidelines
- Framework: Vitest + `@testing-library/svelte` (env: jsdom).
- Name tests `*.test.ts` or `*.spec.ts` in `src/**` or `tests/**`.
- Use `tests/setup.ts` for SvelteKit/env mocks; assert via roles/text, not implementation details.
- Run `yarn test` before pushing; add tests for new logic and bug fixes.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- Keep PRs small and scoped; include description, reproduction/validation steps, and screenshots for UI.
- Link related issues; call out breaking changes and required env updates.

## Security & Configuration Tips
- Copy `.env.example` to `.env`; only expose `PUBLIC_*` vars to the client.
- Required: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_API_URL`.
- Do not commit secrets; verify `.gitignore` covers local env files.
