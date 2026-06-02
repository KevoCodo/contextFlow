from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.ask_session import AskSession
from app.schemas.retrieve import RetrieveRequest, RetrieveResponse
from app.services.embedding_service import EmbeddingServiceError, MissingOpenAIKeyError
from app.services.retrieval_service import retrieve_chunks

router = APIRouter()


@router.post("/retrieve", response_model=RetrieveResponse)
def retrieve(payload: RetrieveRequest, db: Session = Depends(get_db)):
    try:
        matches = retrieve_chunks(
            db,
            question=payload.question,
            top_k=payload.top_k,
            source_id=payload.source_id,
        )
        match_payload = [
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

        db.add(
            AskSession(
                question=payload.question,
                answer=None,
                retrieved_chunks=match_payload,
                retrieval_settings={
                    "mode": "retrieval_only",
                    "top_k": payload.top_k,
                    "source_id": payload.source_id,
                    "source_title": matches[0].source_title if payload.source_id and matches else None,
                },
            )
        )
        db.commit()

        return {
            "question": payload.question,
            "source_id": payload.source_id,
            "top_k": payload.top_k,
            "matches": match_payload,
        }
    except MissingOpenAIKeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except EmbeddingServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Retrieval failed unexpectedly.") from exc
