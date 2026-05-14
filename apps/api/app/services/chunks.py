from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge_chunk import KnowledgeChunk


def list_chunks_for_document(db: Session, document_id: int) -> list[KnowledgeChunk]:
    return list(
        db.scalars(
            select(KnowledgeChunk)
            .where(KnowledgeChunk.document_id == document_id)
            .order_by(KnowledgeChunk.chunk_index)
        ).all()
    )

