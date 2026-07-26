import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.api.routes import sources as source_route
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_source import KnowledgeSource
from app.schemas.sources import KnowledgeSourceCreate, KnowledgeSourceUpdate
from app.services.sources import create_source, update_source


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(
        bind=engine,
        tables=[
            KnowledgeSource.__table__,
            KnowledgeDocument.__table__,
        ],
    )
    SessionLocal = sessionmaker(bind=engine)
    with SessionLocal() as session:
        yield session


def test_update_source_name_preserves_id_and_documents(db_session: Session):
    source = create_source(
        db_session,
        KnowledgeSourceCreate(title="Original Source", description="Original description"),
    )
    db_session.add(
        KnowledgeDocument(
            source_id=source.id,
            title="Attached document",
            content="Public-safe content.",
        )
    )
    db_session.commit()

    updated = update_source(
        db_session,
        source,
        KnowledgeSourceUpdate(title="Renamed Source"),
    )

    documents = list(
        db_session.scalars(
            select(KnowledgeDocument).where(KnowledgeDocument.source_id == source.id)
        )
    )
    assert updated.id == source.id
    assert updated.title == "Renamed Source"
    assert updated.description == "Original description"
    assert len(documents) == 1
    assert documents[0].title == "Attached document"


def test_update_source_description_only(db_session: Session):
    source = create_source(
        db_session,
        KnowledgeSourceCreate(title="Demo Source", description="Old description"),
    )

    updated = update_source(
        db_session,
        source,
        KnowledgeSourceUpdate(description="Updated description"),
    )

    assert updated.title == "Demo Source"
    assert updated.description == "Updated description"


def test_update_source_both_fields_are_trimmed(db_session: Session):
    source = create_source(
        db_session,
        KnowledgeSourceCreate(title="Demo Source", description="Old description"),
    )

    updated = update_source(
        db_session,
        source,
        KnowledgeSourceUpdate(
            title="  Remote Work Policy  ",
            description="  Public-safe description.  ",
        ),
    )

    assert updated.title == "Remote Work Policy"
    assert updated.description == "Public-safe description."


@pytest.mark.parametrize("title", ["", "   "])
def test_source_update_rejects_empty_or_whitespace_title(title: str):
    with pytest.raises(ValidationError):
        KnowledgeSourceUpdate(title=title)


def test_source_create_rejects_whitespace_title():
    with pytest.raises(ValidationError):
        KnowledgeSourceCreate(title="   ")


def test_source_patch_unknown_id_returns_not_found(monkeypatch):
    client = TestClient(app)

    def override_db():
        yield object()

    def missing_source(db, source_id):
        return None

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(source_route.source_service, "get_source", missing_source)

    response = client.patch("/sources/999999", json={"title": "Renamed Source"})

    app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json()["detail"] == "Source 999999 not found"
