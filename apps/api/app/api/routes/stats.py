from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.ask_session import AskSession
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_source import KnowledgeSource

router = APIRouter()


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    sources = db.scalar(select(func.count(KnowledgeSource.id))) or 0
    documents = db.scalar(select(func.count(KnowledgeDocument.id))) or 0
    ask_sessions = db.scalar(select(func.count(AskSession.id))) or 0
    chunks_indexed = (
        db.scalar(select(func.count(KnowledgeChunk.id)).where(KnowledgeChunk.embedding.is_not(None)))
        or 0
    )
    return {
        "sources": int(sources),
        "documents": int(documents),
        "chunks_indexed": int(chunks_indexed),
        "ask_sessions": int(ask_sessions),
    }

