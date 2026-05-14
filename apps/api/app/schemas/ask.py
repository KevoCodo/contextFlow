from pydantic import Field

from app.schemas.common import APIModel
from app.schemas.retrieve import RetrieveMatch


class AskRequest(APIModel):
    question: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=10)


class AskResponse(APIModel):
    question: str
    answer: str
    matches: list[RetrieveMatch]

