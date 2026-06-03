# ContextFlow Web

This is the Next.js frontend for ContextFlow.

## Responsibilities
- Dashboard and architecture walkthrough screens
- Source and document management UI
- Document indexing trigger and chunk display
- Ask Assistant with source filtering, top-K controls, retrieval-only mode, and grounded-answer mode
- Ask session list/detail views for reviewing saved retrieval settings and retrieved chunks

## Local development
From the repo root, use Docker Compose for the full stack:

```bash
docker compose up --build
```

The web app runs at `http://localhost:3000` and proxies `/api/*` requests to the FastAPI service through `NEXT_PUBLIC_API_URL`.

For project-level setup, architecture, and public-safe boundaries, see the root `README.md` and docs folder.
