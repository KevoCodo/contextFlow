from __future__ import annotations

from dataclasses import dataclass
from statistics import mean

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge_source import KnowledgeSource
from app.services.retrieval_service import RetrievalMatch, retrieve_chunks


@dataclass(frozen=True)
class RetrievalEvaluationCase:
    case_id: str
    question: str
    expected_source_title: str
    expected_document_title: str
    source_filter_title: str | None = None


@dataclass(frozen=True)
class RetrievalEvaluationResult:
    case_id: str
    question: str
    passed: bool
    expected_source_title: str
    expected_document_title: str
    source_filter_title: str | None
    matched_rank: int | None
    matched_score: float | None
    returned_matches: int
    explanation: str


def _resolve_source_id(db: Session, source_title: str | None) -> int | None:
    if source_title is None:
        return None

    return db.scalar(
        select(KnowledgeSource.id)
        .where(KnowledgeSource.title == source_title)
        .limit(1)
    )


def _find_expected_match(
    matches: list[RetrievalMatch],
    expected_source_title: str,
    expected_document_title: str,
) -> tuple[int | None, RetrievalMatch | None]:
    for rank, match in enumerate(matches, start=1):
        if (
            match.source_title == expected_source_title
            and match.document_title == expected_document_title
        ):
            return rank, match

    return None, None


def _build_explanation(rank: int | None, match: RetrievalMatch | None) -> str:
    if match is None or rank is None:
        return (
            "The expected source/document pair was not returned in the requested top-K results. "
            "Inspect chunk wording, chunk boundaries, source filtering, and the embedding query."
        )

    return (
        f"The expected chunk was retrieved at rank {rank} with cosine-similarity score "
        f"{match.score:.4f}. The score is useful for relative ranking, but it is not a "
        "correctness probability. Review the chunk text and metadata before treating the result "
        "as relevant."
    )


def evaluate_retrieval_case(
    db: Session,
    case: RetrievalEvaluationCase,
    top_k: int = 5,
) -> RetrievalEvaluationResult:
    source_id = _resolve_source_id(db, case.source_filter_title)

    matches = retrieve_chunks(
        db,
        question=case.question,
        top_k=top_k,
        source_id=source_id,
    )

    rank, expected_match = _find_expected_match(
        matches,
        case.expected_source_title,
        case.expected_document_title,
    )

    return RetrievalEvaluationResult(
        case_id=case.case_id,
        question=case.question,
        passed=expected_match is not None,
        expected_source_title=case.expected_source_title,
        expected_document_title=case.expected_document_title,
        source_filter_title=case.source_filter_title,
        matched_rank=rank,
        matched_score=expected_match.score if expected_match else None,
        returned_matches=len(matches),
        explanation=_build_explanation(rank, expected_match),
    )


def summarize_retrieval_evaluation(
    results: list[RetrievalEvaluationResult],
) -> dict[str, int | float | None]:
    total = len(results)
    passed = sum(1 for result in results if result.passed)
    ranks = [result.matched_rank for result in results if result.matched_rank is not None]
    scores = [result.matched_score for result in results if result.matched_score is not None]

    return {
        "total_cases": total,
        "passed_cases": passed,
        "failed_cases": total - passed,
        "pass_rate": round(passed / total, 4) if total else 0.0,
        "mean_matched_rank": round(mean(ranks), 4) if ranks else None,
        "mean_matched_similarity": round(mean(scores), 4) if scores else None,
    }
