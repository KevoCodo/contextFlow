# Repository Audit Report

Audit performed for `feature/interview-demo-readiness`.

## Current Architecture

ContextFlow is a small monorepo with:

- Next.js, React, TypeScript, and Tailwind CSS in `apps/web`
- FastAPI, SQLAlchemy, and service-layer Python code in `apps/api`
- PostgreSQL with pgvector through Docker Compose
- OpenAI embeddings for chunk and query vectors
- OpenAI chat completions for grounded answers

The core data model is `KnowledgeSource -> KnowledgeDocument -> KnowledgeChunk`, plus `AskSession` for saved retrieval/ask runs.

## Existing Demo Flow

1. Create a source.
2. Create a manual text document.
3. Index the document into chunks and embeddings.
4. Ask a question.
5. Compare retrieval-only mode with grounded-answer mode.
6. Adjust top-K and source filter.
7. Review retrieved chunks and saved ask sessions.

## Documentation Gaps

- README needed more trainer/reviewer-oriented explanation.
- Workshop, lab, troubleshooting, and interview demo guides were missing.
- Screenshot instructions were placeholders.
- Launch checklist was not verified.
- Frontend `.env.example` was referenced but missing.

## Setup Risks

- Missing or invalid `OPENAI_API_KEY` blocks indexing, retrieval, and grounded answers.
- Ports `3000`, `8000`, and `5432` can conflict with local services.
- Docker Desktop must be running.
- Seed data creates draft documents only; documents still require indexing.
- Backend local checks required test/lint dependencies that were not declared.

## Demo Failure Risks

- Asking before indexing returns no useful retrieval results.
- Source filtering can exclude the relevant source.
- Top-K can be set too low for multi-chunk evidence.
- Provider rate limits or timeouts can interrupt indexing or answer generation.
- Stale Docker volumes can leave confusing old demo data.

## Inaccurate or Outdated Documentation

- README referenced `apps/web/.env.example`, which did not exist.
- README screenshot section implied images could be referenced before files were present.
- Seed data needed clearer wording: it creates source/document records but does not precompute embeddings.

## Missing Tests or Verification Steps

- No backend tests were present.
- No backend lint command was present.
- No frontend type-check command was present.
- No documented command list covered Docker config/build and local checks end to end.

## UI Confusion Risks

- Source status can remain `draft` even when some documents under it are indexed.
- Seeded documents appear as draft until explicitly indexed.
- Retrieval results require explanation that scores are ranking signals, not correctness percentages.
- Grounded answers should be compared with retrieved chunks instead of trusted automatically.

## Behavior and Documentation Mismatches

- The implemented RAG flow matches the high-level docs.
- The main mismatch was the missing frontend env example and over-broad seed-data wording.
- The health endpoint is an API liveness check, not a deep database/provider readiness check.

## Secrets and Public-Safety Review

- `.gitignore` excludes `.env`, `.env.*`, dependency folders, build outputs, Python caches, and pytest cache.
- Example env files contain placeholders only.
- No real API keys or sensitive values were found in inspected tracked files.
