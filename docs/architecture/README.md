# SWD392 Architecture Handbook

This handbook is the shared architecture guide for the SWD392 Course Document
Chatbot. It is written for team members who need to understand the system
before implementation starts.

## Purpose

The project is a production-like learning system. The goal is to practice good
architecture, DevSecOps, and observability decisions without overbuilding the
first version.

The system will support:

- Students asking questions about SWD392 course materials.
- Lecturers uploading and managing course documents.
- Retrieval-Augmented Generation (RAG) answers with citations.
- A backend split across a Java business service and a Python RAG service.
- A Next.js frontend that acts as the browser UI and Backend-for-Frontend (BFF).

## Current Architecture Decisions

| Decision | Choice |
| --- | --- |
| Frontend | Next.js BFF |
| Backend style | Pragmatic microservice architecture |
| Java backend | External Git submodule, integrated through API contracts |
| RAG backend | Python FastAPI service |
| Vector store | PostgreSQL + pgvector |
| Local environment | Docker Compose first |
| Kubernetes | Future production deployment model, not required now |
| CI/CD | GitHub Actions first; Jenkins documented as an alternative |
| Code quality | SonarQube quality gate |
| Security scanning | Trivy for dependencies, containers, and IaC |
| Observability | Prometheus metrics and Grafana dashboards |

## Recommended Reading Order

1. [C4 Diagrams](./c4-diagrams.md) - system overview and service boundaries.
2. [Backend Microservices](./backend-microservices.md) - responsibilities and API ownership.
3. [RAG and Data Architecture](./rag-and-data.md) - document ingestion, retrieval, and storage.
4. [DevSecOps](./devsecops.md) - CI/CD, quality, and security scanning.
5. [Observability](./observability.md) - metrics, dashboards, and future alerts.
6. [Deployment Roadmap](./deployment-roadmap.md) - local first, Kubernetes later.
7. [Architecture Decision Records](./adr/) - reasons behind major decisions.

## Glossary

| Term | Meaning |
| --- | --- |
| BFF | Backend-for-Frontend. A server layer optimized for the frontend's needs. |
| RAG | Retrieval-Augmented Generation. The LLM answers using retrieved source content. |
| pgvector | PostgreSQL extension for storing and searching vector embeddings. |
| CI/CD | Continuous Integration and Continuous Delivery or Deployment. |
| Quality gate | A pass/fail policy for code quality and test health. |
| SLI | Service Level Indicator, such as latency or error rate. |
| SLO | Service Level Objective, the target value for an SLI. |
| ADR | Architecture Decision Record, a short document explaining one decision. |

## Non-Goals For The Current Phase

- Do not implement application code yet.
- Do not write Kubernetes manifests yet.
- Do not require Jenkins unless the team later chooses it explicitly.
- Do not split the backend into many small services before the core domain is stable.
- Do not introduce a separate vector database unless pgvector becomes a measured bottleneck.
