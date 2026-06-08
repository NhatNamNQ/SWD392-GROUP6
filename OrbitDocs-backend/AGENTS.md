# Repository Guidelines

## Project Structure & Module Organization

This folder is a standalone Spring Boot backend. Main code lives in `src/main/java/swd392/project/orbitdocsbackend/`, grouped by feature area: `identity/`, `course/`, `document/`, `notification/`, `chat/`, and `shared/`. Configuration, SQL seed data, email templates, and Lua scripts live in `src/main/resources/` (`application.yaml`, `data.sql`, `templates/`, `LuaScripts/`). Tests belong in `src/test/java/`. Treat `uploads/documents/` as runtime content, not a place for new checked-in binaries.

## Build, Test, and Development Commands

Use the Maven wrapper from this directory:

- `./mvnw spring-boot:run` starts the application locally.
- `./mvnw test` runs the JUnit test suite.
- `./mvnw clean package` creates the packaged JAR and clears old build output.
- `./mvnw -q test` is useful for quieter CI-style checks.

## Coding Style & Naming Conventions

This codebase uses Java 21, Spring Boot, Lombok, and MapStruct. Keep package names lowercase, class and enum names in PascalCase, and service interfaces aligned with the existing `I*Service` pattern. Prefer descriptive controller, service, repository, and DTO names that match the feature area, for example `DocumentController`, `CourseRequest`, or `RedisOtpServiceImpl`.

## Testing Guidelines

There is a minimal test footprint today, so add focused tests next to the code they cover under `src/test/java/`. Name tests by behavior or class, such as `AuthServiceImplTest` or `DocumentControllerTest`. Verify changes with `./mvnw test` before opening a PR, and run `./mvnw spring-boot:run` when you need to validate integration flows.

## Commit & Pull Request Guidelines

Recent repository history uses short, conventional-style commits such as `feat(...)`, `fix: ...`, and `chore: ...`. Keep commits scoped to one change. Pull requests should explain what changed, list verification commands, mention schema or config effects, and include screenshots or request/response examples for API changes when helpful.

## Security & Configuration Tips

Do not commit secrets, environment files, or local build output. The backend `.gitignore` already excludes `target/`, IDE metadata, and `.env`. Review `application.yaml` carefully before changing ports, credentials, or external service settings.
