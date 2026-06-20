# Frontend/BFF Phase Handoff

## Scope Completed
- Phase 1: auth login and force-change-password contract alignment.
- Phase 2: admin/users/roles contract normalization.
- Phase 3: course create status alignment.
- Phase 4: teacher document upload server-side gate.
- Phase 5: chat session role normalization.

## Final State
- The FE/BFF routes covered by the current plan now mirror the Java backend contracts that were observable in this repo.
- Remaining caveats are external-runtime or backend-contract blockers, not missing FE routes.

## Remaining Blockers
- `AUTH-001` in [docs/frontend-bff-blockers.md](./frontend-bff-blockers.md): backend still omits `tempToken` on forced password-change login.
- `RAG-001` in [docs/frontend-bff-blockers.md](./frontend-bff-blockers.md): chat indexing and answer generation still depend on an Ollama-compatible embedding endpoint.

## Verification Summary
- Frontend route-level tests were added for the touched auth/admin/course/document/chat surfaces.
- `npm --prefix frontend run precheck` passed after the phase work.
- Each code change was validated against the Java contract before commit.

## Commit Trail
- `2550d90` `fix(frontend): align auth and admin contracts with java backend`
- `f747f41` `fix(frontend): mirror java course create status`
- `7cca52b` `fix(frontend): enforce teacher upload gate`
- `614d20b` `fix(frontend): normalize chat session roles`

## Next Action
- If backend/runtime work is resumed, start with `AUTH-001` or `RAG-001`.
- If FE work resumes later, re-run the matrix in [docs/frontend-bff-contract-matrix.md](./frontend-bff-contract-matrix.md) against the current backend snapshot first.
