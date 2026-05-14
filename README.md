# ContextFlow

ContextFlow is a standalone, public-safe RAG (Retrieval-Augmented Generation) knowledge assistant showcase built with Next.js, FastAPI, PostgreSQL + pgvector, and OpenAI APIs. It demonstrates manual ingestion, chunking, embeddings, semantic retrieval, and grounded answers with sources.

This is a portfolio/reference project. It is not a production SaaS platform.

## Why This Project Exists
- Demonstrate practical RAG system architecture end-to-end
- Showcase fullstack engineering and API-driven design
- Show PostgreSQL + pgvector vector search patterns in a clean, reviewable repo
- Provide a public-safe project for interviews and walkthroughs

## What This Project Demonstrates
- Fullstack engineering (Next.js UI + FastAPI backend)
- Python/FastAPI backend architecture (models, schemas, services, thin routes)
- PostgreSQL + pgvector (vector storage + cosine similarity search)
- Embedding and retrieval workflows (indexing, top-K retrieval)
- Grounded answer generation (answers constrained to retrieved context + sources)
- RAG system design and tradeoffs (scope, guardrails, public safety)
- Clean public-safe documentation and demo-friendly UX

## Core Features
- Manual sources + documents (no uploads/crawling)
- Deterministic chunking + re-indexing (replaces old chunks)
- OpenAI embeddings (`text-embedding-3-small`) stored in pgvector
- Semantic retrieval (cosine similarity, top-K)
- Grounded answer generation using retrieved chunks (answer + sources)
- Ask sessions saved for demo visibility (retrieval-only or answered)

## Tech Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI, SQLAlchemy
- Database: PostgreSQL + pgvector
- AI: OpenAI embeddings + OpenAI chat completions
- Local dev: Docker Compose

## Architecture Overview
```
Next.js UI
  -> FastAPI REST API
     -> PostgreSQL + pgvector
     -> Chunking Service
     -> Embedding Service (OpenAI)
     -> Retrieval Service (pgvector cosine similarity)
     -> Answer Generation Service (OpenAI, grounded)
```

## Demo Flow
1. Create a knowledge source
2. Add a manual text document
3. Index the document into chunks
4. Generate embeddings
5. Ask a question
6. Retrieve relevant chunks
7. Generate a grounded answer
8. Review retrieved sources

## RAG Flow Overview (In This Repo)
- Ingest: manual source + document creation
- Index: chunk -> embed -> store (pgvector)
- Retrieve: question -> embed -> top-K chunks
- Answer: generate response constrained to retrieved context + sources

## Screenshots
Add images to `docs/screenshots/` and reference them here.
- Dashboard
- Sources
- Document detail (chunks + embeddings)
- Ask Assistant (answer + retrieved chunks)
- Architecture

## Local Development (Docker)
Prereqs:
- Docker Desktop
- An OpenAI API key (required for embeddings and answer generation)

1) Provide `OPENAI_API_KEY`
- macOS/Linux: `export OPENAI_API_KEY="..."`
- PowerShell: `$env:OPENAI_API_KEY="..."`
Or create `apps/api/.env` from `apps/api/.env.example` and set `OPENAI_API_KEY` there (do not commit it).

2) Start services
```bash
docker compose up --build
```

3) Open the app
- Web: `http://localhost:3000`
- API health: `http://localhost:8000/health`

Optional demo content:
- Set `SEED_DEMO_DATA=true` in `apps/api/.env.example` (or environment) to add safe demo sources/documents.

## Environment Variables
Backend (`apps/api/.env.example`):
- `OPENAI_API_KEY` (required for indexing, retrieval, and answer generation)
- `EMBEDDING_MODEL` (default: `text-embedding-3-small`)
- `CHAT_MODEL` (default: `gpt-4o-mini`)
- `DATABASE_URL` (Docker Compose sets this automatically for containers)
- `SEED_DEMO_DATA` (optional)

Frontend (`apps/web/.env.example`):
- `NEXT_PUBLIC_API_URL` (used by Next.js to proxy `/api/*` to the FastAPI service)

## Docker Setup Notes
- The web app proxies `/api/*` to the FastAPI container via Next.js rewrites.
- Do not commit real API keys. Use env vars locally.

## API Endpoint Summary
- Health: `GET /health`
- Stats: `GET /stats`
- Sources: `GET/POST/PATCH/DELETE /sources`
- Documents: `GET/POST/PATCH/DELETE /documents`
  - Index: `POST /documents/{id}/index`
  - Chunks: `GET /documents/{id}/chunks`
- Retrieval (semantic): `POST /retrieve`
- Ask (grounded answer): `POST /ask`
- Ask sessions: `GET /ask-sessions`, `GET /ask-sessions/{id}`

## Project Status
- Launch-ready showcase; ongoing polish in Phase 6 (UI, docs, screenshots).

## MVP Boundaries
- Manual text input only in the MVP
- OpenAI API key required for embeddings and answer generation
- No authentication
- No billing
- No file uploads
- No website crawling
- No WordPress sync
- No private business/client data

## Future Improvements
- Add migrations (Alembic) for schema evolution
- Add richer metadata + filtering (tags, source filters)
- Add evaluation tooling (retrieval quality checks)
- Add optional local embeddings/LLMs

## Public-Safe Disclaimer
This repo contains only generic demo content and public-safe code. Do not add private client data, proprietary code, or confidential prompts.

## Docs
- `docs/PROJECT_OVERVIEW.md`
- `docs/TECH_STACK.md`
- `docs/SCOPE_GUARDRAILS.md`
- `docs/ARCHITECTURE.md`
- `docs/RAG_MODEL.md`
- `docs/DEVELOPMENT_PHASES.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/PORTFOLIO_COPY.md`
