# Security Hardening Checklist

## Network

- **GitHub Actions Integration**: Use repository secrets for token storage, and restrict access to trusted self-hosted or GitHub-hosted runners.
- **SonarQube Cloud Access**: Use the hosted SonarQube Cloud UI over HTTPS and keep project membership limited to the team that needs scan results.

## Identity & Credentials

- **Least Privilege**: Avoid using root tokens. Create distinct users and tokens scoped only to the specific projects or workflows.
- **Secrets Management**: Never commit actual API keys, passwords, or Sonar tokens to git. Use environment files (.env) locally and repository secrets in CI/CD.

## SonarQube Cloud

- **Dedicated Tokens**: Generate a separate token for each repository or CI pipeline.
- **Token Rotation**: Establish a regular rotation schedule (e.g. every 90 days) for all CI/CD SonarQube tokens.
- **Least Access**: Limit organization and project permissions so only maintainers can change quality gates or administration settings.
- **Project Scope**: Keep this repository on one repo-level project unless service boundaries become operationally independent.

## Trivy Scans

- **Security Gates**: Enforce pipeline failure on `HIGH` or `CRITICAL` findings.
- **Target Boundaries**: Ensure scanning includes the local source tree, Dockerfiles, and any Helm/Kubernetes/Terraform configurations before deploying to production.
