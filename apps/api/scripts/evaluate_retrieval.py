from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from app.db.session import SessionLocal
from app.services.retrieval_evaluation import (
    RetrievalEvaluationCase,
    evaluate_retrieval_case,
    summarize_retrieval_evaluation,
)

CASES_PATH = Path(__file__).resolve().parents[1] / "evaluation" / "retrieval_cases.json"


def load_cases() -> list[RetrievalEvaluationCase]:
    payload = json.loads(CASES_PATH.read_text(encoding="utf-8"))
    return [RetrievalEvaluationCase(**item) for item in payload]


def main() -> None:
    cases = load_cases()

    with SessionLocal() as db:
        results = [evaluate_retrieval_case(db, case, top_k=5) for case in cases]

    output = {
        "summary": summarize_retrieval_evaluation(results),
        "results": [asdict(result) for result in results],
        "notes": [
            "This report evaluates retrieval only. It does not score LLM answer quality.",
            "Similarity scores are ranking signals, not correctness probabilities.",
        ],
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
