from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge_source import KnowledgeSource
from app.models.status import RecordStatus
from app.schemas.sources import KnowledgeSourceCreate, KnowledgeSourceUpdate


def list_sources(db: Session) -> list[KnowledgeSource]:
    return list(db.scalars(select(KnowledgeSource).order_by(KnowledgeSource.id)).all())


def get_source(db: Session, source_id: int) -> KnowledgeSource | None:
    return db.get(KnowledgeSource, source_id)


def create_source(db: Session, data: KnowledgeSourceCreate) -> KnowledgeSource:
    source = KnowledgeSource(
        title=data.title,
        description=data.description,
        status=RecordStatus.draft,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


def update_source(db: Session, source: KnowledgeSource, data: KnowledgeSourceUpdate) -> KnowledgeSource:
    if data.title is not None:
        source.title = data.title
    if data.description is not None:
        source.description = data.description
    if data.status is not None:
        source.status = data.status

    db.add(source)
    db.commit()
    db.refresh(source)
    return source


def delete_source(db: Session, source: KnowledgeSource) -> None:
    db.delete(source)
    db.commit()

