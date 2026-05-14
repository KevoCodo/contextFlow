from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.knowledge_chunk import KnowledgeChunk
from app.models.knowledge_document import KnowledgeDocument
from app.services.embedding_service import EmbeddingService


@dataclass(frozen=True)
class RetrievalMatch:
    chunk_id: int
    document_id: int
    document_title: str | None
    chunk_text: str
    score: float
    metadata: dict | None


def retrieve_chunks(db: Session, question: str, top_k: int = 5) -> list[RetrievalMatch]:
    embedder = EmbeddingService()
    query_vec = embedder.embed_text(question)

    score_expr = (1 - KnowledgeChunk.embedding.cosine_distance(query_vec)).label("score")

    stmt: Select = (
        select(
            KnowledgeChunk.id,
            KnowledgeChunk.document_id,
            KnowledgeDocument.title,
            KnowledgeChunk.chunk_text,
            KnowledgeChunk.chunk_metadata,
            score_expr,
        )
        .join(KnowledgeDocument, KnowledgeDocument.id == KnowledgeChunk.document_id)
        .where(KnowledgeChunk.embedding.is_not(None))
        .order_by(score_expr.desc())
        .limit(top_k)
    )

    rows = db.execute(stmt).all()
    return [
        RetrievalMatch(
            chunk_id=row[0],
            document_id=row[1],
            document_title=row[2],
            chunk_text=row[3],
            metadata=row[4],
            score=float(row[5]),
        )
        for row in rows
    ]
