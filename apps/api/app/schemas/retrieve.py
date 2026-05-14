from pydantic import Field

from app.schemas.common import APIModel


class RetrieveRequest(APIModel):
    question: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=10)


class RetrieveMatch(APIModel):
    chunk_id: int
    document_id: int
    document_title: str | None = None
    chunk_text: str
    score: float
    metadata: dict | None = None


class RetrieveResponse(APIModel):
    question: str
    matches: list[RetrieveMatch]

