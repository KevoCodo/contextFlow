from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.chunks import KnowledgeChunkList
from app.schemas.documents import (
    KnowledgeDocumentCreate,
    KnowledgeDocumentIndexResponse,
    KnowledgeDocumentList,
    KnowledgeDocumentRead,
    KnowledgeDocumentUpdate,
)
from app.services import chunks as chunk_service
from app.services import documents as document_service
from app.services.embedding_service import EmbeddingServiceError, MissingOpenAIKeyError

router = APIRouter(prefix="/documents")


@router.get("", response_model=KnowledgeDocumentList)
def list_documents(source_id: int | None = None, db: Session = Depends(get_db)):
    items = document_service.list_documents(db, source_id=source_id)
    return {"items": items}


@router.get("/{document_id}", response_model=KnowledgeDocumentRead)
def get_document(document_id: int, db: Session = Depends(get_db)):
    document = document_service.get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    return document


@router.post("", response_model=KnowledgeDocumentRead, status_code=status.HTTP_201_CREATED)
def create_document(payload: KnowledgeDocumentCreate, db: Session = Depends(get_db)):
    try:
        return document_service.create_document(db, payload)
    except ValueError as exc:
        if str(exc) == "source_not_found":
            raise HTTPException(
                status_code=404, detail=f"Source {payload.source_id} not found"
            ) from exc
        raise


@router.patch("/{document_id}", response_model=KnowledgeDocumentRead)
def update_document(
    document_id: int, payload: KnowledgeDocumentUpdate, db: Session = Depends(get_db)
):
    document = document_service.get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    return document_service.update_document(db, document, payload)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    document = document_service.get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    document_service.delete_document(db, document)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{document_id}/chunks", response_model=KnowledgeChunkList)
def list_document_chunks(document_id: int, db: Session = Depends(get_db)):
    document = document_service.get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    items = chunk_service.list_chunks_for_document(db, document_id=document_id)
    return {"items": items}


@router.post("/{document_id}/index", response_model=KnowledgeDocumentIndexResponse)
def index_document(document_id: int, db: Session = Depends(get_db)):
    document = document_service.get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")

    try:
        chunk_count = document_service.index_document(db, document)
        # document is now updated; re-fetch for response safety.
        updated = document_service.get_document(db, document_id)
        return {"document": updated, "chunk_count": chunk_count}
    except ValueError as exc:
        if str(exc) == "no_chunks_generated":
            raise HTTPException(
                status_code=400,
                detail="Indexing failed: document content did not produce any chunks.",
            ) from exc
        raise
    except MissingOpenAIKeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except EmbeddingServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Indexing failed due to an unexpected error."
        ) from exc
