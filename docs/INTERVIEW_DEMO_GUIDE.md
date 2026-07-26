# Interview Demo Guide

This guide is a concise public-safe reference for presenting ContextFlow.

## 30-Second Project Explanation

ContextFlow is a public-safe RAG knowledge assistant. It shows how a full-stack app can take manual documents, split them into chunks, generate embeddings, store vectors in PostgreSQL with pgvector, retrieve relevant context, and generate source-grounded answers.

## 60-Second Project Explanation

ContextFlow is an educational RAG reference implementation built with Next.js, FastAPI, PostgreSQL, pgvector, and OpenAI APIs. The demo is intentionally small: create a source, add a manual document, index it into chunks and embeddings, ask a question, and compare retrieval-only results with a generated grounded answer. The goal is to make RAG architecture easy to inspect and explain, including where it can fail.

## Three-Minute RAG Explanation

RAG stands for Retrieval-Augmented Generation. A standard chat model answers from its trained parameters and the prompt it receives. A RAG application adds a retrieval step before generation.

First, source documents are split into chunks. Each chunk is sent to an embedding model, which returns a numeric vector representing the chunk's meaning. Those vectors are stored in a vector-search system such as pgvector.

When a user asks a question, the application embeds the question and searches for chunks with similar vectors. The top-K chunks are returned as candidate evidence. In retrieval-only mode, the app shows those chunks directly. In grounded-answer mode, the app passes the question and retrieved chunks to a chat model with instructions to answer only from that context and cite the chunks used.

The important boundary is that RAG improves access to external knowledge, but it does not guarantee correctness. Bad source content, missing chunks, weak retrieval, or overly broad context can still produce poor answers.

## Three-Minute ContextFlow Demonstration

1. Open the dashboard and explain the source-document-chunk model.
2. Open Sources and show that sources group related manual documents.
3. Open or create a document and point out `draft`, `indexed`, and `failed` status.
4. Click **Index document** and explain chunking plus embedding generation.
5. Open Ask and select Retrieval Only.
6. Ask a question answered by the indexed document.
7. Inspect the returned chunks, scores, source title, document title, and chunk ID.
8. Switch to Grounded Answer and ask the same question.
9. Compare the generated answer with the retrieved evidence.
10. Change top-K or source filter to show retrieval tuning.
11. Ask an unsupported question and explain that the fallback uses `Sources: None` while retrieved chunks remain visible as candidates.
12. Open Ask Sessions to show saved debugging context.

## Technical Talking Points

- FastAPI routes are thin and delegate behavior to services.
- SQLAlchemy models keep the relational data model explicit.
- pgvector stores embeddings in PostgreSQL rather than introducing a separate vector database.
- Chunking is deterministic to keep behavior explainable.
- Retrieval-only mode separates search quality from generation quality.
- Provider errors are caught and returned as user-visible setup/runtime messages.
- Saved ask sessions make retrieval settings and source chunks reviewable after a run.

## Business-Value Talking Points

- RAG can connect AI answers to controlled knowledge sources.
- Source inspection supports trust, training, and troubleshooting.
- Retrieval-only mode helps explain why an answer was generated.
- The architecture is understandable to developers and nontechnical stakeholders.
- The demo shows responsible boundaries instead of claiming production readiness.

## Architecture Tradeoffs

- Manual text entry keeps the demo public-safe and avoids ingestion complexity.
- PostgreSQL plus pgvector is simpler for a portfolio demo than a separate vector database.
- No authentication keeps scope focused on RAG mechanics.
- Deterministic chunking is easy to teach but less sophisticated than document-aware parsing.
- Top-K is easy to explain but not a substitute for formal retrieval evaluation.
- External OpenAI APIs improve demo quality but introduce key, quota, latency, and availability dependencies.

## Questions a Developer May Ask

- How are chunks generated?
- Where are embeddings stored?
- How is source filtering applied?
- What validates top-K boundaries?
- How does retrieval-only mode avoid chat completion?
- What happens if indexing fails?
- How would you add migrations or evaluation later?

## Questions a Solution Architect May Ask

- Why use pgvector instead of a dedicated vector database?
- Where are the service boundaries?
- What would change for production security?
- How would this integrate with existing knowledge systems?
- How would you monitor retrieval quality and provider failures?
- What are the cost and latency drivers?

## Questions a Business Stakeholder May Ask

- What kind of content can this answer from?
- How can we see where an answer came from?
- What happens if the knowledge base is incomplete?
- Does this replace human review?
- What would be needed before using private business data?

## Honest Limitations

- Manual text entry only
- No authentication or user management
- No file uploads or crawling
- No cloud deployment or production hardening
- No comprehensive RAG evaluation framework
- Requires an OpenAI API key for embeddings and answer generation
- Source citations improve transparency but do not prove correctness
