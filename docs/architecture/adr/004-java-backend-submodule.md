# ADR-004: Keep Java Backend As A Separate Service Boundary

## Status

Accepted

## Context

The Java backend is developed inside this repository at `OrbitDocs-backend/`,
but it still needs a clear boundary from the frontend and Python RAG service.

## Decision

Treat the Java backend as a separate Spring Boot service with API-contract based
integration.

## Consequences

- The Java service remains independently buildable and reviewable.
- Java internals stay behind HTTP/API contracts.
- Frontend and Python services depend on stable HTTP/API contracts, not Java
  implementation details.
