# Scope Guardrails

This project is a **public portfolio showcase**. Keep it intentionally small, understandable, and safe.

## Strict MVP boundaries
- Manual text entry only (no automated ingestion)
- Single-user local development workflow (no multi-tenant platform concerns)
- Core RAG pipeline only: ingest -> chunk -> embed -> store -> retrieve -> grounded response format

## Do NOT add in early phases
- Authentication/authorization (only add later if explicitly requested)
- Billing/payments/subscriptions
- Team/org management, roles, invitations
- File uploads of any kind (including PDFs) in the MVP
- PDF parsing, OCR, image ingestion
- Website crawling / scraping
- WordPress sync / plugins / connectors
- Background job systems and distributed infrastructure
- Agentic browsing or tool execution

## Privacy & security rules
- Do not include any private business/client data in the repo, seed files, screenshots, or tests
- Do not add or reference proprietary KodeGistics OS code
- Do not add or reference proprietary WordPress chatbot code
- Do not add confidential prompts, system prompts, or copied internal business logic
- Do not create or commit fake secrets (API keys, tokens); use `.env.example` later if needed
- Avoid logging raw user-provided knowledge in places that would surprise a reviewer

## Content and data handling
- All example content must be generic and public-safe
- Treat manually entered knowledge as potentially sensitive; keep storage and retrieval minimal and transparent
