# Frontend/BFF Blocker Ledger

## AUTH-001: Force-change-password login is blocked by current backend contract
- Flow: `POST /api/auth/login` for lecturer accounts that must change password.
- Current backend behavior: returns `403` with message `You must change your generated password before continuing` but no `tempToken`.
- FE impact: browser cannot proceed to `/force-change-password` because the FE contract needs a bearer token for `POST /api/auth/force-change-password`.
- FE mitigation shipped:
  - BFF login route now returns a clear blocker message instead of a generic auth error.
  - Login UI will surface that message to the user.
- Backend change required to unblock:
  - Return the old `errorCode/tempToken` contract again, or
  - Expose an alternative authenticated force-change flow that does not depend on `tempToken`.

## RAG-001: Document indexing and live chat require an Ollama-compatible embedding endpoint
- Flow:
  - upload document -> Python indexing
  - retrieve chat answer -> Python query embedding + Gemini answer
- Current runtime dependency:
  - `rag-backend/services/chunking.py`
  - `rag-backend/services/embedding.py`
  - `rag-backend/routers/chat.py`
  all call `langchain_ollama.OllamaEmbeddings`.
- FE impact:
  - Java document APIs can still be wired from FE/BFF.
  - End-to-end indexing/chat cannot be claimed ready until an `OLLAMA_BASE_URL`-compatible endpoint exists.
- FE policy:
  - Treat document CRUD/upload as FE-completable.
  - Treat live indexing/chat runtime readiness as environment-blocked, not FE-blocked.
