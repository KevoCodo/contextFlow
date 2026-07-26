from fastapi.testclient import TestClient

from app.api.routes import ask as ask_route
from app.db.session import get_db
from app.main import app
from app.services.retrieval_service import RetrievalMatch


class FakeDb:
    def __init__(self):
        self.added = []
        self.committed = False
        self.sources = {}

    def add(self, value):
        self.added.append(value)

    def commit(self):
        self.committed = True

    def get(self, model, value):
        return self.sources.get(value)


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
    assert body["answer_status"] == "retrieval_only"
    assert body["answer_sources"] == []
    assert body["retrieval_only"] is True
    assert body["top_k"] == 3
    assert body["source_id"] == 2
    assert body["matches"][0]["source_id"] == 2
    assert db.committed is True
    assert db.added[0].retrieval_settings["mode"] == "retrieval_only"


def test_ask_grounded_answer_returns_single_source_fallback_without_chunks(monkeypatch):
    db = FakeDb()

    class Source:
        title = "Remote Work Policy"

    db.sources[5] = Source()

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
        json={
            "question": "What is the holiday schedule?",
            "top_k": 5,
            "source_id": 5,
            "retrieval_only": False,
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == (
        "I don’t have enough information in the retrieved sources to answer that question. "
        "The selected source, Remote Work Policy, does not appear to contain the requested information."
        "\n\nSources: None"
    )
    assert body["answer_status"] == "insufficient_context"
    assert body["answer_sources"] == []
    assert body["matches"] == []
    assert db.added[0].retrieval_settings["mode"] == "grounded_answer"
    assert db.added[0].retrieval_settings["answer_status"] == "insufficient_context"
    assert db.added[0].retrieval_settings["answer_sources"] == []


def test_ask_normalizes_insufficient_context_for_single_source_with_retrieved_candidates(monkeypatch):
    db = FakeDb()

    def override_db():
        yield db

    def fake_retrieve_chunks(db, question, top_k, source_id):
        return [
            RetrievalMatch(
                chunk_id=17,
                document_id=9,
                document_title="Remote work eligibility",
                source_id=5,
                source_title="Remote Work Policy",
                chunk_index=0,
                chunk_text="Employees may work remotely up to three days per week.",
                score=0.72,
                metadata={"character_count": 58},
            )
        ]

    class FakeAnswerService:
        def __init__(self, model):
            self.model = model

        def generate_answer(self, question, matches):
            return "I don't know.\n\nSources: None"

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(ask_route, "retrieve_chunks", fake_retrieve_chunks)
    monkeypatch.setattr(ask_route, "AnswerService", FakeAnswerService)

    response = client.post(
        "/ask",
        json={
            "question": "What is the company holiday schedule?",
            "top_k": 3,
            "source_id": 5,
            "retrieval_only": False,
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == (
        "I don’t have enough information in the retrieved sources to answer that question. "
        "The selected source, Remote Work Policy, does not appear to contain the requested information."
        "\n\nSources: None"
    )
    assert body["answer_status"] == "insufficient_context"
    assert body["answer_sources"] == []
    assert len(body["matches"]) == 1
    assert body["matches"][0]["source_title"] == "Remote Work Policy"


def test_ask_normalizes_insufficient_context_for_all_sources(monkeypatch):
    db = FakeDb()

    def override_db():
        yield db

    def fake_retrieve_chunks(db, question, top_k, source_id):
        return [
            RetrievalMatch(
                chunk_id=21,
                document_id=11,
                document_title="Bug report intake",
                source_id=6,
                source_title="Product Support Guide",
                chunk_index=0,
                chunk_text="Support specialists collect browser and operating system details.",
                score=0.67,
                metadata=None,
            )
        ]

    class FakeAnswerService:
        def __init__(self, model):
            self.model = model

        def generate_answer(self, question, matches):
            return "The retrieved context does not contain the requested information."

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(ask_route, "retrieve_chunks", fake_retrieve_chunks)
    monkeypatch.setattr(ask_route, "AnswerService", FakeAnswerService)

    response = client.post(
        "/ask",
        json={
            "question": "What is the company parental leave policy?",
            "top_k": 3,
            "retrieval_only": False,
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == (
        "I don’t have enough information in the retrieved sources to answer that question. "
        "Try selecting a more relevant source or adding documentation that covers this topic."
        "\n\nSources: None"
    )
    assert body["answer_status"] == "insufficient_context"
    assert body["answer_sources"] == []
    assert len(body["matches"]) == 1


def test_ask_supported_answer_preserves_answer_sources(monkeypatch):
    db = FakeDb()

    def override_db():
        yield db

    def fake_retrieve_chunks(db, question, top_k, source_id):
        return [
            RetrievalMatch(
                chunk_id=31,
                document_id=12,
                document_title="Bug report intake",
                source_id=6,
                source_title="Product Support Guide",
                chunk_index=0,
                chunk_text="Collect browser, operating system, expected result, and actual result.",
                score=0.93,
                metadata=None,
            )
        ]

    class FakeAnswerService:
        def __init__(self, model):
            self.model = model

        def generate_answer(self, question, matches):
            return ask_route.AnswerResult(
                answer="Support should collect browser and operating system details.\n\nSources: chunk 31",
                answer_status="supported",
                source_chunk_ids=[31],
            )

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(ask_route, "retrieve_chunks", fake_retrieve_chunks)
    monkeypatch.setattr(ask_route, "AnswerService", FakeAnswerService)

    response = client.post(
        "/ask",
        json={
            "question": "What details should support collect for a bug report?",
            "top_k": 3,
            "source_id": 6,
            "retrieval_only": False,
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["answer_status"] == "supported"
    assert body["answer_sources"] == [31]
    assert "Sources: chunk 31" in body["answer"]
    assert db.added[0].retrieval_settings["answer_sources"] == [31]
