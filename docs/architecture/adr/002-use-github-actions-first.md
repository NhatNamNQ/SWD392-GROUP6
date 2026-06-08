# ADR-002: Use GitHub Actions First

## Status

Accepted

## Context

The project is GitHub-based and the Java backend will be integrated as a Git
submodule from another GitHub repository.

## Decision

Use GitHub Actions as the primary CI/CD reference. Document Jenkins as an
enterprise alternative, not as the default. SonarQube Cloud analysis also runs
from GitHub Actions so quality feedback stays close to pull requests.

Security tooling notes live under [`security/`](../../../security/README.md).

## Consequences

- Pull request checks live close to code review.
- The team avoids operating Jenkins during the planning phase.
- The same logical stages can be ported to Jenkins later if required.
