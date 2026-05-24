# RAG And Data Architecture

The system uses PostgreSQL with the pgvector extension as the single primary
data store for relational records and vector embeddings.

## Storage Decision

Use **PostgreSQL + pgvector** for the first production-like design.

Reasons:

- The project scale is expected to be course-sized, not internet-scale.
- Course, chapter, document, citation, and embedding metadata need relational joins.
- One database is easier for a student team to operate than PostgreSQL plus a
  separate vector database.
- pgvector supports production-grade vector indexes for this scope.

ChromaDB remains useful for local RAG experiments, but it is not the target
architecture for this project.

## Data Ownership

| Data | Owner | Storage |
| --- | --- | --- |
| Users and roles | Java backend | PostgreSQL |
| Courses and chapters | Java backend | PostgreSQL |
| Document metadata | Java backend | PostgreSQL |
| Document chunks | Python RAG backend | PostgreSQL + pgvector |
| Embeddings | Python RAG backend | PostgreSQL + pgvector |
| Chat sessions | Java backend | PostgreSQL |
| Generated answer traces | Java or Python, decided during implementation | PostgreSQL |

## Ingestion Flow

1. Lecturer uploads a PDF, DOCX, or slide file through the frontend.
2. Java stores document metadata and marks the document as `Uploaded`.
3. Java asks Python to index the document.
4. Python extracts text, chunks content, generates embeddings, and stores vectors.
5. Python reports success or failure to Java.
6. Java updates the document status to `Indexed` or `Failed`.

## Retrieval Flow

1. Student sends a question.
2. Python creates or receives the effective standalone query.
3. Python embeds the query.
4. Python searches indexed chunks filtered by course and optional chapter scope.
5. Python builds a prompt using retrieved chunks and citation metadata.
6. Python streams an answer with citations to the frontend.
7. The frontend or backend records the conversation turn through Java.

## Retrieval Defaults

| Concern | Default |
| --- | --- |
| Chunk size | 256-512 tokens |
| Chunk overlap | 10-15% |
| Similarity metric | Cosine similarity |
| Retrieval scope | Course first, chapter optional |
| Citation requirement | Every grounded answer includes source document and chapter |
| Out-of-scope behavior | Say the answer was not found in indexed materials |

## Future Scaling Options

Move away from pgvector only if measurement shows a real bottleneck. Possible
future alternatives are Qdrant, Weaviate, Pinecone, or Milvus. The Python RAG
service should hide vector-store details behind a retrieval interface so this
change does not affect the frontend or Java backend.
