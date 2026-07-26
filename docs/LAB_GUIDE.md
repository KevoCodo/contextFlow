# ContextFlow RAG Lab

This participant lab takes about 20 to 30 minutes. The objective is to compare retrieval-only mode with grounded-answer mode.

## Lab Objective

Use ContextFlow to index a small public-safe document, inspect retrieved chunks, and compare direct retrieval results with a generated grounded answer.

## Prerequisites

- Docker Desktop running
- ContextFlow cloned locally
- `apps/api/.env` created from `apps/api/.env.example`
- `OPENAI_API_KEY` set in `apps/api/.env`
- Browser access to `http://localhost:3000`

## Scenario

You are adding a small internal knowledge note for a fictional software team. The content is generic and public-safe:

```text
Support Response Policy

Customers should receive an initial response within one business day. Urgent incidents should be acknowledged within two hours during business hours.

For product questions, support specialists should first check the public knowledge base and then escalate unclear issues to the product team.

For bug reports, collect the browser, operating system, steps to reproduce, expected result, actual result, and any relevant timestamps.

The support team does not promise custom development timelines. Requests for new features should be logged as product feedback.
```

## Steps

### 1. Start the Application

Run:

```bash
docker compose up --build
```

Checkpoint:

- Expected screen state: `http://localhost:3000` loads the dashboard.
- Expected API result: `http://localhost:8000/health` returns `{"status":"ok","service":"contextflow-api"}`.
- Common mistake: Docker Desktop is not running.
- Recovery action: Start Docker Desktop and rerun Compose.

### 2. Create or Select a Source

Open Sources and create a source named `Support Knowledge Lab`.

Checkpoint:

- Expected screen state: the new source appears in the source list.
- Expected API/data result: `GET /sources` includes the new source.
- Common mistake: source title is empty.
- Recovery action: enter a short descriptive title and submit again.

### 3. Create a Document

Open the source and create a document using the scenario text. Title it `Support Response Policy`.

Checkpoint:

- Expected screen state: the document appears with `draft` status.
- Expected API/data result: `GET /documents` includes the document.
- Common mistake: document created under the wrong source.
- Recovery action: create another document under the intended source.

### 4. Index the Document

Open the document detail page and click **Index document**.

Checkpoint:

- Expected screen state: success message with chunk count, document status changes to `indexed`, chunks appear below.
- Expected API/data result: `POST /documents/{id}/index` returns a document and `chunk_count`.
- Common mistake: missing API key.
- Recovery action: set `OPENAI_API_KEY`, restart the API container, and retry.

### 5. Inspect Generated Chunks

Review chunk text, character count metadata, and embedding status.

Checkpoint:

- Expected screen state: each chunk shows text and `Embedding: present`.
- Expected API/data result: `GET /documents/{id}/chunks` returns chunks with `has_embedding=true`.
- Common mistake: expecting embeddings to be readable.
- Recovery action: explain that embeddings are numeric vectors used for similarity search.

### 6. Ask in Retrieval-Only Mode

Open Ask and ask: `What information should support collect for bug reports?`

Select **Retrieval Only** and run.

Checkpoint:

- Expected screen state: no generated answer; retrieved chunks appear with scores.
- Expected API/data result: `POST /ask` has `retrieval_only=true` and `answer=null`.
- Common mistake: selecting Grounded Answer first.
- Recovery action: switch to Retrieval Only and rerun the same question.

### 7. Review Similarity Scores

Find the chunk that mentions browser, operating system, steps to reproduce, expected result, actual result, and timestamps.

Checkpoint:

- Expected screen state: relevant chunk appears near the top.
- Expected API/data result: returned matches include score values.
- Common mistake: assuming score is a percentage.
- Recovery action: explain that the score is a similarity value used for ranking.

### 8. Generate a Grounded Answer

Ask the same question in **Grounded Answer** mode.

Checkpoint:

- Expected screen state: an answer appears above retrieved chunks and includes source references.
- Expected API/data result: `answer` is populated.
- Common mistake: treating the generated answer as independently verified.
- Recovery action: compare the answer to the retrieved chunks.

### 9. Change Top-K

Run the question with top-K `3`, then with top-K `10`.

Checkpoint:

- Expected screen state: the number of returned chunks changes up to the number available.
- Expected API/data result: request payload changes `top_k`.
- Common mistake: expecting more chunks than have been indexed.
- Recovery action: explain that top-K is a maximum, not a guarantee.

### 10. Apply Source Filtering

Select the `Support Knowledge Lab` source and rerun the question.

Checkpoint:

- Expected screen state: retrieved chunks come only from that source.
- Expected API/data result: returned matches have the selected `source_id`.
- Common mistake: selecting a source with no indexed documents.
- Recovery action: pick the indexed source or index a document in the selected source.

### 11. Ask a Question Not Answered by the Source

Ask: `What is the company's holiday schedule?`

Checkpoint:

- Expected screen state: retrieval may return weakly related chunks, and grounded mode should indicate insufficient context if the model follows the prompt.
- Expected API/data result: retrieved chunks do not contain the answer.
- Common mistake: assuming every answerable-looking response is correct.
- Recovery action: inspect the retrieved evidence and discuss grounding limits.

### 12. Observe and Discuss

Open Ask Sessions and review the saved run.

Checkpoint:

- Expected screen state: mode, top-K, source filter, answer, and chunks are visible.
- Expected API/data result: `GET /ask-sessions/{id}` returns saved retrieval settings.
- Common mistake: forgetting that retrieval-only sessions have no answer.
- Recovery action: use the mode badge and answer panel to explain the difference.

## Reflection Questions

- Which chunk was most relevant?
- Did the highest similarity score produce the best evidence?
- How did top-K affect the answer?
- What happened when the source lacked the answer?
- What guardrails would be required in production?

## Optional Challenge

Create a second source with a similar but different policy. Ask the same question with **All Sources**, then filter to each source and compare how retrieval scope changes the answer.
