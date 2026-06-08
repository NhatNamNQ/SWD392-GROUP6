# Repository Guidelines

## Project Structure & Module Organization

This folder is a small FastAPI service for the RAG pipeline. `main.py` boots the app and wires routers from `routers/`. Shared infrastructure code lives in `core/` (`config.py`, `database.py`), database models are in `models/`, and request-processing logic is in `services/`. The service reads document files from the sibling `OrbitDocs-backend/` workspace during indexing, so keep that folder available when testing locally.

## Build, Test, and Development Commands

Use a Python virtual environment in this folder and install dependencies from `requirements.txt`:

- `pip install -r requirements.txt` installs the runtime packages.
- `uvicorn main:app --reload` starts the API in development mode.
- `python main.py` is not the normal entrypoint; prefer Uvicorn so reload and ASGI behavior work correctly.
- `curl http://localhost:8000/health` is a quick smoke check after startup.

## Coding Style & Naming Conventions

Follow standard Python style: 4-space indentation, `snake_case` for functions and variables, and `PascalCase` for classes and Pydantic models. Keep router modules focused by feature, such as `routers/chat.py` and `routers/indexer.py`. Match the existing naming pattern when adding services, for example `document_parser.py` or `webhook.py`.

## Testing Guidelines

There is no dedicated automated test suite in this folder yet. When adding behavior, prefer focused tests under a future `tests/` directory and verify the service manually with the `/health`, `/api/index`, and `/api/chat` endpoints. If you change indexing logic, confirm the file path resolution against `../OrbitDocs-backend/`.

## Commit & Pull Request Guidelines

Use concise, conventional-style commits such as `feat(rag): ...` or `fix: ...`. Keep each commit scoped to one change. Pull requests should describe the API or indexing behavior changed, note any new environment variables, and include example requests or responses when endpoints change.

## Security & Configuration Tips

Do not commit secrets or local environment files. `core/config.py` expects values like `GEMINI_API_KEY`, `DATABASE_URL`, and `JAVA_BACKEND_URL` from the environment. Review path handling carefully before changing document storage or webhook destinations.
