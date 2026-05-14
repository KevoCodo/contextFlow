# ContextFlow Architecture Diagram

```
Next.js UI
  -> FastAPI REST API
  -> PostgreSQL + pgvector
  -> Embedding Service
  -> Retrieval Service
  -> Answer Generation Service
```

## Notes
- Manual text ingestion only (no uploads/crawling).
- Indexing creates chunks + embeddings.
- Retrieval uses pgvector cosine similarity over chunk embeddings.
- Answer generation is grounded in retrieved chunks.

