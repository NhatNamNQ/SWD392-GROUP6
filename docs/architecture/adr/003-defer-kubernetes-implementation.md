# ADR-003: Defer Kubernetes Implementation

## Status

Accepted

## Context

Kubernetes is useful for production learning, but the team has not selected a
target cluster environment.

## Decision

Do not implement Kubernetes manifests in the current phase. Document Kubernetes
as the future production deployment model.

## Consequences

- The team avoids writing cluster-specific manifests too early.
- Local development remains simpler with Docker Compose.
- Kubernetes design can be added later after services and deployment target are
  known.
