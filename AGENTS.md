# Repository Guidelines

## Project Structure & Module Organization

This repository is organized by delivery layer, not by one monolithic app. `docs/` contains architecture, ADRs, and user stories; `frontend/` is the active Next.js BFF workspace; `OrbitDocs-backend/` is the Java backend area; `rag-backend/` is the Python RAG service workspace; `infra/` holds deployment notes and IaC; and `scripts/` contains helper automation. Keep generated artifacts out of version control, especially `.next/`, `target/`, `build/`, `.playwright-mcp/`, and `*.tsbuildinfo`.

## Build, Test, and Development Commands

Use the root `Makefile` for local infrastructure:

- `make up` starts the Docker Compose stack.
- `make build` rebuilds and starts the stack.
- `make down` stops all containers.
- `make logs` tails service logs.

Use the frontend package for UI work:

- `npm --prefix frontend run dev` starts the Next.js app.
- `npm --prefix frontend run precheck` runs type generation, ESLint, and TypeScript checks.
- `npm --prefix frontend run build` creates a production build.
- `npm --prefix frontend run check` runs format, lint, and type checks.

## Coding Style & Naming Conventions

Follow the style already used in each subproject. For the frontend, use TypeScript, 2-space indentation, PascalCase for React components, camelCase for variables and functions, and Next.js route naming such as `app/dashboard/page.tsx`. Keep formatting Prettier-compliant and fix lint errors rather than bypassing them.

## Testing Guidelines

There is no repo-wide test suite yet. Treat `npm --prefix frontend run precheck` and `npm --prefix frontend run build` as the baseline verification before merging frontend changes. When adding tests later, place them close to the code they cover and name them by behavior, such as `upload-form.spec.ts` or `auth.service.test.ts`.

## Commit & Pull Request Guidelines

Recent commits use concise conventional-style subjects such as `feat(backend): ...`, `fix: ...`, and `chore: ...`. Keep commits focused, imperative, and scoped when helpful. Pull requests should explain the change, list verification commands, link related issues, and include screenshots or short videos for UI changes.

## Security & Configuration Tips

Do not commit secrets or environment files. The root `.gitignore` already excludes `.env`, `.env*.local`, and common build outputs. If you add new generated files or caches, update `.gitignore` rather than checking them in.
