from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ChunkingConfig:
    min_chunk_chars: int = 200
    target_chunk_chars: int = 900
    max_chunk_chars: int = 1100


def chunk_text(content: str, config: ChunkingConfig | None = None) -> list[str]:
    """
    Simple MVP chunking:
    - Split by paragraph first (blank-line separated)
    - Combine paragraphs into ~700-1000 char chunks
    - Avoid empty chunks and preserve order
    """
    cfg = config or ChunkingConfig()

    normalized = (content or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    if not normalized:
        return []

    paragraphs = [p.strip() for p in normalized.split("\n\n") if p.strip()]

    chunks: list[str] = []
    buffer_parts: list[str] = []
    buffer_len = 0

    def flush_buffer() -> None:
        nonlocal buffer_parts, buffer_len
        if not buffer_parts:
            return
        chunk = "\n\n".join(buffer_parts).strip()
        buffer_parts = []
        buffer_len = 0
        if chunk and len(chunk) >= cfg.min_chunk_chars:
            chunks.append(chunk)
        elif chunk and not chunks:
            # If the entire document is short, keep a single small chunk.
            chunks.append(chunk)

    for para in paragraphs:
        para_len = len(para)
        if para_len >= cfg.max_chunk_chars:
            flush_buffer()
            # Hard split long paragraphs by character length (simple, no AI).
            start = 0
            while start < para_len:
                piece = para[start : start + cfg.max_chunk_chars].strip()
                if piece:
                    chunks.append(piece)
                start += cfg.max_chunk_chars
            continue

        additional_len = para_len if not buffer_parts else (2 + para_len)
        if buffer_len + additional_len > cfg.max_chunk_chars:
            flush_buffer()

        buffer_parts.append(para)
        buffer_len = buffer_len + additional_len

        if buffer_len >= cfg.target_chunk_chars:
            flush_buffer()

    flush_buffer()

    return [c for c in chunks if c.strip()]

