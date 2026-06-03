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

## Phase 7: UI polish and demo readiness
- Status: completed
- Improve dashboard metrics for sources, documents, chunks, indexed documents, and ask sessions
- Improve source/document list and detail pages with clearer metadata and empty states
- Improve ask and saved session views so grounded answers connect visibly to retrieved chunks
- Keep scope public-safe and avoid new RAG feature work

## Phase 8: Retrieval controls and source filtering
- Status: completed
- Add source filtering for retrieval and ask flows
- Add top-K controls with safe limits
- Add retrieval-only and grounded-answer modes
- Persist retrieval settings on ask sessions for walkthrough/debug visibility
- Display source, document, chunk index, and similarity score in retrieved chunk cards

## Future phases (explicitly out of MVP)
- File upload support (PDF, DOCX, etc.)
- Website crawling support
- WordPress integration
- Local embeddings or open-source model support
