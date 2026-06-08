# DevSecOps Security Tooling

![SonarQube Cloud](https://img.shields.io/badge/SonarQube%20Cloud-Code%20Quality-4E9BCD?logo=sonarqube&logoColor=white)
![Trivy](https://img.shields.io/badge/Trivy-Vulnerability%20Scanner-1904DA?logo=aqua&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Security%20Gate-2088FF?logo=githubactions&logoColor=white)

This folder contains documentation and scanning policies for the security verification pipeline in the `SWD392` project.

## Folder Structure

```text
security/
  ├── SETUP.md                 # Setup guide for SonarCloud secrets and local Trivy
  ├── HARDENING.md             # Security checklists and best practices
  ├── README.md                # This file
  ├── sonarqube/
  │   ├── README.md            # SonarQube Cloud credentials and CLI execution
  │   └── sonar-project.properties.example
  └── trivy/
      ├── README.md            # Trivy command-line instruction guide
      └── trivy.yaml.example   # Trivy configuration settings
```

## Architecture

```mermaid
flowchart TB
  subgraph LocalDev[Local Development]
    trivy_local[Trivy CLI Scan]
  end

  subgraph CI[GitHub Actions]
    build[Build FE/BE]
    sonar[Sonar analysis]
    trivy[Trivy scan]
    build --> sonar
    build --> trivy
  end

  subgraph Cloud[SaaS Platforms]
    sq[SonarQube Cloud]
  end

  sonar --> sq
```

## Workflow

```mermaid
sequenceDiagram
  participant Dev as Developer
  participant GH as GitHub Actions
  participant SC as SonarQube Cloud
  participant TV as Trivy

  Dev->>GH: push or pull request
  GH->>GH: build backend and frontend
  GH->>SC: run Sonar scan
  SC-->>GH: quality gate result
  GH->>TV: scan filesystem & configurations
  TV-->>GH: vulnerability findings
```

## CI/CD Pipeline Policy

A pipeline run is only successful if the following checks pass:

| Gate | Target | Policy |
|---|---|---|
| Build | Frontend, OrbitDocs-backend | Code compiles with no errors. |
| SonarQube | Source Directories | Quality Gate is computed on SonarCloud and returns PASS. |
| Trivy | Repository Filesystem | No unapproved HIGH or CRITICAL findings. |
| Trivy | Config & IaC | No unapproved configuration misconfigurations. |

For detailed scanner execution guides:
- See [sonarqube/README.md](./sonarqube/README.md) for SonarCloud project tokens and parameters.
- See [trivy/README.md](./trivy/README.md) for local file scan policies.
