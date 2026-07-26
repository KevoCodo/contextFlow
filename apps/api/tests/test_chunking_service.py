from app.services.chunking_service import ChunkingConfig, chunk_text


def test_chunk_text_returns_empty_for_blank_content():
    assert chunk_text("  \n\n  ") == []


def test_chunk_text_keeps_short_document_as_single_chunk():
    assert chunk_text("Short public-safe note.") == ["Short public-safe note."]


def test_chunk_text_is_deterministic_and_preserves_order():
    content = "\n\n".join(
        [
            "Alpha section explains the first policy." * 6,
            "Bravo section explains the second policy." * 6,
            "Charlie section explains the third policy." * 6,
        ]
    )

    first = chunk_text(content, ChunkingConfig(min_chunk_chars=50, target_chunk_chars=180, max_chunk_chars=260))
    second = chunk_text(content, ChunkingConfig(min_chunk_chars=50, target_chunk_chars=180, max_chunk_chars=260))

    assert first == second
    assert first[0].startswith("Alpha")
    assert all(chunk.strip() for chunk in first)


def test_chunk_text_hard_splits_very_long_paragraph():
    chunks = chunk_text(
        "A" * 250,
        ChunkingConfig(min_chunk_chars=10, target_chunk_chars=100, max_chunk_chars=80),
    )

    assert len(chunks) == 4
    assert all(len(chunk) <= 80 for chunk in chunks)
