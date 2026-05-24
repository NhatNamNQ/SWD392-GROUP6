# C4 Architecture Diagrams

These diagrams use the C4 idea: start broad, then zoom into containers,
components, and runtime flows. They are intentionally written in Mermaid so the
team can review them directly in Markdown.

## Level 1: System Context

```mermaid
flowchart TD
    subgraph Actors["Actors"]
        Student[SWD392 Student]
        Lecturer[Lecturer / Course Admin]
    end

    subgraph Platform["SWD392 Course Document Chatbot"]
        System[Course RAG Chatbot Platform]
    end

    subgraph External["External Systems"]
        LLM[Gemini / OpenAI API]
    end

    Student -->|Ask course questions| System
    Lecturer -->|Upload and manage documents| System
    System -->|Grounded prompt requests| LLM
```

## Level 2: Containers

```mermaid
flowchart TD
    User[Student / Lecturer]

    subgraph Client["Client Layer"]
        FE[Next.js Frontend / BFF]
    end

    subgraph Services["Backend Services"]
        Java[Java Backend Submodule]
        Python[Python FastAPI RAG Service]
    end

    subgraph Data["Data Layer"]
        DB[(PostgreSQL + pgvector)]
    end

    subgraph External["External AI"]
        LLM[Gemini / OpenAI]
    end

    subgraph PlatformOps["Platform Engineering"]
        GHA[GitHub Actions]
        Quality[Tests + SonarQube + Trivy]
        Prom[Prometheus]
        Grafana[Grafana]
    end

    User --> FE
    FE -->|Auth, courses, documents, sessions| Java
    FE -->|Chat and streaming answers| Python
    Java -->|Relational business data| DB
    Python -->|Chunks, embeddings, retrieval| DB
    Python -->|Prompt and generation| LLM
    GHA --> Quality
    FE -. metrics .-> Prom
    Java -. metrics .-> Prom
    Python -. metrics .-> Prom
    Prom --> Grafana
```

## Level 3: Python RAG Components

```mermaid
flowchart TD
    subgraph Interface["API Interface"]
        API[FastAPI Routes]
    end

    subgraph Application["Application Services"]
        ChatSvc[Chat Service]
        DocSvc[Document Indexing Service]
    end

    subgraph RAG["RAG Core"]
        Extract[Text Extraction]
        Chunk[Chunking]
        Embed[Embedding Client]
        Retrieve[Retriever]
        Prompt[Prompt Builder]
        Generate[LLM Client]
    end

    subgraph Data["Data Layer"]
        DB[(PostgreSQL + pgvector)]
    end

    API --> ChatSvc
    API --> DocSvc
    DocSvc --> Extract
    Extract --> Chunk
    Chunk --> Embed
    Embed --> DB
    ChatSvc --> Retrieve
    Retrieve --> DB
    ChatSvc --> Prompt
    Prompt --> Generate
```

## Dynamic View: Document Ingestion

```mermaid
sequenceDiagram
    autonumber
    actor Lecturer
    participant FE as Next.js BFF
    participant Java as Java Backend
    participant DB as PostgreSQL + pgvector
    participant Python as Python RAG

    Lecturer->>FE: Upload file with course and chapter
    FE->>Java: POST document metadata and file reference
    Java->>DB: Save document status = Uploaded
    Java->>Python: POST internal indexing request
    Java-->>FE: Return document status = Processing
    Python->>Python: Extract text
    Python->>Python: Chunk content
    Python->>Python: Generate embeddings
    Python->>DB: Save chunks and embeddings
    alt Indexing succeeds
        Python->>Java: PATCH document status = Indexed
        Java->>DB: Update document status
    else Indexing fails
        Python->>Java: PATCH document status = Failed with reason
        Java->>DB: Store failure reason
    end
```

## Dynamic View: Chat

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant FE as Next.js BFF
    participant Java as Java Backend
    participant Python as Python RAG
    participant DB as PostgreSQL + pgvector
    participant LLM as Gemini / OpenAI

    Student->>FE: Ask question
    FE->>Java: Load session and course scope
    Java-->>FE: Return session context
    FE->>Python: Send chat request with scope
    Python->>DB: Retrieve relevant chunks
    Python->>LLM: Generate answer from retrieved context
    Python-->>FE: Stream answer with citations
    FE->>Java: Save chat turn metadata
```

## Future Deployment View

Kubernetes is a future deployment model, not an immediate implementation
requirement.

```mermaid
flowchart TD
    Internet[Internet]

    subgraph Kubernetes["Future Kubernetes Cluster"]
        Ingress[Ingress / Gateway]
        FE[Next.js Deployment]
        Java[Java Deployment]
        Python[Python Deployment]
        Prom[Prometheus]
        Grafana[Grafana]
    end

    subgraph ManagedData["Managed or Stateful Data"]
        PG[(PostgreSQL + pgvector)]
    end

    subgraph External["External Services"]
        LLM[External LLM API]
    end

    Internet --> Ingress
    Ingress --> FE
    FE --> Java
    FE --> Python
    Java --> PG
    Python --> PG
    Python --> LLM
    Prom -. scrape .-> FE
    Prom -. scrape .-> Java
    Prom -. scrape .-> Python
    Prom --> Grafana
```
