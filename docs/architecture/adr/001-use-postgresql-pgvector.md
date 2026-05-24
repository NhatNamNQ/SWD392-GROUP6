# ADR-001: Use PostgreSQL + pgvector

## Status

Accepted

## Context

The chatbot needs relational data for users, courses, chapters, documents, and
chat sessions. It also needs vector search for RAG retrieval.

## Decision

Use PostgreSQL with the pgvector extension as the target vector store.

## Consequences

- The team operates one primary database instead of PostgreSQL plus a separate
  vector database.
- Python RAG can join chunk metadata with course and document metadata.
- The system stays simpler for a production-like course project.
- If retrieval scale grows beyond pgvector's practical limits, Python RAG should
  hide the storage change behind its retrieval layer.
