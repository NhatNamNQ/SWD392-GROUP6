# Backend Microservices

The backend should start with a pragmatic three-service core. This keeps the
system understandable for a course team while still teaching real microservice
boundaries.

## Services

| Service | Owner | Responsibility |
| --- | --- | --- |
| Next.js BFF | Frontend team | Browser UI, server-side frontend orchestration, streaming chat UI |
| Java backend | Backend team | Authentication integration, courses, chapters, document metadata, chat session metadata |
| Python RAG backend | AI/backend team | Document ingestion, chunking, embeddings, retrieval, prompt construction, LLM calls |

## Java Backend Workspace

The Java backend now lives directly in this repository under
`OrbitDocs-backend/`. Treat it as its own service boundary even though the code
is checked into the same repo.

Best practices:

- Keep the Java service independently buildable with the Maven wrapper.
- Keep integration contracts explicit at the HTTP/API boundary.
- Do not let the frontend or Python service depend on internal Java classes.
- Review Java API changes through normal pull requests in this repository.

## API Ownership

| API Area | Owner | Notes |
| --- | --- | --- |
| Auth/session identity | Java backend | May delegate token issuance to an identity provider later |
| Courses and chapters | Java backend | Source of truth for course structure |
| Document metadata | Java backend | Status values: Uploaded, Processing, Indexed, Failed |
| Document indexing trigger | Java to Python | Internal API, not browser-facing |
| Chat answer generation | Python backend | Returns answer text and citations |
| Chat history metadata | Java backend | Stores sessions and user-visible history |

## Service Boundary Rules

- The frontend calls Java for business data and Python for chat/RAG.
- Python owns RAG internals and should expose only stable APIs.
- Java owns durable business records and document status.
- PostgreSQL is shared infrastructure, but services should not freely mutate each
  other's tables.
- Cross-service communication should be HTTP first for simplicity. Async events
  can be introduced later if indexing volume requires it.

## Why Not More Services Now?

Splitting identity, courses, documents, chat sessions, notifications, and RAG
into separate services would teach more distributed-system concepts but add
coordination overhead before the domain is stable. Start with clear internal
modules inside Java and Python. Split them into separate deployable services
only when there is a real scaling, ownership, or release-cycle reason.
