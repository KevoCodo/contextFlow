# Development Phases

## Phase 0: Documentation and alignment
- Define scope, guardrails, architecture, and domain model
- Establish public-safe constraints and what not to build

## Phase 1: Project setup and base app structure
- Status: completed
- Initialize Next.js frontend and FastAPI backend skeletons
- Add Docker Compose for PostgreSQL + pgvector
- Add basic dev scripts and repo structure

## Phase 2: FastAPI backend models and API foundation
- Status: completed
- Define ORM models and migrations
- Create initial REST endpoints for knowledge documents and chunks
- Add structured error handling and basic validation

## Phase 3: Manual knowledge entry and chunking
- Status: completed
- Implement manual knowledge entry endpoints
- Add chunking utilities and store chunk metadata
- Add document/chunk status handling (`draft`, `indexed`, `failed`)

## Phase 4: Embeddings and pgvector retrieval
- Status: completed
- Add embedding provider integration (OpenAI embeddings first)
- Store vectors in pgvector and implement similarity search
- Add retrieval endpoint(s) and source attribution payloads

## Phase 5: Ask assistant UI and grounded answer flow
- Status: completed
- Implement Ask UI
- Display retrieved sources clearly
- Add grounded answer formatting (even before full LLM generation)

## Phase 6: UI polish, README, screenshots, and public showcase cleanup
- Status: completed
- Improve UX, add screenshots/gifs
- Improve docs and developer experience
- Ensure the repository is clean, safe, and reviewable

## Future phases (explicitly out of MVP)
- File upload support (PDF, DOCX, etc.)
- Website crawling support
- WordPress integration
- Local embeddings or open-source model support
