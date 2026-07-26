# Screenshot Preparation

Capture screenshots only with public-safe demo data. Do not include API keys, local secrets, personal browser data, or private content.

The README should reference screenshots only after the corresponding image files exist in this folder.

## Recommended Capture Setup

- Start the app with `docker compose up --build`.
- Use a clean seeded or manually prepared demo database.
- Index at least one document before capturing ask and chunk screens.
- Prefer a desktop viewport around `1440x900`.
- Capture browser content only, not the full desktop.

## Required Screenshots

### 1. Dashboard

- Suggested filename: `dashboard.png`
- Screen state to capture: dashboard after at least one source, document, indexed chunk, and ask session exist.
- Demo data required: one indexed document and one ask session.
- What it proves: full-stack data is flowing into the overview screen.
- Recommended caption: Dashboard showing sources, documents, indexed chunks, and saved ask sessions.

### 2. Sources List

- Suggested filename: `sources-list.png`
- Screen state to capture: Sources page with the create form and at least two public-safe sources.
- Demo data required: seeded or manually created sources.
- What it proves: manual source grouping and public-safe ingestion boundary.
- Recommended caption: Source management screen for grouping documents before retrieval.

### 3. Source Detail

- Suggested filename: `source-detail.png`
- Screen state to capture: source detail with at least one document listed.
- Demo data required: one source with one or more documents.
- What it proves: source-to-document relationship and source-filter demo setup.
- Recommended caption: Source detail showing documents available for filtered retrieval.

### 4. Document Detail With Chunks

- Suggested filename: `document-detail-chunks.png`
- Screen state to capture: indexed document detail showing status, chunk count, embedding count, and visible chunks.
- Demo data required: one indexed document.
- What it proves: document indexing, deterministic chunking, metadata, and embedding status.
- Recommended caption: Indexed document showing generated chunks and embedding status.

### 5. Ask Screen With Controls

- Suggested filename: `ask-controls.png`
- Screen state to capture: Ask page before running, with a question entered, source filter visible, top-K visible, and mode choices visible.
- Demo data required: at least one source in the dropdown.
- What it proves: retrieval controls are understandable and demo-ready.
- Recommended caption: Ask screen controls for source filtering, top-K, and retrieval mode.

### 6. Retrieval-Only Results

- Suggested filename: `retrieval-only-results.png`
- Screen state to capture: retrieval-only run with chunks and similarity scores visible.
- Demo data required: one indexed document whose content answers the question.
- What it proves: retrieval can be inspected separately from generation.
- Recommended caption: Retrieval-only results showing matched chunks, scores, and source metadata.

### 7. Grounded Answer With Sources

- Suggested filename: `grounded-answer-sources.png`
- Screen state to capture: grounded-answer run with answer and retrieved chunks visible.
- Demo data required: one indexed document and a question answered by the source.
- What it proves: retrieved context is passed into answer generation and source evidence remains visible.
- Recommended caption: Grounded answer generated from retrieved chunks with sources available for inspection.

### 8. Unsupported-Question Behavior

- Suggested filename: `unsupported-question-behavior.png`
- Screen state to capture: grounded-answer run for a question not answered by the selected source, with retrieved chunks visible below.
- Demo data required: indexed demo source that does not contain the requested answer.
- What it proves: the system has visible boundaries and can demonstrate insufficient-context behavior.
- Recommended caption: Unsupported question showing system limitation and retrieved evidence for review.

### 9. Ask Session Detail

- Suggested filename: `ask-session-detail.png`
- Screen state to capture: saved ask session showing mode, top-K, source filter, answer, and chunks.
- Demo data required: one saved retrieval-only or grounded-answer ask session.
- What it proves: retrieval settings and evidence are saved for review/debugging.
- Recommended caption: Saved ask session preserving retrieval settings, answer, and source chunks.

### 10. Architecture Diagram or Architecture Page

- Suggested filename: `architecture-page.png`
- Screen state to capture: app Architecture page or rendered README Mermaid diagram.
- Demo data required: none.
- What it proves: the system can be explained as a clear RAG pipeline.
- Recommended caption: ContextFlow architecture showing the path from document indexing to grounded answer generation.

## Recommended Capture Order

1. Dashboard
2. Sources list
3. Source detail
4. Document detail with chunks
5. Ask screen with controls
6. Retrieval-only results
7. Grounded answer with sources
8. Unsupported-question behavior
9. Ask session detail
10. Architecture page

## Manual Capture Notes

Automated browser screenshot tooling is not currently part of this repository. Do not add a large end-to-end framework solely for screenshots. Manual capture is sufficient for this phase.
