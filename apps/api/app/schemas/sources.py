from datetime import datetime

from pydantic import Field, field_validator

from app.models.status import RecordStatus
from app.schemas.common import APIModel


def _trim_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed or None


class KnowledgeSourceCreate(APIModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Source title is required.")
        return trimmed

    @field_validator("description")
    @classmethod
    def trim_description(cls, value: str | None) -> str | None:
        return _trim_optional_text(value)


class KnowledgeSourceUpdate(APIModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: RecordStatus | None = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Source title is required.")
        return trimmed

    @field_validator("description")
    @classmethod
    def trim_description(cls, value: str | None) -> str | None:
        return _trim_optional_text(value)


class KnowledgeSourceRead(APIModel):
    id: int
    title: str
    description: str | None
    status: RecordStatus
    created_at: datetime
    updated_at: datetime


class KnowledgeSourceList(APIModel):
    items: list[KnowledgeSourceRead]
