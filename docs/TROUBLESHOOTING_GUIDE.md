# Troubleshooting Guide

This trainer-facing guide supports live ContextFlow workshops and interview demos.

## CLEAR

- **Confirm the expected and actual result:** state what should have happened and what happened instead.
- **Locate the failing system layer:** browser, Next.js, FastAPI, OpenAI provider, PostgreSQL, pgvector, Docker, or local environment.
- **Examine the smallest reproducible step:** isolate one request, command, screen, or container.
- **Apply the lowest-risk correction:** restart one service, fix one env var, or retry one action before resetting everything.
- **Reinforce the learning:** explain what the failure teaches about RAG systems or full-stack AI apps.

Stop the entire workshop when the instructor machine, shared API key, database image, or network dependency is failing for everyone. Support one participant individually when their issue is local to their laptop, ports, browser state, copied command, or environment file.

Safety note: `docker compose config` expands values from local env files. Do not paste its output into public issues, slides, or recordings when `apps/api/.env` contains a real API key.

## Common Problems

### Missing OpenAI API Key

- Visible symptom: indexing, retrieval, or ask returns `OPENAI_API_KEY is not set`.
- Likely cause: `OPENAI_API_KEY` is blank or absent.
- First diagnostic check: inspect `apps/api/.env` or the shell environment used by Docker.
- Resolution: set `OPENAI_API_KEY`, then restart the API container.
- Safe workshop fallback: use screenshots or explain retrieval flow from already captured examples.
- Instructor explanation: embeddings and grounded answers require external API calls; the app starts without a key so setup problems are visible and recoverable.

### Invalid OpenAI API Key

- Visible symptom: OpenAI request fails during indexing or answer generation.
- Likely cause: invalid, expired, or unauthorized key.
- First diagnostic check: verify the key in the provider dashboard and confirm it was copied without spaces.
- Resolution: replace the key and restart the API container.
- Safe workshop fallback: continue with architecture and chunking explanation, or use prepared screenshots.
- Instructor explanation: provider authentication is outside the app but must be handled clearly by the service layer.

### Environment Variable Not Loaded

- Visible symptom: the app behaves as though a configured value is missing.
- Likely cause: `.env` created in the wrong folder or container not restarted.
- First diagnostic check: confirm `apps/api/.env` exists and Docker Compose was restarted after edits.
- Resolution: update the correct `.env` file and recreate the affected container.
- Safe workshop fallback: run the demo from the instructor machine.
- Instructor explanation: environment variables are read at process startup.

### Docker Desktop Not Running

- Visible symptom: `docker compose up` cannot connect to Docker.
- Likely cause: Docker engine is stopped.
- First diagnostic check: open Docker Desktop and confirm engine status.
- Resolution: start Docker Desktop and rerun the command.
- Safe workshop fallback: pair the participant with someone whose environment is running.
- Instructor explanation: Compose orchestrates services, but it depends on the local Docker engine.

### Docker Build Failure

- Visible symptom: Compose fails while building `api` or `web`.
- Likely cause: network issue, dependency download failure, stale cache, or incompatible local files.
- First diagnostic check: identify which service failed in the build output.
- Resolution: retry once, then run `docker compose build --no-cache` if needed.
- Safe workshop fallback: use a prebuilt instructor environment.
- Instructor explanation: container builds make demos repeatable, but dependency downloads still depend on local network conditions.

### Port 3000 Already In Use

- Visible symptom: web service cannot bind to `0.0.0.0:3000`.
- Likely cause: another Next.js app or process is using port 3000.
- First diagnostic check: run `netstat -ano | findstr :3000` on Windows.
- Resolution: stop the conflicting process or change the host port mapping.
- Safe workshop fallback: participant watches the instructor demo.
- Instructor explanation: the container port is fine; the host port is already occupied.

### Port 8000 Already In Use

- Visible symptom: API service cannot bind to `0.0.0.0:8000`.
- Likely cause: another API process is using port 8000.
- First diagnostic check: run `netstat -ano | findstr :8000`.
- Resolution: stop the process or change the API host port mapping.
- Safe workshop fallback: use the instructor API endpoint locally only if appropriate.
- Instructor explanation: web-to-API routing depends on the API service being reachable.

### Port 5432 Already In Use

- Visible symptom: Postgres service cannot bind to `0.0.0.0:5432`.
- Likely cause: local Postgres is already running.
- First diagnostic check: run `netstat -ano | findstr :5432`.
- Resolution: stop local Postgres or change the Compose host port.
- Safe workshop fallback: use a participant machine without local Postgres conflict.
- Instructor explanation: the database can run inside Docker, but the host port may conflict with local tools.

### Database Container Unavailable

- Visible symptom: API healthcheck retries or API logs show database connection errors.
- Likely cause: Postgres is still starting, unhealthy, or credentials/URL mismatch.
- First diagnostic check: run `docker compose ps`.
- Resolution: wait for health, inspect Postgres logs, then restart Compose.
- Safe workshop fallback: use screenshots while the database restarts.
- Instructor explanation: the API depends on a healthy database before it can initialize schema.

### pgvector Extension Failure

- Visible symptom: API logs mention `CREATE EXTENSION` or vector column/index failure.
- Likely cause: database image does not include pgvector or extension creation failed.
- First diagnostic check: confirm Compose uses `pgvector/pgvector:pg16`.
- Resolution: rebuild with the configured image and reset the volume if schema is inconsistent.
- Safe workshop fallback: explain vector storage concept from docs.
- Instructor explanation: pgvector adds vector types and similarity operators to PostgreSQL.

### Web App Cannot Reach API

- Visible symptom: pages show API/proxy errors or fail to load data.
- Likely cause: API container down or `NEXT_PUBLIC_API_URL` points to the wrong host for the runtime.
- First diagnostic check: open `http://localhost:8000/health`.
- Resolution: start API and confirm Compose web env uses `http://api:8000`.
- Safe workshop fallback: use API health and architecture diagram to explain service boundaries.
- Instructor explanation: frontend and backend are separate services.

### API Health Endpoint Fails

- Visible symptom: `/health` does not return status ok.
- Likely cause: API container is not running or failed during startup.
- First diagnostic check: run `docker compose logs api`.
- Resolution: fix the startup error and recreate the API container.
- Safe workshop fallback: continue with frontend screenshots.
- Instructor explanation: health checks are the first layer of demo readiness.

### Dependency Installation Failure

- Visible symptom: `npm install` or `pip install` fails.
- Likely cause: network, incompatible runtime, or corrupted local cache.
- First diagnostic check: confirm Node and Python versions.
- Resolution: retry after fixing runtime version or network access.
- Safe workshop fallback: use Docker build instead of local installs.
- Instructor explanation: Docker reduces but does not remove dependency risk.

### Incorrect Node.js Version

- Visible symptom: frontend install, lint, type check, or build fails with engine/runtime errors.
- Likely cause: Node version below expected level.
- First diagnostic check: run `node --version`.
- Resolution: use Node.js 20+.
- Safe workshop fallback: use Docker Compose for the web service.
- Instructor explanation: frontend tooling is sensitive to Node versions.

### Incorrect Python Version

- Visible symptom: backend dependency install or tests fail.
- Likely cause: Python version below 3.11.
- First diagnostic check: run `python --version`.
- Resolution: use Python 3.11+.
- Safe workshop fallback: use the API container.
- Instructor explanation: backend dependencies and type syntax assume modern Python.

### Document Not Indexed

- Visible symptom: document has `draft` status, zero chunks, or retrieval returns no relevant matches.
- Likely cause: the index action has not been run or failed.
- First diagnostic check: open the document detail page and inspect status/chunks.
- Resolution: click **Index document** after setting a valid API key.
- Safe workshop fallback: use a pre-indexed document from the instructor machine.
- Instructor explanation: retrieval searches chunks, not raw draft documents.

### Empty Retrieval Results

- Visible symptom: ask run returns zero matches.
- Likely cause: no indexed chunks exist or source filter excludes them.
- First diagnostic check: check document chunk counts and selected source filter.
- Resolution: index a document or switch to All Sources.
- Safe workshop fallback: show saved ask sessions if available.
- Instructor explanation: retrieval depends on available embedded chunks.

### Irrelevant Retrieval Results

- Visible symptom: returned chunks do not answer the question.
- Likely cause: weak source content, ambiguous question, or vector similarity mismatch.
- First diagnostic check: inspect top chunks and source titles.
- Resolution: ask a more specific question or improve the document text.
- Safe workshop fallback: use this as the failure-mode discussion.
- Instructor explanation: similarity is ranking, not correctness.

### Source Filter Excludes Relevant Data

- Visible symptom: All Sources works, but filtered retrieval does not.
- Likely cause: selected source does not contain the relevant indexed document.
- First diagnostic check: verify the source title on retrieved chunks or document list.
- Resolution: choose the correct source or index content under that source.
- Safe workshop fallback: clear the filter.
- Instructor explanation: filtering improves focus but can hide needed evidence.

### Top-K Set Too Low

- Visible symptom: answer misses context that exists in lower-ranked chunks.
- Likely cause: top-K returns too few chunks.
- First diagnostic check: rerun with a higher top-K.
- Resolution: compare results at 3, 5, 8, and 10.
- Safe workshop fallback: use top-K as a live teaching moment.
- Instructor explanation: top-K controls context breadth and noise.

### Model Rate-Limit Error

- Visible symptom: provider error during embeddings or chat completion.
- Likely cause: OpenAI rate limit or quota issue.
- First diagnostic check: check provider dashboard and API error timing.
- Resolution: wait, reduce requests, or use a valid key with available quota.
- Safe workshop fallback: continue with retrieval concepts and screenshots.
- Instructor explanation: external AI APIs introduce operational dependencies.

### Provider Timeout

- Visible symptom: request hangs or returns provider failure.
- Likely cause: network latency or provider timeout.
- First diagnostic check: retry a single indexing or ask request.
- Resolution: retry later or reduce document size for the demo.
- Safe workshop fallback: use retrieval-only examples already saved.
- Instructor explanation: latency and reliability are real design constraints.

### Grounded Response Lacks Sufficient Support

- Visible symptom: answer is vague, says it does not know, or seems unsupported by chunks.
- Likely cause: retrieved context is insufficient or prompt constraints are working as intended.
- First diagnostic check: read the retrieved chunks.
- Resolution: improve source content, adjust top-K, or ask a narrower question.
- Safe workshop fallback: discuss why evidence inspection matters.
- Instructor explanation: a grounded system should avoid confident unsupported answers. Retrieved chunks are candidates for inspection; unsupported answers should use `Sources: None` instead of citing irrelevant chunks.

### Seed Data Missing

- Visible symptom: no demo sources appear after startup.
- Likely cause: `SEED_DEMO_DATA` is false or database already had records.
- First diagnostic check: check `apps/api/.env` and existing source count.
- Resolution: set `SEED_DEMO_DATA=true` and reset data if a fresh seed is required.
- Safe workshop fallback: manually create a source and document.
- Instructor explanation: seed data is deterministic but intentionally non-destructive.

### Application State Needs Resetting

- Visible symptom: stale sessions, old documents, or confusing demo data remain.
- Likely cause: the Postgres volume persists across runs.
- First diagnostic check: run `docker volume ls` or inspect `docker compose ps`.
- Resolution: run `docker compose down -v`, then restart.
- Safe workshop fallback: create a clearly named new source for the current demo.
- Instructor explanation: persistent volumes are useful for development but may need reset before workshops.
