from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.sources import (
    KnowledgeSourceCreate,
    KnowledgeSourceList,
    KnowledgeSourceRead,
    KnowledgeSourceUpdate,
)
from app.services import sources as source_service

router = APIRouter(prefix="/sources")


@router.get("", response_model=KnowledgeSourceList)
def list_sources(db: Session = Depends(get_db)):
    items = source_service.list_sources(db)
    return {"items": items}


@router.get("/{source_id}", response_model=KnowledgeSourceRead)
def get_source(source_id: int, db: Session = Depends(get_db)):
    source = source_service.get_source(db, source_id)
    if source is None:
        raise HTTPException(status_code=404, detail=f"Source {source_id} not found")
    return source


@router.post("", response_model=KnowledgeSourceRead, status_code=status.HTTP_201_CREATED)
def create_source(payload: KnowledgeSourceCreate, db: Session = Depends(get_db)):
    return source_service.create_source(db, payload)


@router.patch("/{source_id}", response_model=KnowledgeSourceRead)
def update_source(source_id: int, payload: KnowledgeSourceUpdate, db: Session = Depends(get_db)):
    source = source_service.get_source(db, source_id)
    if source is None:
        raise HTTPException(status_code=404, detail=f"Source {source_id} not found")
    return source_service.update_source(db, source, payload)


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_source(source_id: int, db: Session = Depends(get_db)):
    source = source_service.get_source(db, source_id)
    if source is None:
        raise HTTPException(status_code=404, detail=f"Source {source_id} not found")
    source_service.delete_source(db, source)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

