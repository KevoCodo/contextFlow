from enum import Enum


class RecordStatus(str, Enum):
    draft = "draft"
    indexed = "indexed"
    failed = "failed"

