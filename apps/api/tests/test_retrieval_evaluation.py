from app.services.retrieval_evaluation import (
    RetrievalEvaluationCase,
    RetrievalEvaluationResult,
    _find_expected_match,
    summarize_retrieval_evaluation,
)
from app.services.retrieval_service import RetrievalMatch


def make_match(
    *,
    chunk_id: int,
    source_title: str,
    document_title: str,
    score: float,
) -> RetrievalMatch:
    return RetrievalMatch(
        chunk_id=chunk_id,
        document_id=chunk_id,
        document_title=document_title,
        source_id=1,
        source_title=source_title,
        chunk_index=0,
        chunk_text="Example chunk",
        score=score,
        metadata={"character_count": 13},
    )


def test_find_expected_match_returns_rank_and_match():
    matches = [
        make_match(
            chunk_id=1,
            source_title="Remote Work Policy",
            document_title="Meeting expectations",
            score=0.91,
        ),
        make_match(
            chunk_id=2,
            source_title="Remote Work Policy",
            document_title="Equipment policy",
            score=0.87,
        ),
    ]

    rank, match = _find_expected_match(
        matches,
        expected_source_title="Remote Work Policy",
        expected_document_title="Equipment policy",
    )

    assert rank == 2
    assert match is not None
    assert match.chunk_id == 2


def test_find_expected_match_returns_none_when_expected_document_missing():
    matches = [
        make_match(
            chunk_id=1,
            source_title="Product Support Guide",
            document_title="Support escalation",
            score=0.82,
        )
    ]

    rank, match = _find_expected_match(
        matches,
        expected_source_title="Product Support Guide",
        expected_document_title="Bug report intake",
    )

    assert rank is None
    assert match is None


def test_summary_separates_pass_rate_rank_and_similarity():
    results = [
        RetrievalEvaluationResult(
            case_id="one",
            question="Question one",
            passed=True,
            expected_source_title="Source",
            expected_document_title="Document",
            source_filter_title=None,
            matched_rank=1,
            matched_score=0.9,
            returned_matches=5,
            explanation="ok",
        ),
        RetrievalEvaluationResult(
            case_id="two",
            question="Question two",
            passed=True,
            expected_source_title="Source",
            expected_document_title="Document",
            source_filter_title=None,
            matched_rank=3,
            matched_score=0.7,
            returned_matches=5,
            explanation="ok",
        ),
        RetrievalEvaluationResult(
            case_id="three",
            question="Question three",
            passed=False,
            expected_source_title="Source",
            expected_document_title="Document",
            source_filter_title=None,
            matched_rank=None,
            matched_score=None,
            returned_matches=5,
            explanation="missing",
        ),
    ]

    summary = summarize_retrieval_evaluation(results)

    assert summary["total_cases"] == 3
    assert summary["passed_cases"] == 2
    assert summary["failed_cases"] == 1
    assert summary["pass_rate"] == 0.6667
    assert summary["mean_matched_rank"] == 2
    assert summary["mean_matched_similarity"] == 0.8


def test_evaluation_case_supports_source_filtering():
    case = RetrievalEvaluationCase(
        case_id="filtered",
        question="What equipment is provided?",
        expected_source_title="Remote Work Policy",
        expected_document_title="Equipment policy",
        source_filter_title="Remote Work Policy",
    )

    assert case.source_filter_title == "Remote Work Policy"
