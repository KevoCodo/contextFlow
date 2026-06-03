# ContextFlow Architecture Diagram

```
Next.js UI
  -> FastAPI REST API
     -> PostgreSQL + pgvector
     -> Chunking Service
     -> Embedding Service
     -> Retrieval Service
     -> Answer Generation Service
```

## Notes
- Manual text ingestion only (no uploads/crawling).
- Indexing creates chunks + embeddings.
- Retrieval uses pgvector cosine similarity over chunk embeddings, with top-K and optional source filtering.
- Retrieval-only mode returns chunks and scores without chat completion.
- Answer generation is grounded in retrieved chunks.
