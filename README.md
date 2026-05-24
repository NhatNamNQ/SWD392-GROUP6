# SWD392 Course Document Chatbot

This repository contains the architecture, documentation, and future service
workspace for the SWD392 Course Document Chatbot.

The current phase is **architecture and planning**, not application
implementation. The project is designed as a production-like learning system so
the team can practice microservice boundaries, RAG design, CI/CD, security
scanning, and observability without overbuilding the first version.

## Start Here

Read the [Architecture Handbook](docs/architecture/README.md) first.

Recommended order:

1. [Architecture Handbook](docs/architecture/README.md)
2. [C4 Diagrams](docs/architecture/c4-diagrams.md)
3. [Backend Microservices](docs/architecture/backend-microservices.md)
4. [RAG and Data Architecture](docs/architecture/rag-and-data.md)
5. [DevSecOps](docs/architecture/devsecops.md)
6. [Observability](docs/architecture/observability.md)
7. [Deployment Roadmap](docs/architecture/deployment-roadmap.md)

## Target Architecture

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
| `docs/swd392-chatbot-user-stories.md` | Product stories and acceptance criteria |
| `docs/embeddings/` | Embedding and retrieval reference material |
| `services/nextjs-frontend/` | Future Next.js frontend workspace |
| `services/java-backend/` | Future integration point for the Java backend submodule |
| `services/python-backend/` | Future Python FastAPI RAG service workspace |
| `infra/` | Future infrastructure documentation and IaC |
| `scripts/` | Future helper scripts for setup, seed data, and tests |

## Current Decisions

| Area | Decision |
| --- | --- |
| Frontend | Next.js BFF |
| Backend | Pragmatic microservice architecture |
| Java backend | External Git submodule integrated through API contracts |
| RAG backend | Python FastAPI |
| Vector store | PostgreSQL + pgvector |
| Local workflow | Docker Compose first |
| Kubernetes | Future deployment model, not implemented now |
| CI/CD | GitHub Actions first; Jenkins is an alternative |
| Quality | SonarQube quality gate |
| Security | Trivy scans |
| Observability | Prometheus and Grafana |

## Local Development Note

The existing `docker-compose.yml` is an early skeleton. Before application
implementation starts, it should be aligned with the architecture handbook,
especially the PostgreSQL + pgvector decision and the external Java submodule
workflow.
