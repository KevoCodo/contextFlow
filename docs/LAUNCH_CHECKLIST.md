# Launch Checklist (Public GitHub)

## Repo readiness
- [ ] README completed and accurate
- [ ] Docs reviewed and consistent with implementation
- [ ] `.env.example` files present (no real secrets)
- [ ] No secrets committed (API keys/tokens/passwords)
- [ ] `.gitignore` present and effective
- [ ] No generated artifacts committed (`node_modules`, `.next`, `__pycache__`, etc.)

## Local dev verification (Docker)
- [ ] `docker compose up --build` works
- [ ] Web app loads (`http://localhost:3000`)
- [ ] API health works (`http://localhost:8000/health`)
- [ ] Postgres starts and `pgvector` extension is available
- [ ] Indexing works (chunks + embeddings stored)
- [ ] Retrieval works (`POST /retrieve`)
- [ ] Source-filtered retrieval works with expected top-K behavior
- [ ] Ask works (`POST /ask`) in retrieval-only and grounded-answer modes
- [ ] Ask sessions show saved mode, source filter, top-K, and retrieved chunks

## OpenAI setup
- [ ] `OPENAI_API_KEY` setup documented
- [ ] `EMBEDDING_MODEL` documented (`text-embedding-3-small`)
- [ ] `CHAT_MODEL` documented (default: `gpt-4o-mini`)
- [ ] No logs leak secrets

## Demo readiness
- [ ] Demo content available (`SEED_DEMO_DATA=true` documented)
- [ ] Empty states look good if no demo content is present
- [ ] Demo flow is easy to follow end-to-end

## Screenshots
- [ ] Add screenshots to `docs/screenshots/`
- [ ] Update `docs/screenshots/README.md` with filenames and captions
- [ ] Add links in `README.md` Screenshots section

Suggested screenshots:
- [ ] Dashboard
- [ ] Sources list + create source
- [ ] Document detail with chunks + embedding status
- [ ] Ask Assistant (source filter, top-K, mode controls, answer + retrieved chunks)
- [ ] Ask Session detail (settings + retrieved chunks)
- [ ] Architecture page

## GitHub metadata (recommended)
Suggested description:
> ContextFlow is a public RAG knowledge assistant built with Next.js, FastAPI, PostgreSQL, pgvector, and OpenAI APIs.

Suggested topics:
- rag
- fastapi
- nextjs
- pgvector
- postgres
- openai
- embeddings
- vector-search
- ai-engineering
- fullstack

## LinkedIn launch
- [ ] Draft post in `docs/PORTFOLIO_COPY.md`
- [ ] Add 1-2 screenshots/GIFs
- [ ] Link the GitHub repo
- [ ] Keep copy practical and public-safe
