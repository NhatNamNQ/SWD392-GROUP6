# DevSecOps Entry Point

This repository keeps the security-first implementation notes under
[`security/`](../../security/README.md).

Use this page as the short index for the CI/CD security structure:

- [Security tooling](../../security/README.md)
- [Architecture DevSecOps](../architecture/devsecops.md)
- [Deployment roadmap](../architecture/deployment-roadmap.md)

## Current priority

Build the CI security foundation first:

1. GitHub Actions
2. SonarQube Cloud
3. Trivy

Later stages such as Argo CD, Kubernetes, and cloud deployment should be added
only after the security gates are stable.
