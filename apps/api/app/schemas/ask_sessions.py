from datetime import datetime

from app.schemas.common import APIModel


class AskSessionRead(APIModel):
    id: int
    question: str
    answer: str | None
    retrieved_chunks: list[dict] | None
    created_at: datetime


class AskSessionList(APIModel):
    items: list[AskSessionRead]
