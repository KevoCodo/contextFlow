from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.settings import settings
from app.db.session import get_db
from app.models.ask_session import AskSession
from app.schemas.ask import AskRequest, AskResponse
from app.schemas.retrieve import RetrieveMatch
from app.services.answer_service import AnswerService, AnswerServiceError
from app.services.embedding_service import EmbeddingServiceError, MissingOpenAIKeyError
from app.services.retrieval_service import retrieve_chunks

router = APIRouter()


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
        if not payload.retrieval_only:
            answer = AnswerService(model=settings.CHAT_MODEL).generate_answer(payload.question, matches)

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
            },
        )
        db.add(session)
        db.commit()

        return {
            "question": payload.question,
            "answer": answer,
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
