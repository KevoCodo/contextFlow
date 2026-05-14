from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.knowledge_chunk import KnowledgeChunk
from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_source import KnowledgeSource
from app.models.status import RecordStatus
from app.schemas.documents import KnowledgeDocumentCreate, KnowledgeDocumentUpdate
from app.services.chunking_service import chunk_text
from app.services.embedding_service import EmbeddingService


def list_documents(db: Session, source_id: int | None = None) -> list[KnowledgeDocument]:
    stmt = select(KnowledgeDocument).order_by(KnowledgeDocument.id)
    if source_id is not None:
        stmt = stmt.where(KnowledgeDocument.source_id == source_id)
    return list(db.scalars(stmt).all())


def get_document(db: Session, document_id: int) -> KnowledgeDocument | None:
    return db.get(KnowledgeDocument, document_id)


def create_document(db: Session, data: KnowledgeDocumentCreate) -> KnowledgeDocument:
    source = db.get(KnowledgeSource, data.source_id)
    if source is None:
        raise ValueError("source_not_found")

    document = KnowledgeDocument(
        source_id=data.source_id,
        title=data.title,
        content=data.content,
        status=RecordStatus.draft,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def update_document(
    db: Session, document: KnowledgeDocument, data: KnowledgeDocumentUpdate
) -> KnowledgeDocument:
    if data.title is not None:
        document.title = data.title
    if data.content is not None:
        document.content = data.content
        # Content changes invalidate indexing.
        document.status = RecordStatus.draft
    if data.status is not None:
        document.status = data.status

    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def delete_document(db: Session, document: KnowledgeDocument) -> None:
    db.delete(document)
    db.commit()


def index_document(db: Session, document: KnowledgeDocument) -> int:
    """
    Rebuilds chunks for a document:
    - Deletes existing chunks
    - Chunks content
    - Inserts KnowledgeChunk rows
    - Updates document status
    Returns created chunk count.
    """
    try:
        db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.document_id == document.id))

        chunks = chunk_text(document.content)
        if not chunks:
            raise ValueError("no_chunks_generated")

        embedder = EmbeddingService()

        for idx, text in enumerate(chunks):
            embedding = embedder.embed_text(text)
            db.add(
                KnowledgeChunk(
                    document_id=document.id,
                    chunk_text=text,
                    chunk_index=idx,
                    chunk_metadata={"character_count": len(text)},
                    embedding=embedding,
                )
            )

        document.status = RecordStatus.indexed
        db.add(document)
        db.commit()
        return len(chunks)
    except Exception:
        db.rollback()
        document.status = RecordStatus.failed
        db.add(document)
        db.commit()
        raise
