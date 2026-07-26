import pytest
from pydantic import ValidationError

from app.schemas.ask import AskRequest
from app.schemas.retrieve import RetrieveRequest


@pytest.mark.parametrize("top_k", [1, 3, 5, 10])
def test_retrieve_request_accepts_supported_top_k_values(top_k):
    request = RetrieveRequest(question="What is indexed?", top_k=top_k)

    assert request.top_k == top_k


@pytest.mark.parametrize("top_k", [0, 11])
def test_retrieve_request_rejects_top_k_outside_boundaries(top_k):
    with pytest.raises(ValidationError):
        RetrieveRequest(question="What is indexed?", top_k=top_k)


def test_retrieve_request_keeps_optional_source_filter():
    request = RetrieveRequest(question="What is indexed?", source_id=42)

    assert request.source_id == 42


def test_ask_request_defaults_to_grounded_answer_mode():
    request = AskRequest(question="What is indexed?")

    assert request.retrieval_only is False
    assert request.top_k == 5


def test_ask_request_supports_retrieval_only_mode():
    request = AskRequest(question="What is indexed?", retrieval_only=True)

    assert request.retrieval_only is True
