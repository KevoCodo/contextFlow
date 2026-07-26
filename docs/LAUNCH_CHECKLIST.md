# Launch Checklist

This checklist should be updated from actual verification, not assumptions.

## Repo Readiness

- [x] README completed and accurate. Note: rewritten for RAG education, demo flow, setup, limitations, and documentation links.
- [x] Docs reviewed and consistent with implementation. Note: audit report, workshop guide, lab guide, troubleshooting guide, and interview demo guide added.
- [x] `.env.example` files present. Note: backend and frontend examples exist; examples contain placeholders only.
- [x] No secrets committed in tracked files. Note: inspected tracked files only; local ignored env files may contain real keys.
- [x] `.gitignore` present and effective for common secrets/artifacts. Note: excludes `.env`, `.env.*`, `node_modules`, `.next`, caches, build outputs, and virtualenvs.
- [x] No generated artifacts intentionally added in this phase. Note: local `node_modules` and `.next` are ignored.

## Local Dev Verification

- [x] Frontend install works. Note: `npm install` completed.
- [x] Frontend lint works. Note: `npm run lint:web` passed.
- [x] Frontend type check works. Note: `npm run typecheck:web` passed.
- [x] Frontend build works. Note: `npm run build:web` passed.
- [ ] Backend dependency install works locally. Note: local `pip install -r apps/api/requirements.txt` was blocked by Python SSL certificate verification against PyPI on this machine.
- [x] Backend dependency install works in Docker. Note: `docker compose build` installed API dependencies in the Python 3.12 image.
- [x] Backend lint works in Docker. Note: `docker run ... python -m ruff check app tests` passed.
- [x] Backend tests work in Docker. Note: `docker run ... python -m pytest` passed.

## Docker Demo Verification

- [x] `docker compose config` validates. Note: command passed; do not share output publicly when local env files contain real keys because Compose expands them.
- [x] `docker compose build` works.
- [x] `docker compose up -d` starts services.
- [x] Postgres starts and healthcheck passes.
- [x] API health works at `http://localhost:8000/health`.
- [x] Web app responds at `http://localhost:3000/dashboard`.
- [x] Root route redirects to `/dashboard`.
- [ ] pgvector extension verified manually in database. Note: API startup attempts `CREATE EXTENSION IF NOT EXISTS vector`; no manual SQL check was run.
- [ ] Indexing works with live OpenAI API key. Note: requires valid key and a manual/indexed document.
- [ ] Retrieval works with live OpenAI API key. Note: requires indexed chunks.
- [ ] Source-filtered retrieval works with expected top-K behavior. Note: covered by validation tests and docs; live AI path still requires indexed chunks.
- [ ] Ask works in both retrieval-only and grounded-answer modes with live OpenAI calls. Note: route behavior tested with mocks; live AI path requires key/quota.
- [ ] Ask sessions show saved mode, source filter, top-K, and retrieved chunks from a live run. Note: UI and route behavior verified by build/tests, but live run still manual.

## OpenAI Setup

- [x] `OPENAI_API_KEY` setup documented.
- [x] `EMBEDDING_MODEL` documented. Default: `text-embedding-3-small`.
- [x] `CHAT_MODEL` documented. Default: `gpt-4o-mini`.
- [x] Missing key behavior documented. Note: app starts, but indexing/retrieval/answer generation fail with explicit messages.
- [ ] Invalid key behavior manually verified. Note: requires intentionally invalid key.
- [ ] No logs leak secrets during normal app requests. Note: tracked code does not log keys; avoid sharing `docker compose config` output.

## Demo Readiness

- [x] Demo content option documented. Note: `SEED_DEMO_DATA=true` creates draft sources/documents.
- [x] Seed behavior documented accurately. Note: seeded documents must still be indexed.
- [x] Empty states reviewed in UI code and documented.
- [x] Loading states reviewed in UI code and documented.
- [x] Failed indexing does not appear successful. Note: backend marks document `failed`; UI displays error message.
- [x] Retrieval-only mode clearly differs from grounded-answer mode.
- [x] Retrieved chunks show source/document/chunk metadata and scores.
- [x] Grounded-answer fallback improved for zero retrieved chunks. Note: returns insufficient-information response without chat completion.
- [ ] Three-minute walkthrough rehearsed. Manual action required.
- [ ] Failure scenario prepared. Manual action required.

## Screenshots

- [x] `docs/screenshots/` exists.
- [x] `docs/screenshots/README.md` lists exact filenames, states, demo data, proof points, and captions.
- [ ] Dashboard screenshot captured. Manual action required.
- [ ] Sources list screenshot captured. Manual action required.
- [ ] Source detail screenshot captured. Manual action required.
- [ ] Document detail with chunks screenshot captured. Manual action requires indexed document and API key.
- [ ] Ask controls screenshot captured. Manual action required.
- [ ] Retrieval-only results screenshot captured. Manual action requires indexed document and API key.
- [ ] Grounded answer with sources screenshot captured. Manual action requires OpenAI key/quota.
- [ ] Ask session detail screenshot captured. Manual action required after an ask run.
- [ ] Architecture screenshot captured. Manual action required.
- [ ] README screenshot links added. Do this only after image files exist.

## Interview Demo Readiness

- [x] Docker demo verified. Note: containers start; health and dashboard verified.
- [ ] Backup screenshots available. Manual capture required.
- [ ] Demo data prepared. Manual action required before live demo.
- [ ] Three-minute walkthrough rehearsed. Manual action required.
- [ ] Retrieval-only example prepared. Manual action requires indexed demo data.
- [ ] Grounded-answer example prepared. Manual action requires OpenAI key/quota.
- [ ] Failure scenario prepared. Manual action required.
- [x] Architecture explanation prepared. Note: README, architecture doc, workshop guide, and interview guide updated.
- [x] Repository links verified for newly added docs. Note: README links point to existing files.
- [x] No sensitive data present in tracked files. Note: ignored local env files were not committed.

## GitHub Metadata

Suggested description:

> ContextFlow is a public RAG knowledge assistant built with Next.js, FastAPI, PostgreSQL, pgvector, and OpenAI APIs.

Suggested topics:

- rag
- fastapi
- nextjs
- pgvector
- postgres
- openai
- embeddings
- vector-search
- ai-engineering
- fullstack

## Launch Notes

- [ ] Capture screenshots after creating and indexing demo data.
- [ ] Review `npm audit` findings before public launch. Note: npm currently reports 1 low and 5 high dependency vulnerabilities.
- [ ] Confirm the final public repository does not include local env files, API keys, screenshots with secrets, or build artifacts.
