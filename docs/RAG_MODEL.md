# RAG Model

This document defines the core domain concepts used by the MVP RAG pipeline.

## Core concepts

### KnowledgeSource
Logical grouping for documents (e.g., "Personal Notes", "Product Docs"). In the MVP it is used to group manual documents and support basic filtering.

### KnowledgeDocument
A manually entered text unit (title + content). Documents can be indexed into chunks.

### KnowledgeChunk
A segment of a document produced by chunking. Chunks are the unit of indexing (embeddings later) and retrieval.

### AskSession
A lightweight record of a user question and the system's retrieval results/response payload (used for demo visibility).

## Statuses
Initial statuses for documents/chunks:
- `draft`: created/updated but not indexed yet
- `indexed`: chunked and embedded; retrievable
- `failed`: indexing failed; error handled visibly

## Manual text ingestion flow (Phase 3)
1. User submits document title + content
2. Backend stores a `KnowledgeDocument` in `draft`
3. User triggers indexing
4. Backend generates `KnowledgeChunk` records and sets document status to `indexed`

## Chunking behavior (current implementation)
Chunking is deterministic and does not use AI tools:
- Split by paragraph first (blank-line separated)
- Combine paragraphs into chunks targeting ~900 characters (max ~1100)
- Hard-split very long paragraphs by character length
- Preserve chunk order with `chunk_index`
- Store minimal metadata per chunk (e.g., `character_count`)
- Avoid empty chunks

## Embedding flow
1. For each chunk, call the embedding provider with chunk text (OpenAI `text-embedding-3-small`)
2. Store embedding vector on the chunk (pgvector)
3. Mark the document as `indexed` (or `failed` if embedding/indexing fails)

## Retrieval flow
1. User asks a question
2. Create a query embedding (OpenAI `text-embedding-3-small`)
3. Retrieve top-K nearest chunks by vector similarity (pgvector cosine similarity)
4. Return chunk text + document metadata for attribution

## Grounded response flow
- Always structure responses as: `answer` + `sources`
- If retrieval returns no relevant chunks, prefer: "Insufficient information in the knowledge base."
- Never fabricate citations; sources must refer to retrieved chunks/documents

## Source attribution concept
Sources should be explicit and inspectable:
- Document title/ID
- Chunk ID/index
- Similarity score (optional, for transparency)
- Snippet text displayed in the UI
