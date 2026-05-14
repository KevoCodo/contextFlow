# Portfolio Copy

## Short project summary
ContextFlow is a standalone RAG knowledge assistant that demonstrates manual document ingestion, deterministic chunking, OpenAI embeddings, pgvector semantic retrieval, and grounded answer generation using Next.js, FastAPI, PostgreSQL, pgvector, and OpenAI APIs.

## Resume bullet options
- Built a standalone RAG knowledge assistant using Next.js, FastAPI, PostgreSQL, pgvector, and OpenAI APIs.
- Implemented manual knowledge ingestion, text chunking, embedding storage, vector retrieval, and grounded answer generation.
- Designed a public-safe AI system architecture demonstrating retrieval-augmented generation and fullstack engineering practices.

## Interview walkthrough outline
1. Domain model: sources, documents, chunks, ask sessions
2. Indexing pipeline: chunk -> embed -> store
3. Retrieval: question embedding -> pgvector similarity search -> top-K chunks
4. Grounding: answer generation constrained to retrieved context + sources
5. Guardrails: public-safe scope, no uploads/crawling/auth/billing

## LinkedIn post draft (concise)
I shipped **ContextFlow**, a standalone RAG knowledge assistant showcase that I built to demonstrate practical RAG architecture end-to-end.

It includes:
- Manual knowledge ingestion + deterministic chunking
- OpenAI embeddings stored in PostgreSQL via pgvector
- Semantic retrieval (top-K) and grounded answers with sources

Stack: Next.js + TypeScript + Tailwind, FastAPI + SQLAlchemy, PostgreSQL + pgvector, OpenAI APIs.

This is a public-safe portfolio project (no uploads/crawling, no auth/billing, no private data). Repo link: <add link>

