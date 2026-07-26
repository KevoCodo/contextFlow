from __future__ import annotations

import json
from dataclasses import dataclass

from openai import OpenAI

from app.core.settings import settings
from app.services.embedding_service import MissingOpenAIKeyError
from app.services.retrieval_service import RetrievalMatch


class AnswerServiceError(RuntimeError):
    pass


@dataclass(frozen=True)
class AnswerResult:
    answer: str
    answer_status: str = "supported"
    source_chunk_ids: list[int] | None = None


INSUFFICIENT_CONTEXT_MARKERS = (
    "i don't know",
    "i do not know",
    "don't have enough information",
    "do not have enough information",
    "not enough information",
    "insufficient information",
    "insufficient context",
    "context is insufficient",
    "provided context does not",
    "provided context doesn't",
    "retrieved context does not",
    "retrieved context doesn't",
    "does not contain the requested information",
    "doesn't contain the requested information",
)


def _status_from_text(answer: str) -> str:
    normalized = answer.lower()
    if any(marker in normalized for marker in INSUFFICIENT_CONTEXT_MARKERS):
        return "insufficient_context"
    return "supported"


def _format_supported_answer(answer: str, source_chunk_ids: list[int] | None) -> str:
    if "sources:" in answer.lower():
        return answer
    if source_chunk_ids:
        sources = ", ".join(f"chunk {chunk_id}" for chunk_id in source_chunk_ids)
        return f"{answer}\n\nSources: {sources}"
    return answer


def parse_answer_result(content: str) -> AnswerResult:
    cleaned = (content or "").strip()
    if not cleaned:
        return AnswerResult(answer="", answer_status="insufficient_context", source_chunk_ids=[])

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        return AnswerResult(answer=cleaned, answer_status=_status_from_text(cleaned))

    if not isinstance(data, dict):
        return AnswerResult(answer=cleaned, answer_status=_status_from_text(cleaned))

    answer = data.get("answer")
    if not isinstance(answer, str):
        answer = cleaned

    answer_status = data.get("answer_status")
    if answer_status not in {"supported", "insufficient_context"}:
        answer_status = _status_from_text(answer)

    raw_chunk_ids = data.get("source_chunk_ids")
    source_chunk_ids = [
        chunk_id for chunk_id in raw_chunk_ids if isinstance(chunk_id, int)
    ] if isinstance(raw_chunk_ids, list) else []

    if answer_status == "insufficient_context":
        return AnswerResult(
            answer=answer.strip(),
            answer_status="insufficient_context",
            source_chunk_ids=[],
        )

    return AnswerResult(
        answer=_format_supported_answer(answer.strip(), source_chunk_ids),
        answer_status="supported",
        source_chunk_ids=source_chunk_ids,
    )


class AnswerService:
    def __init__(self, model: str = "gpt-4o-mini"):
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise MissingOpenAIKeyError(
                "OPENAI_API_KEY is not set. Set it to enable answer generation."
            )
        self._client = OpenAI(api_key=api_key)
        self._model = model

    def generate_answer(self, question: str, matches: list[RetrievalMatch]) -> AnswerResult:
        context_blocks = []
        for m in matches:
            title = m.document_title or f"Document {m.document_id}"
            context_blocks.append(
                f"[chunk:{m.chunk_id} | doc:{m.document_id} | {title}]\n{m.chunk_text}"
            )

        context = "\n\n".join(context_blocks) if context_blocks else "(no context)"

        system = (
            "You are ContextFlow, a standalone public RAG showcase assistant. "
            "Answer the user's question using ONLY the provided context. "
            "Do not make unsupported claims. Do not treat low-relevance context as support. "
            "If the context fully supports the answer, return answer_status 'supported'. "
            "If the context only partially supports the answer, answer only the supported part "
            "and state what is not covered. "
            "If the context does not support the answer, return answer_status "
            "'insufficient_context' and do not cite chunks. "
            "Return only JSON with this shape: "
            '{"answer_status":"supported|insufficient_context",'
            '"answer":"concise professional answer",'
            '"source_chunk_ids":[chunk ids used to support the answer]}.'
        )

        user = f"Question:\n{question}\n\nContext:\n{context}"

        try:
            res = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=0.2,
            )
            content = res.choices[0].message.content or ""
        except MissingOpenAIKeyError:
            raise
        except Exception as exc:
            raise AnswerServiceError("OpenAI answer generation failed.") from exc

        return parse_answer_result(content)
