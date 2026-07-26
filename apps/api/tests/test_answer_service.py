from app.services.answer_service import parse_answer_result


def test_parse_answer_result_handles_structured_insufficient_context():
    result = parse_answer_result(
        '{"answer_status":"insufficient_context","answer":"Not covered.","source_chunk_ids":[1]}'
    )

    assert result.answer_status == "insufficient_context"
    assert result.source_chunk_ids == []


def test_parse_answer_result_detects_plain_i_dont_know():
    result = parse_answer_result("I don't know.\n\nSources: None")

    assert result.answer_status == "insufficient_context"
    assert result.source_chunk_ids is None


def test_parse_answer_result_formats_supported_structured_answer_sources():
    result = parse_answer_result(
        '{"answer_status":"supported","answer":"Collect browser details.","source_chunk_ids":[7,8]}'
    )

    assert result.answer_status == "supported"
    assert result.source_chunk_ids == [7, 8]
    assert result.answer == "Collect browser details.\n\nSources: chunk 7, chunk 8"


def test_parse_answer_result_preserves_supported_answer_with_sources_text():
    result = parse_answer_result("Collect browser details.\n\nSources: chunk 7")

    assert result.answer_status == "supported"
    assert result.answer == "Collect browser details.\n\nSources: chunk 7"
