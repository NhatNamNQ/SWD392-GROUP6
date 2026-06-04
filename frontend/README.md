# Next.js Frontend / BFF

This directory is reserved for the future Next.js frontend.

## Responsibility

The frontend is the user-facing application and Backend-for-Frontend (BFF):

- Student chat UI.
- Lecturer document upload and management UI.
- Server-side orchestration for frontend-specific needs.
- Streaming answer rendering with citations.
- Calls to the Java backend for business data.
- Calls to the Python RAG backend for chat answers.

## Boundary

The frontend should not own durable business data or RAG internals.

Use:

- Java backend for auth, courses, chapters, document metadata, and session history.
- Python backend for chat generation, retrieval, and citations.

See [Backend Microservices](../../docs/architecture/backend-microservices.md).

## shadcn Workflow

Run all `shadcn` commands from the `frontend/` directory only.

Recommended flow:

1. `cd frontend`
2. Inspect project context: `npx shadcn@latest info --json`
3. Search or inspect components: `npx shadcn@latest search` and `npx shadcn@latest docs <component>`
4. Add or update components: `npx shadcn@latest add <component>`
5. Verify with the standard checks listed below

For updates to existing components, prefer previewing changes first:

- `npx shadcn@latest add <component> --dry-run`
- `npx shadcn@latest add <component> --diff <file>`

## Component Layer Boundaries

- `components/ui/*`: reusable shadcn-style primitives and shared UI building blocks.
- `components/shared/*`: cross-feature layout and brand components shared by multiple experiences.
- `features/*`: product-specific route modules, stateful compositions, mock data, and domain-specific UI.

Keep product-specific layout/content decisions in feature modules and avoid back-porting those styles into `ui` primitives.

## Verification Commands

Run checks in this order:

1. `npm run precheck` (type generation + lint + typecheck)
2. `npm run build`

`npm run check` remains available when you also want format validation in the same pass.
