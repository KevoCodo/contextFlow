# Retrieval Evaluation

Phase 9 adds a small, repeatable evaluation layer for ContextFlow retrieval.

The purpose is not to claim that a similarity score proves an answer is correct. The purpose is to make retrieval behavior inspectable and teachable.

## What is evaluated

Each evaluation case contains:

- a natural-language question
- the expected source title
- the expected document title
- an optional source filter

The evaluator runs the existing embedding + pgvector retrieval flow and checks whether the expected source/document pair appears in the requested top-K results.

## What the report shows

The evaluation runner reports:

- total cases
- passed and failed cases
- pass rate
- mean rank of matched expected documents
- mean similarity score for matched expected documents
- per-case rank and similarity
- an explanation reminding the reader that similarity is not a correctness probability

This intentionally separates two questions:

1. Retrieval quality: did ContextFlow find the expected information?
2. Generation quality: did the LLM use the retrieved information correctly?

Phase 9 focuses on the first question. Existing grounded-answer guardrails and insufficient-context behavior cover the second question at the application layer.

## Run the evaluation

From the API container or API environment:

```bash
python -m scripts.evaluate_retrieval
```

Prerequisites:

- the demo sources are seeded
- their documents are indexed
- PostgreSQL + pgvector is available
- the embedding provider is configured

The runner uses the same retrieval service as the application, so it requires the configured embedding provider.

## Dataset

The public-safe evaluation set lives at:

```text
apps/api/evaluation/retrieval_cases.json
```

The initial cases cover:

- remote work eligibility
- remote work equipment
- bug report intake
- support escalation
- release note guidance
- source-filtered retrieval

## How to troubleshoot a failure

When the expected document is missing from top-K results, inspect these areas in order:

1. Confirm the expected document is indexed and has embeddings.
2. Confirm the question actually expresses the same concept as the expected document.
3. Inspect chunk boundaries. Important context may have been split poorly.
4. Check source filtering. A filter can intentionally exclude the expected document.
5. Compare the returned chunk text, metadata, and relative similarity scores.
6. Re-run with a larger top-K value to see whether the expected document is nearby but ranked too low.

Do not treat a score such as 0.82 as “82% correct.” It is a similarity signal used for ranking. Relevance still needs to be judged against the actual retrieved content.

## Teaching shorthand

A useful debugging explanation is:

**Question -> embedding -> vector comparison -> ranked chunks -> inspect expected match -> generation**

If retrieval misses the expected information, fix retrieval before blaming the LLM.
