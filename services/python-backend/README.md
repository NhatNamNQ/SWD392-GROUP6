# Python FastAPI RAG Backend

This directory is reserved for the future Python FastAPI RAG service.

## Responsibility

The Python backend owns AI and retrieval workflows:

- Document text extraction.
- Chunking.
- Embedding generation.
- PostgreSQL + pgvector retrieval.
- Prompt construction.
- LLM calls.
- Streaming answers with citations.

## Boundary

The Python service should not own course structure, user management, or durable
chat session history. Those belong to the Java backend.

The Python service should hide vector-store details behind a retrieval interface
so the team can change storage later if needed.

See:

- [RAG and Data Architecture](../../docs/architecture/rag-and-data.md)
- [ADR-001: Use PostgreSQL + pgvector](../../docs/architecture/adr/001-use-postgresql-pgvector.md)
