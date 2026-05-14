from datetime import datetime

from pydantic import Field

from app.models.status import RecordStatus
from app.schemas.common import APIModel


class KnowledgeDocumentCreate(APIModel):
    source_id: int
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)


class KnowledgeDocumentUpdate(APIModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    status: RecordStatus | None = None


class KnowledgeDocumentRead(APIModel):
    id: int
    source_id: int
    title: str
    content: str
    status: RecordStatus
    created_at: datetime
    updated_at: datetime


class KnowledgeDocumentList(APIModel):
    items: list[KnowledgeDocumentRead]


class KnowledgeDocumentIndexResponse(APIModel):
    document: KnowledgeDocumentRead
    chunk_count: int
