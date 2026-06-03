# Architecture

## High-level system architecture
The system is a small, well-separated RAG pipeline exposed via a web UI and a REST API.

### Text-based diagram
```
Browser / Next.js UI
  -> FastAPI REST API
     -> PostgreSQL + pgvector
     -> Embedding service
     -> Retrieval service
     -> Answer generation service
```

## Frontend responsibilities (Next.js)
- Manual knowledge entry UI (create/update a knowledge document)
- Ask UI (submit questions, choose source scope, set top-K, choose retrieval-only or answer mode)
- Basic UX around ingestion/indexing status (draft / indexed / failed)
- Display retrieved chunks and source attribution clearly

## Backend responsibilities (FastAPI)
- Validate and persist knowledge documents and chunks
- Run chunking logic for manually entered text
- Orchestrate embedding creation (OpenAI embeddings behind a service boundary)
- Perform retrieval queries against pgvector (cosine similarity)
- Return grounded responses (answer + sources) using retrieved context

## Database responsibilities (PostgreSQL + pgvector)
- Store documents and chunks with metadata
- Store embeddings per chunk in a vector column
- Support similarity search (top-K nearest neighbors) and basic filtering

## Embedding service responsibilities
- Convert chunk text into embedding vectors (OpenAI embeddings)
- Enforce consistent embedding model + dimensionality across the dataset
- Handle transient provider failures and mark failures explicitly

## Retrieval service responsibilities
- Accept a query string
- Create a query embedding (OpenAI embeddings)
- Apply optional source filtering
- Retrieve top-K relevant chunks using pgvector similarity search (cosine similarity)
- Return chunks + source/document metadata for attribution

## Answer generation responsibilities
- Compose a prompt from: user question + retrieved context + constraints
- Generate an answer that cites sources (document/chunk IDs)
- Provide "I don't know" behavior when retrieval is insufficient
- Skip chat completion entirely for retrieval-only mode

## Suggested API flow (conceptual)
1. `POST /sources` (manual grouping)
2. `POST /documents` (manual text)
3. `POST /documents/{id}/index` (chunk + embed + store)
4. `POST /retrieve` (semantic retrieval: question -> source-filtered top-K chunks)
5. `POST /ask` (retrieval-only or grounded answer generation using retrieved chunks)
