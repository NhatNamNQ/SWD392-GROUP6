# Java Backend Submodule

This directory is reserved for the Java backend Git submodule.

## Responsibility

The Java backend owns the stable business API:

- Authentication integration.
- User/session metadata.
- Course and chapter management.
- Document metadata and indexing status.
- Chat session history.
- Internal API contract with the Python RAG service.

## Submodule Rule

The Java backend will come from another GitHub repository. When implementation
starts, add it as a Git submodule and pin it to reviewed commits.

This repository should integrate with the Java backend through HTTP/API
contracts, not Java implementation details.

See:

- [Backend Microservices](../../docs/architecture/backend-microservices.md)
- [ADR-004: Treat Java Backend As External Submodule](../../docs/architecture/adr/004-java-backend-submodule.md)
