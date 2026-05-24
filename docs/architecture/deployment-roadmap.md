# Deployment Roadmap

The project should progress from simple local development to production-like
deployment practices. Kubernetes is valuable for learning, but it should not be
implemented until the team chooses a concrete target environment.

## Stage 1: Local Development

Use Docker Compose for local development.

Goals:

- Run frontend, Java backend, Python backend, and PostgreSQL locally.
- Keep environment setup simple for every team member.
- Use `.env.example` when implementation starts.
- Avoid cloud dependencies in the first development loop.

## Stage 2: CI/CD And Quality Gates

Use GitHub Actions for pull request checks.

Goals:

- Test each service independently.
- Run SonarQube quality checks.
- Run Trivy security scans.
- Build service images after checks pass.

## Stage 3: Production-Like Deployment Design

Before writing Kubernetes manifests, decide:

- Target platform: local Kind/Minikube, AWS EKS, Azure AKS, Google GKE, or another platform.
- Container registry.
- Secrets management strategy.
- Ingress or gateway strategy.
- Database hosting model.
- Observability hosting model.

## Stage 4: Kubernetes Implementation

Only after Stage 3 decisions are made, create Kubernetes or Helm resources for:

- Deployments.
- Services.
- Ingress or Gateway API.
- ConfigMaps.
- Secrets or external secret references.
- Readiness and liveness probes.
- Resource requests and limits.
- Horizontal Pod Autoscaler where useful.
- Prometheus scrape annotations or ServiceMonitor resources.

## Recommendation

Do not implement Kubernetes in the current architecture-only phase. Document it,
teach it, and keep the project structure ready for it. Implement it when the
team has working services and a selected target environment.
