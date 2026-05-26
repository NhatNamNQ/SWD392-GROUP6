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
