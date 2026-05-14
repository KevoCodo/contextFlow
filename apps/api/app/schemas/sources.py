from datetime import datetime

from pydantic import Field

from app.models.status import RecordStatus
from app.schemas.common import APIModel


class KnowledgeSourceCreate(APIModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None


class KnowledgeSourceUpdate(APIModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: RecordStatus | None = None


class KnowledgeSourceRead(APIModel):
    id: int
    title: str
    description: str | None
    status: RecordStatus
    created_at: datetime
    updated_at: datetime


class KnowledgeSourceList(APIModel):
    items: list[KnowledgeSourceRead]
