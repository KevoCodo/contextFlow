from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.seed import (
    PRODUCT_SUPPORT_SOURCE_DESCRIPTION,
    PRODUCT_SUPPORT_SOURCE_TITLE,
    REMOTE_WORK_SOURCE_DESCRIPTION,
    REMOTE_WORK_SOURCE_TITLE,
    seed_demo_data,
)
from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_source import KnowledgeSource


def make_session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(
        bind=engine,
        tables=[
            KnowledgeSource.__table__,
            KnowledgeDocument.__table__,
        ],
    )
    return sessionmaker(bind=engine)()


def test_seed_creates_clean_demo_sources_when_missing():
    with make_session() as db:
        seed_demo_data(db)

        titles = list(db.scalars(select(KnowledgeSource.title).order_by(KnowledgeSource.id)))

    assert titles == [REMOTE_WORK_SOURCE_TITLE, PRODUCT_SUPPORT_SOURCE_TITLE]


def test_seed_twice_does_not_duplicate_sources_or_documents():
    with make_session() as db:
        seed_demo_data(db)
        seed_demo_data(db)

        sources = list(db.scalars(select(KnowledgeSource)))
        documents = list(db.scalars(select(KnowledgeDocument)))

    assert len(sources) == 2
    assert len(documents) == 6


def test_seed_reuses_clean_sources_and_updates_descriptions():
    with make_session() as db:
        db.add(
            KnowledgeSource(
                title=REMOTE_WORK_SOURCE_TITLE,
                description="Old description",
            )
        )
        db.commit()
        source_id = db.scalar(
            select(KnowledgeSource.id).where(KnowledgeSource.title == REMOTE_WORK_SOURCE_TITLE)
        )

        seed_demo_data(db)

        source = db.get(KnowledgeSource, source_id)
        remote_sources = list(
            db.scalars(select(KnowledgeSource).where(KnowledgeSource.title == REMOTE_WORK_SOURCE_TITLE))
        )

    assert source is not None
    assert source.id == source_id
    assert source.description == REMOTE_WORK_SOURCE_DESCRIPTION
    assert len(remote_sources) == 1


def test_seed_renames_legacy_timestamp_source_without_replacing_documents():
    with make_session() as db:
        legacy_source = KnowledgeSource(
            title="Final Demo Product Support Guide 20260726164832",
            description="Old timestamped description",
        )
        db.add(legacy_source)
        db.flush()
        db.add(
            KnowledgeDocument(
                source_id=legacy_source.id,
                title="Existing attached document",
                content="Keep this document attached.",
            )
        )
        db.commit()
        source_id = legacy_source.id

        seed_demo_data(db)

        source = db.get(KnowledgeSource, source_id)
        attached_documents = list(
            db.scalars(
                select(KnowledgeDocument).where(KnowledgeDocument.source_id == source_id)
            )
        )
        clean_sources = list(
            db.scalars(
                select(KnowledgeSource).where(
                    KnowledgeSource.title == PRODUCT_SUPPORT_SOURCE_TITLE
                )
            )
        )

    assert source is not None
    assert source.title == PRODUCT_SUPPORT_SOURCE_TITLE
    assert source.description == PRODUCT_SUPPORT_SOURCE_DESCRIPTION
    assert len(clean_sources) == 1
    assert any(document.title == "Existing attached document" for document in attached_documents)
