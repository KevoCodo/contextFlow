# Tech Stack

## Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui (component primitives)

## Backend
- Python
- FastAPI
- Pydantic (request/response models)
- SQLAlchemy (ORM)
- Alembic (migrations; likely added later)

## Database
- PostgreSQL
- pgvector (vector column + similarity search)

## RAG / AI layer (current)
- Embeddings provider: OpenAI embeddings (`text-embedding-3-small`)
- Chunking: server-side utilities to split text into retrieval-friendly segments
- Retrieval: pgvector similarity search (cosine similarity, top-K)
- Grounding format: answer + sources (retrieved chunk references)

## Local development
- Docker Compose (PostgreSQL + pgvector, backend, frontend)
- Makefile or npm scripts (optional convenience; add later if useful)

## Future optional AI integration layer
- Answer generation service (LLM) that consumes retrieved context (implemented in a minimal, grounded form)
- Provider-agnostic design to support:
  - OpenAI chat completions
  - Local embeddings/LLMs (e.g., via Ollama) as a future extension

## Why Python/FastAPI for this RAG project
- Python has the strongest ecosystem for embeddings, chunking, and evaluation tooling
- FastAPI is lightweight, fast to iterate on, and encourages typed, well-defined APIs
- Clear separation between web/API concerns and RAG domain logic keeps the project reviewable
