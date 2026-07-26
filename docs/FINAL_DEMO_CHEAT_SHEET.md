# Final Demo Cheat Sheet

## Opening

ContextFlow is a public-safe RAG knowledge assistant that shows the full path from manual documents to chunks, embeddings, vector retrieval, and source-grounded answers in a small Next.js, FastAPI, PostgreSQL, pgvector, and OpenAI application.

## Core Teaching Point

RAG lets an AI system retrieve relevant source material before generating an answer.

## Demo Sequence

1. Open Dashboard and frame ContextFlow as an educational RAG reference implementation.
2. Open Architecture and explain the indexing path and question path.
3. Open Sources and select a final demo source.
4. Open a document and show indexed status, chunks, metadata, and embeddings.
5. Open Ask and run the answerable question in Retrieval Only mode.
6. Explain similarity scores, top-K, source titles, document titles, and chunk IDs.
7. Run the same question in Grounded Answer mode.
8. Apply the product-support source filter and ask the source-filter question.
9. Ask the unsupported question and explain insufficient-context behavior.
10. Open the saved ask session and show the preserved settings, answer, and chunks.

## Three Demo Questions

Use these public-safe sources:

- `Remote Work Policy`
- `Product Support Guide`

- Answerable question: `What should employees confirm before working from a temporary location?`
- Source-filter question: `What details should support collect for a bug report?`
- Unsupported question: `What is the company holiday schedule?`

## Technical Concepts To Mention

- Chunking: documents are split into smaller deterministic text units.
- Embeddings: chunks and questions become numeric vectors.
- Semantic similarity: pgvector ranks chunks by vector closeness to the question.
- Top-K: the request controls the maximum number of chunks returned.
- Source filtering: retrieval can search all indexed chunks or one selected source.
- Retrieval-only mode: shows evidence without calling chat completion.
- Grounded generation: sends retrieved chunks to the chat model as answer context.
- Limitations: retrieval can miss evidence, source content can be incomplete, and RAG does not guarantee correctness.

## Tradeoffs

- Retrieval quality limits answer quality.
- Chunk size affects precision and context.
- Top-K balances missing evidence against adding noise.
- Latency increases when embedding and chat calls are required.
- Cost depends on indexing volume, query volume, and model choice.
- Source quality matters more than prompt wording.
- Model behavior can still be imperfect, even with retrieved context.

## Likely Questions

**Why use RAG instead of prompt engineering alone?**  
Prompting changes instructions; RAG adds external context that the model can use at request time.

**Does RAG retrain the model?**  
No. It retrieves relevant information and passes it into the prompt.

**Why use pgvector?**  
It keeps relational data and vector search in PostgreSQL, which is simple and easy to explain for this project.

**What happens when retrieval is poor?**  
The generated answer may be incomplete, unsupported, or forced to say it lacks enough information.

**How do you prevent hallucinations?**  
Use source-grounded prompts, show retrieved evidence, support retrieval-only debugging, and add evaluation and guardrails before production.

**Why offer retrieval-only mode?**  
It separates retrieval quality from generation quality and makes troubleshooting teachable.

**What would need to change for production use?**  
Authentication, authorization, data security, migrations, monitoring, evaluation, rate-limit handling, deployment hardening, and operational support.

**Why is this not an AI agent?**  
It does not plan or execute multi-step tool workflows. It is a focused retrieval and generation pipeline.

**How would this scale?**  
Add migrations, indexing jobs, pagination, better metadata filters, retrieval evaluation, observability, and infrastructure sized for data and traffic.

**How would you evaluate retrieval quality?**  
Use curated question-answer sets, expected source chunks, recall@K, precision-style reviews, unsupported-question tests, and human review of retrieved evidence.

## Failure Recovery

Use CLEAR:

- Confirm the expected and actual result.
- Locate the failing layer: browser, web app, API, database, pgvector, OpenAI, Docker, or network.
- Examine the smallest reproducible step.
- Apply the lowest-risk correction.
- Reinforce the learning from the failure.

Backup plan:

- Docker fails: use prepared screenshots, README architecture, and workshop guide.
- OpenAI unavailable or API key fails: show indexed screenshots, retrieval screenshots, and explain the provider dependency.
- Internet unstable: use saved screenshots and verbal walkthrough.
- Database unavailable: explain the data model and vector storage from the architecture diagram.
- Model request rate-limited: use retrieval-only screenshots and saved ask-session examples.
- Screen sharing fails: walk through the README, workshop guide, and this cheat sheet verbally.

## Closing

The model generates the answer, but retrieval gives it better information to work with.
