from datetime import datetime

from app.schemas.common import APIModel


class KnowledgeChunkRead(APIModel):
    id: int
    document_id: int
    chunk_text: str
    chunk_index: int
    chunk_metadata: dict | None
    has_embedding: bool
    created_at: datetime


class KnowledgeChunkList(APIModel):
    items: list[KnowledgeChunkRead]
