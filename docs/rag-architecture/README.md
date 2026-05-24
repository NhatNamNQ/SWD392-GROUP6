# RAG Architecture

The canonical RAG design now lives in
[RAG and Data Architecture](../architecture/rag-and-data.md).

This page keeps the short version for quick onboarding.

## Target Design

The Python FastAPI service owns the RAG pipeline:

1. Extract text from uploaded PDF, DOCX, or slide files.
2. Split text into 256-512 token chunks with 10-15% overlap.
3. Generate embeddings for chunks.
4. Store chunks and vectors in PostgreSQL + pgvector.
5. Retrieve relevant chunks for a student question.
6. Build a grounded prompt and call the LLM.
7. Return a streamed answer with citations.

## Storage Decision

Use PostgreSQL + pgvector as the target vector store.

ChromaDB may be useful for experiments, but it is not the project target
architecture because it adds another datastore for the team to operate.

## Suggested Python Service Structure

```text
services/python-backend/
├── app/
│   ├── api/                   # FastAPI routes
│   ├── core/                  # Configuration and exceptions
│   ├── models/                # Database models
│   ├── schemas/               # Request and response schemas
│   ├── rag/                   # Extraction, chunking, retrieval, generation
│   └── services/              # Application orchestration
├── tests/
├── requirements.txt
└── main.py
```

Keep the vector-store implementation behind a retrieval interface so the team
can change storage later without changing the frontend or Java backend.
