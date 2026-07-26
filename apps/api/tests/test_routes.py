from fastapi.testclient import TestClient

from app.api.routes import ask as ask_route
from app.db.session import get_db
from app.main import app
from app.services.retrieval_service import RetrievalMatch


class FakeDb:
    def __init__(self):
        self.added = []
        self.committed = False

    def add(self, value):
        self.added.append(value)

    def commit(self):
        self.committed = True


def fake_db():
    db = FakeDb()
    yield db


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "contextflow-api"}


def test_ask_retrieval_only_skips_answer_generation(monkeypatch):
    db = FakeDb()

    def override_db():
        yield db

    def fake_retrieve_chunks(db, question, top_k, source_id):
        return [
            RetrievalMatch(
                chunk_id=7,
                document_id=3,
                document_title="Support Response Policy",
                source_id=2,
                source_title="Support Knowledge Lab",
                chunk_index=0,
                chunk_text="Collect browser, operating system, and steps to reproduce.",
                score=0.91,
                metadata={"character_count": 64},
            )
        ]

    class FailingAnswerService:
        def __init__(self, model):
            raise AssertionError("AnswerService should not be constructed in retrieval-only mode")

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(ask_route, "retrieve_chunks", fake_retrieve_chunks)
    monkeypatch.setattr(ask_route, "AnswerService", FailingAnswerService)

    response = client.post(
        "/ask",
        json={"question": "What should support collect?", "top_k": 3, "source_id": 2, "retrieval_only": True},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] is None
    assert body["retrieval_only"] is True
    assert body["top_k"] == 3
    assert body["source_id"] == 2
    assert body["matches"][0]["source_id"] == 2
    assert db.committed is True
    assert db.added[0].retrieval_settings["mode"] == "retrieval_only"


def test_ask_grounded_answer_returns_fallback_without_chat_call_when_no_chunks(monkeypatch):
    db = FakeDb()

    def override_db():
        yield db

    def fake_retrieve_chunks(db, question, top_k, source_id):
        return []

    class FailingAnswerService:
        def __init__(self, model):
            raise AssertionError("AnswerService should not be constructed without retrieved chunks")

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(ask_route, "retrieve_chunks", fake_retrieve_chunks)
    monkeypatch.setattr(ask_route, "AnswerService", FailingAnswerService)

    response = client.post(
        "/ask",
        json={"question": "What is the holiday schedule?", "top_k": 5, "retrieval_only": False},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "Insufficient information in the knowledge base.\n\nSources: none"
    assert body["matches"] == []
    assert db.added[0].retrieval_settings["mode"] == "grounded_answer"
