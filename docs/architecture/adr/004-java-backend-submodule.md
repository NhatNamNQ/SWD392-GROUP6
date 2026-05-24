# ADR-004: Treat Java Backend As External Submodule

## Status

Accepted

## Context

The Java backend will come from another GitHub repository.

## Decision

Treat the Java backend as an external Git submodule with API-contract based
integration.

## Consequences

- This repository pins the Java backend to a reviewed commit.
- Java internals remain owned by the external backend team.
- Frontend and Python services depend on stable HTTP/API contracts, not Java
  implementation details.
