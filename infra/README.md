# Infrastructure

This directory is reserved for future infrastructure code and deployment
documentation.

Current decision: **do not implement Kubernetes manifests yet**. The project is
still in architecture and planning. Kubernetes should be introduced only after
the team chooses a concrete target environment.

See:

- [Deployment Roadmap](../docs/architecture/deployment-roadmap.md)
- [DevSecOps](../docs/architecture/devsecops.md)
- [Observability](../docs/architecture/observability.md)

Future infrastructure may include:

- Docker Compose for local development.
- Kubernetes or Helm resources after the target cluster is selected.
- Terraform after cloud/provider decisions are made.
- Prometheus and Grafana deployment resources.
- CI/CD environment documentation.
