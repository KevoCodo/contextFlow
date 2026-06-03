from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.knowledge_chunk import KnowledgeChunk
from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_source import KnowledgeSource
from app.services.embedding_service import EmbeddingService


@dataclass(frozen=True)
class RetrievalMatch:
    chunk_id: int
    document_id: int
    document_title: str | None
    source_id: int
    source_title: str | None
    chunk_index: int
    chunk_text: str
    score: float
    metadata: dict | None


def retrieve_chunks(
    db: Session,
    question: str,
    top_k: int = 5,
    source_id: int | None = None,
) -> list[RetrievalMatch]:
    embedder = EmbeddingService()
    query_vec = embedder.embed_text(question)
    safe_top_k = max(1, min(top_k, 10))

    score_expr = (1 - KnowledgeChunk.embedding.cosine_distance(query_vec)).label("score")

    stmt: Select = (
        select(
            KnowledgeChunk.id,
            KnowledgeChunk.document_id,
            KnowledgeDocument.title,
            KnowledgeDocument.source_id,
            KnowledgeSource.title,
            KnowledgeChunk.chunk_index,
            KnowledgeChunk.chunk_text,
            KnowledgeChunk.chunk_metadata,
            score_expr,
        )
        .join(KnowledgeDocument, KnowledgeDocument.id == KnowledgeChunk.document_id)
        .join(KnowledgeSource, KnowledgeSource.id == KnowledgeDocument.source_id)
        .where(KnowledgeChunk.embedding.is_not(None))
        .order_by(score_expr.desc())
        .limit(safe_top_k)
    )

    if source_id is not None:
        stmt = stmt.where(KnowledgeDocument.source_id == source_id)

    rows = db.execute(stmt).all()
    return [
        RetrievalMatch(
            chunk_id=row[0],
            document_id=row[1],
            document_title=row[2],
            source_id=row[3],
            source_title=row[4],
            chunk_index=row[5],
            chunk_text=row[6],
            metadata=row[7],
            score=float(row[8]),
        )
        for row in rows
    ]
