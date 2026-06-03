# ContextFlow - Project Overview

## Project name
ContextFlow

## Purpose
Build a focused, public portfolio project that demonstrates a practical retrieval-augmented generation (RAG) system: ingest text, chunk it, embed it, store vectors in PostgreSQL/pgvector, retrieve relevant context, and produce grounded responses with citations.

## Target audience
- Hiring teams and technical reviewers evaluating fullstack + RAG fundamentals
- Developers looking for a clear reference implementation of "RAG done sensibly"

## What this project demonstrates
- RAG system design from first principles (ingestion -> retrieval -> grounded output)
- Modern fullstack engineering with a clean separation of concerns
- Python/FastAPI backend architecture, data modeling, and API design
- Manual text ingestion (public-safe MVP)
- Deterministic text chunking and re-indexing
- OpenAI embeddings stored in PostgreSQL via pgvector
- Semantic retrieval using vector similarity search with source filtering and top-K controls
- Retrieval-only inspection for chunk scores and attribution
- Grounded response patterns (answer + sources) and safe-by-default thinking

## What this project intentionally does not do
- Production SaaS concerns (multi-tenant auth, billing, admin portals, compliance)
- Automated ingestion in the MVP (no file uploads/PDF parsing/OCR/crawling)
- Enterprise integrations in the MVP (no WordPress sync or private connectors)
- "Magic" prompts or hidden proprietary logic

## Public showcase goals
- Keep the scope understandable in one sitting (reviewer-friendly)
- Make tradeoffs explicit (why this design, why these constraints)
- Show end-to-end architecture maturity without overbuilding
- Provide UI screens that support portfolio walkthroughs: what knowledge exists, what has
  been indexed, how chunks are retrieved, and how answers cite retrieved context

## High-level MVP summary
- Manual text entry only (paste or type knowledge)
- Store knowledge as sources, documents, and chunks
- Index documents into embedded chunks for semantic retrieval
- Retrieve chunks across all sources or a selected source
- Return retrieval-only results or grounded outputs with retrieved sources/chunks

## Why this project is public-safe
- No private business data or client content is included or required
- No proprietary prompts or copied internal business logic
- Guardrails prevent risky ingestion sources in early phases
- Designed as a portfolio reference implementation, not an operational product
