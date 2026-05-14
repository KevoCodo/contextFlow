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
        matches = retrieve_chunks(db, question=payload.question, top_k=payload.top_k)
        match_payload = [
            {
                "chunk_id": m.chunk_id,
                "document_id": m.document_id,
                "document_title": m.document_title,
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
            )
        )
        db.commit()

        return {
            "question": payload.question,
            "matches": match_payload,
        }
    except MissingOpenAIKeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except EmbeddingServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Retrieval failed unexpectedly.") from exc
