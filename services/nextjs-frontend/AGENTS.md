# Repository Guidelines

## Project Structure & Module Organization

This repo is split by concern. `docs/` holds architecture and product notes, `services/nextjs-frontend/` is the active UI workspace, and `services/java-backend/` and `services/python-backend/` are future service boundaries. Use `infra/` for deployment notes and `scripts/` for helper automation. Keep browser-generated artifacts out of source control, especially `.next/`, `.playwright-mcp/`, and `*.tsbuildinfo`.

## Build, Test, and Development Commands

Use the frontend service package for app work:

- `npm --prefix services/nextjs-frontend run dev` starts the Next.js app.
- `npm --prefix services/nextjs-frontend run build` builds production output.
- `npm --prefix services/nextjs-frontend run check` runs Prettier check and ESLint.
- `npm --prefix services/nextjs-frontend run format` rewrites files with Prettier.

Use the root Makefile for the architecture skeleton:

- `make up` starts the Compose stack.
- `make build` rebuilds and starts the stack.
- `make down` stops the stack.

## Coding Style & Naming Conventions

The frontend uses TypeScript, React, Tailwind, ESLint, and Prettier. Keep formatting Prettier-compliant, prefer 2-space indentation, and use PascalCase for React components and camelCase for variables/functions. Name route files by Next.js convention, such as `app/page.tsx` and `app/dashboard/page.tsx`.

## Testing Guidelines

There is no dedicated unit test suite yet. Treat `npm --prefix services/nextjs-frontend run check` and `npm --prefix services/nextjs-frontend run build` as the baseline verification steps before you finish work. For UI changes, validate the affected route in the browser, especially `/` and `/dashboard`.

## Commit & Pull Request Guidelines

The Git history uses conventional commit style with clear scopes, for example `feat(nextjs-frontend): ...` and `chore: ...`. Keep commits focused and use imperative, scoped subjects. Pull requests should summarize the change, list verification commands, and include screenshots for visible UI work.

## Agent Notes

Follow the service-level guide in `services/nextjs-frontend/AGENTS.md` when editing that app. If you add new generated files, update `.gitignore` instead of committing build artifacts.
