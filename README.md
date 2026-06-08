# SWD392 Course Document Chatbot

This repository contains the architecture, documentation, and active service
workspaces for the SWD392 Course Document Chatbot.

The current phase is **architecture and planning**, not application
implementation. The project is designed as a production-like learning system so
the team can practice microservice boundaries, RAG design, CI/CD, security
scanning, and observability without overbuilding the first version.

## Start Here

Read the [Architecture Handbook](docs/architecture/README.md) first.

Recommended order:

1. [Architecture Handbook](docs/architecture/README.md)
2. [Use Case Diagram](docs/architecture/use-case-diagram.md)
3. [C4 Diagrams](docs/architecture/c4-diagrams.md)
4. [Backend Microservices](docs/architecture/backend-microservices.md)
5. [RAG and Data Architecture](docs/architecture/rag-and-data.md)
6. [DevSecOps](docs/architecture/devsecops.md)
7. [Observability](docs/architecture/observability.md)
8. [Deployment Roadmap](docs/architecture/deployment-roadmap.md)
9. [Security Tooling](security/README.md)

## Target Architecture

```mermaid
flowchart TD
    User[Student / Lecturer]

    subgraph Client["Client Layer"]
        FE[Next.js Frontend / BFF]
    end

    subgraph Services["Backend Services"]
        Java[Spring Boot Java Backend]
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
        Quality[Tests + SonarQube Cloud + Trivy]
        Prom[Prometheus]
        Grafana[Grafana]
    end

    User --> FE
    FE --> Java
    FE --> Python
    Java --> DB
    Python --> DB
    Python --> LLM
    GHA --> Quality
    FE -. metrics .-> Prom
    Java -. metrics .-> Prom
    Python -. metrics .-> Prom
    Prom --> Grafana
```

## Repository Layout

| Path | Purpose |
| --- | --- |
| `docs/architecture/` | Architecture handbook, diagrams, DevSecOps, observability, and ADRs |
| `docs/devsecops/` | Short security-first CI/CD entry point |
| `docs/swd392-chatbot-user-stories.md` | Product stories and acceptance criteria |
| `docs/embeddings/` | Embedding and retrieval reference material |
| `security/` | SonarQube Cloud and Trivy setup notes and examples |
| `frontend/` | Active Next.js frontend workspace |
| `OrbitDocs-backend/` | Active Spring Boot Java backend workspace |
| `rag-backend/` | Active Python FastAPI RAG service workspace |
| `infra/` | Future infrastructure documentation and IaC |
| `scripts/` | Future helper scripts for setup, seed data, and tests |

## Current Decisions

| Area | Decision |
| --- | --- |
| Frontend | Next.js BFF |
| Backend | Pragmatic microservice architecture |
| Java backend | Spring Boot service in `OrbitDocs-backend/`, integrated through HTTP/API contracts |
| RAG backend | Python FastAPI |
| Vector store | PostgreSQL + pgvector |
| Local workflow | Docker Compose first |
| Kubernetes | Future deployment model, not implemented now |
| CI/CD | GitHub Actions first; Jenkins is an alternative |
| Quality | SonarQube Cloud quality gate |
| Security | Trivy scans |
| Observability | Prometheus and Grafana |

## Local Development Note

The existing `docker-compose.yml` is still an early skeleton. As implementation
continues, it should stay aligned with the architecture handbook, especially
the PostgreSQL + pgvector decision and the real service workspaces in
`frontend/`, `OrbitDocs-backend/`, and `rag-backend/`.
