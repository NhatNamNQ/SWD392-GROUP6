# Repository Guidelines

## Project Structure & Module Organization

This frontend uses the Next.js App Router with a feature-first layout. Keep route files thin in `app/` and move real UI into `features/`. Current structure:

- `app/`: route entrypoints, layout, and global CSS.
- `features/*/components/`: feature-specific UI compositions.
- `features/*/model/`: local types and view models.
- `features/*/data/`: mock or page-specific data.
- `components/ui/`: reusable shadcn-style primitives.
- `components/shared/`: shared cross-feature pieces such as the site header.
- `lib/`: generic helpers like `utils.ts`.

## Build, Test, and Development Commands

Run all commands from `frontend/`:

- `npm run dev` starts the Next.js dev server.
- `npm run precheck` runs type generation, ESLint, and TypeScript checks.
- `npm run build` creates the production build.
- `npm run check` runs format, lint, and type checks.
- `npm run format` rewrites files with Prettier.

## Coding Style & Naming Conventions

Use TypeScript, React, Tailwind, ESLint, and Prettier. Keep 2-space indentation and prefer descriptive PascalCase component names like `DashboardShell` or `LoginForm`. Use camelCase for functions, variables, and data helpers. Keep product-specific layout decisions inside `features/*` instead of pushing them into `components/ui/`.

## Testing Guidelines

There is no dedicated unit test suite yet. Treat `npm run precheck` and `npm run build` as the minimum verification before merging. For UI changes, validate the affected route in the browser and check the relevant feature module, such as `app/dashboard/page.tsx` and `features/dashboard/components/*`.

## Commit & Pull Request Guidelines

Recent history uses concise conventional-style commits such as `feat(...)`, `fix: ...`, and `chore: ...`. Keep commits focused and imperative. Pull requests should summarize the change, list verification commands, and include screenshots or short recordings for visible UI updates.

## Agent-Specific Instructions

Run all `shadcn` commands from `frontend/` only. Prefer previewing updates first with `--dry-run` or `--diff` before modifying shared UI. Do not commit generated build artifacts like `.next/`, `.playwright-mcp/`, or `*.tsbuildinfo`.
