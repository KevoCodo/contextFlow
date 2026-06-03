# Portfolio Copy

## Short project summary
ContextFlow is a standalone RAG knowledge assistant that demonstrates manual document ingestion, deterministic chunking, OpenAI embeddings, pgvector semantic retrieval, source filtering, retrieval-only inspection, and grounded answer generation using Next.js, FastAPI, PostgreSQL, pgvector, and OpenAI APIs.

## Resume bullet options
- Built a standalone RAG knowledge assistant using Next.js, FastAPI, PostgreSQL, pgvector, and OpenAI APIs.
- Implemented manual knowledge ingestion, text chunking, embedding storage, source-filtered vector retrieval, and grounded answer generation.
- Designed a public-safe AI system architecture demonstrating retrieval-augmented generation and fullstack engineering practices.

## Interview walkthrough outline
1. Domain model: sources, documents, chunks, ask sessions
2. Indexing pipeline: chunk -> embed -> store
3. Retrieval controls: source scope, top-K, retrieval-only inspection
4. Retrieval: question embedding -> pgvector similarity search -> ranked chunks
5. Grounding: answer generation constrained to retrieved context + sources
6. Guardrails: public-safe scope, no uploads/crawling/auth/billing

## LinkedIn post draft (concise)
I shipped **ContextFlow**, a standalone RAG knowledge assistant showcase that I built to demonstrate practical RAG architecture end-to-end.

It includes:
- Manual knowledge ingestion + deterministic chunking
- OpenAI embeddings stored in PostgreSQL via pgvector
- Source-filtered semantic retrieval, top-K controls, retrieval-only mode, and grounded answers with sources

Stack: Next.js + TypeScript + Tailwind, FastAPI + SQLAlchemy, PostgreSQL + pgvector, OpenAI APIs.

This is a public-safe portfolio project (no uploads/crawling, no auth/billing, no private data). Repo link: <add link>
