# Security Stack Setup

This guide covers setting up the credentials for SonarQube Cloud (SonarCloud) and installing the Trivy scanner locally.

## 1. SonarQube Cloud Setup

Since this project uses SonarQube Cloud rather than a self-hosted instance, no local databases or containers are required.

To connect your project:
1. Log in to [SonarCloud](https://sonarcloud.io/).
2. Import your repository or select your organization.
3. Obtain your **Organization Key** and **Project Key**.
4. Generate a **SonarCloud User Token** from your account settings under **My Account > Security > Tokens**.

## 2. GitHub Secrets Configuration

Add these variables to your GitHub Repository Settings under **Settings > Secrets and variables > Actions**:

- **Secrets**:
  - `SONAR_TOKEN`: (Your SonarCloud token)
- **Variables**:
  - `SONAR_ORGANIZATION`: (Your SonarCloud organization key)
  - `SONAR_PROJECT_KEY`: (Your SonarCloud project key)
  - `SONAR_HOST_URL`: `https://sonarcloud.io`

## 3. Local Trivy CLI Installation

Trivy runs locally to scan the repository filesystem and Docker configurations:

### macOS (Homebrew)
```bash
brew install aquasecurity/trivy/trivy
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo gpg --dearmor -o /usr/share/keyrings/trivy.gpg
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy
```

### Run via Docker
```bash
docker run --rm -v $(pwd):/workspace -w /workspace aquasec/trivy:latest fs .
```
