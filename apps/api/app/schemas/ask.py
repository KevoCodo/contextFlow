from typing import Literal

from pydantic import Field

from app.schemas.common import APIModel
from app.schemas.retrieve import RetrieveMatch


class AskRequest(APIModel):
    question: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=10)
    source_id: int | None = None
    retrieval_only: bool = False


class AskResponse(APIModel):
    question: str
    answer: str | None
    answer_status: Literal["retrieval_only", "supported", "insufficient_context"] | None = None
    answer_sources: list[int]
    source_id: int | None = None
    top_k: int
    retrieval_only: bool
    matches: list[RetrieveMatch]
