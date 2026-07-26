# Understanding Retrieval-Augmented Generation with ContextFlow

This guide is for instructors using ContextFlow to explain RAG through a live, inspectable demo.

## Audience

- Software developers
- Solution architects
- Technical consultants
- Sales engineers
- Business stakeholders with technical interest

## Prerequisites

- Docker Desktop installed and running
- OpenAI API key available for the instructor demo
- Basic familiarity with HTTP APIs and web applications
- Optional: Node.js 20+ and Python 3.11+ for local checks outside Docker
- ContextFlow cloned locally with demo-safe content available

## Learning Objectives

By the end of the workshop, participants should be able to:

- Explain the purpose of RAG
- Distinguish retrieval from generation
- Explain chunking and embeddings
- Describe semantic similarity
- Explain top-K retrieval
- Identify basic RAG failure modes
- Describe why source grounding matters
- Navigate the ContextFlow demo

## Suggested Workshop Agenda

### 15-Minute Version

1. Explain the problem RAG solves.
2. Show the architecture diagram.
3. Index one document.
4. Run retrieval-only mode.
5. Run grounded-answer mode.
6. Close with limitations and Q&A.

### 30-Minute Version

1. Explain RAG in business and technical terms.
2. Walk through sources, documents, chunks, and embeddings.
3. Index a demo document.
4. Ask one answered question in retrieval-only mode.
5. Ask the same question in grounded-answer mode.
6. Change top-K and source filtering.
7. Show an unanswered question and discuss failure modes.
8. Review saved ask sessions.

### 45-Minute Version

1. Introduce RAG, embeddings, and vector search.
2. Walk through the full architecture.
3. Have participants create a small source and document.
4. Index content and inspect chunks.
5. Compare retrieval-only and grounded-answer mode.
6. Change top-K and source filters.
7. Troubleshoot one intentional failure, such as an unindexed document or a source filter with no matches.
8. Discuss tradeoffs, misconceptions, and production boundaries.

## Instructor Explanation

### Plain-English Explanation

RAG lets an AI assistant look up relevant information before it answers. Instead of relying only on what the model learned during training, the application retrieves text from a knowledge base and gives that text to the model as context.

### Technical Explanation

Documents are split into chunks, each chunk is converted into an embedding vector, and those vectors are stored in pgvector. When a user asks a question, the question is embedded too. The database compares the question vector with chunk vectors and returns the most similar chunks. The application can either show those chunks directly or pass them into a chat completion prompt as grounded context.

### Business Explanation

RAG helps teams build assistants that reference approved knowledge sources. It can reduce unsupported answers and make responses easier to review because users can inspect the retrieved evidence. It is still dependent on source quality, retrieval quality, and application guardrails.

### Analogy

Think of RAG as an open-book exam. The model is the person answering, but before answering it is handed the most relevant pages from the book. If the wrong pages are retrieved, the answer can still be weak.

### Indexing Flow

1. A source groups related documents.
2. A document stores manual public-safe text.
3. The chunking service splits the document into smaller pieces.
4. The embedding service converts each chunk into a vector.
5. PostgreSQL stores the chunk text, metadata, and vector.

### Question Flow

1. The user submits a question.
2. The embedding service converts the question into a vector.
3. pgvector returns the top-K most similar indexed chunks.
4. Retrieval-only mode shows the chunks and scores.
5. Grounded-answer mode sends the chunks and question to the chat model.
6. The UI displays the answer and sources.

## Engagement Questions

Before the demo:

- What kind of knowledge would you trust an assistant to answer from?
- What happens if the source material is incomplete?
- Why might keyword search miss useful context?

During the demo:

- Which retrieved chunk looks most relevant?
- Does the similarity score match your judgment?
- What changed when we narrowed the source filter?
- What changed when we increased top-K?

After the demo:

- Where would you add evaluation before using this in a real workflow?
- What monitoring would you want?
- What should the assistant do when the retrieved context is weak?

## Demonstration Flow

1. Start Docker Compose and confirm `/health`.
2. Open the dashboard and explain the data model.
3. Open Sources and select or create a source.
4. Open a document and point out draft/indexed status.
5. Index the document and inspect chunks.
6. Open Ask.
7. Ask a question in retrieval-only mode.
8. Review scores, chunk IDs, document titles, and source titles.
9. Ask the same question in grounded-answer mode.
10. Compare the answer to the retrieved evidence.
11. Lower and raise top-K.
12. Apply a source filter.
13. Ask a question outside the source material.
14. Point out that unsupported answers use `Sources: None` while retrieved candidates remain visible for debugging.
15. Show the saved ask session.

## Key Tradeoffs

- **Chunk size:** smaller chunks can be precise but may lose context; larger chunks preserve context but can dilute similarity.
- **Chunk overlap:** overlap can preserve continuity, but this implementation avoids overlap to keep chunking deterministic and easy to explain.
- **Top-K:** low values may omit needed evidence; high values may add noise and cost.
- **Source quality:** RAG cannot fix incorrect, stale, or incomplete source documents.
- **Retrieval relevance:** vector similarity finds semantic closeness, not guaranteed factual support.
- **Prompt constraints:** prompts can instruct grounded behavior but cannot guarantee perfect compliance.
- **Cost:** indexing and question answering both call external AI APIs.
- **Latency:** retrieval plus chat completion is slower than retrieval-only mode.
- **Model choice:** embedding and chat models affect quality, latency, and cost.
- **Grounding limitations:** citations show which chunks were retrieved; they do not prove the final answer is correct.

## Common Misconceptions

- **RAG retrains the model:** it does not. It retrieves external context at request time.
- **Embeddings contain readable document content:** they do not. Embeddings are numeric representations.
- **Vector similarity guarantees correctness:** similarity is not the same as truth.
- **More retrieved chunks always improve the answer:** more chunks can add noise.
- **Source citations prove the answer is correct:** citations make answers inspectable, not automatically correct.
- **Retrieved chunks are always answer sources:** retrieved chunks are candidates. Unsupported answers should show `Sources: None` even when candidates are displayed for inspection.
- **Every AI workflow needs an agent:** many useful AI systems are simpler retrieval and generation workflows.

## Closing Discussion

Practical closing questions:

- What would make this demo ready for your team’s real data?
- Which failure mode would concern you most?
- How would you decide whether retrieval quality is good enough?
- What policies or guardrails would you add before production use?

Takeaways:

- RAG is an application architecture pattern, not a magic correctness guarantee.
- Retrieval quality is often the limiting factor.
- Source inspection helps developers and stakeholders reason about answer quality.
- Simple, observable systems are easier to teach and troubleshoot.
