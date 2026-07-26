from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.settings import settings
from app.db.session import get_db
from app.models.ask_session import AskSession
from app.models.knowledge_source import KnowledgeSource
from app.schemas.ask import AskRequest, AskResponse
from app.schemas.retrieve import RetrieveMatch
from app.services.answer_service import AnswerResult, AnswerService, AnswerServiceError
from app.services.embedding_service import EmbeddingServiceError, MissingOpenAIKeyError
from app.services.retrieval_service import retrieve_chunks

router = APIRouter()


SINGLE_SOURCE_FALLBACK = (
    "I don’t have enough information in the retrieved sources to answer that question. "
    "The selected source, {source_name}, does not appear to contain the requested information."
)
ALL_SOURCES_FALLBACK = (
    "I don’t have enough information in the retrieved sources to answer that question. "
    "Try selecting a more relevant source or adding documentation that covers this topic."
)


def _source_title_for_fallback(
    db: Session,
    source_id: int | None,
    matches,
) -> str | None:
    if source_id is None:
        return None
    if matches and matches[0].source_title:
        return matches[0].source_title
    source = db.get(KnowledgeSource, source_id)
    return source.title if source is not None else f"Source #{source_id}"


def _fallback_answer(source_title: str | None) -> str:
    if source_title:
        message = SINGLE_SOURCE_FALLBACK.format(source_name=source_title)
    else:
        message = ALL_SOURCES_FALLBACK
    return f"{message}\n\nSources: None"


def _coerce_answer_result(value: AnswerResult | str) -> AnswerResult:
    if isinstance(value, AnswerResult):
        return value
    normalized = value.lower()
    if any(
        marker in normalized
        for marker in (
            "i don't know",
            "i do not know",
            "not enough information",
            "insufficient information",
            "insufficient context",
            "don't have enough information",
            "do not have enough information",
            "does not contain the requested information",
            "doesn't contain the requested information",
        )
    ):
        return AnswerResult(answer=value, answer_status="insufficient_context", source_chunk_ids=[])
    return AnswerResult(answer=value, answer_status="supported", source_chunk_ids=None)


@router.post("/ask", response_model=AskResponse)
def ask(payload: AskRequest, db: Session = Depends(get_db)):
    try:
        matches = retrieve_chunks(
            db,
            question=payload.question,
            top_k=payload.top_k,
            source_id=payload.source_id,
        )
        answer = None
        answer_status = "retrieval_only" if payload.retrieval_only else None
        answer_sources: list[int] = []
        if not payload.retrieval_only:
            if matches:
                result = _coerce_answer_result(
                    AnswerService(model=settings.CHAT_MODEL).generate_answer(
                        payload.question,
                        matches,
                    )
                )
                answer_status = result.answer_status
                if result.answer_status == "insufficient_context":
                    answer = _fallback_answer(
                        _source_title_for_fallback(db, payload.source_id, matches)
                    )
                    answer_sources = []
                else:
                    answer = result.answer
                    answer_sources = result.source_chunk_ids or []
            else:
                answer_status = "insufficient_context"
                answer = _fallback_answer(_source_title_for_fallback(db, payload.source_id, matches))
                answer_sources = []

        match_payload: list[dict] = [
            {
                "chunk_id": m.chunk_id,
                "document_id": m.document_id,
                "document_title": m.document_title,
                "source_id": m.source_id,
                "source_title": m.source_title,
                "chunk_index": m.chunk_index,
                "chunk_text": m.chunk_text,
                "score": m.score,
                "metadata": m.metadata,
            }
            for m in matches
        ]

        session = AskSession(
            question=payload.question,
            answer=answer,
            retrieved_chunks=match_payload,
            retrieval_settings={
                "mode": "retrieval_only" if payload.retrieval_only else "grounded_answer",
                "top_k": payload.top_k,
                "source_id": payload.source_id,
                "source_title": matches[0].source_title if payload.source_id and matches else None,
                "answer_status": answer_status,
                "answer_sources": answer_sources,
            },
        )
        db.add(session)
        db.commit()

        return {
            "question": payload.question,
            "answer": answer,
            "answer_status": answer_status,
            "answer_sources": answer_sources,
            "source_id": payload.source_id,
            "top_k": payload.top_k,
            "retrieval_only": payload.retrieval_only,
            "matches": [RetrieveMatch(**m) for m in match_payload],
        }
    except MissingOpenAIKeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (EmbeddingServiceError, AnswerServiceError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Ask failed unexpectedly.") from exc
