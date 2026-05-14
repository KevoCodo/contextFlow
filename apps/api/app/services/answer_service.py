from __future__ import annotations

from openai import OpenAI

from app.core.settings import settings
from app.services.embedding_service import MissingOpenAIKeyError
from app.services.retrieval_service import RetrievalMatch


class AnswerServiceError(RuntimeError):
    pass


class AnswerService:
    def __init__(self, model: str = "gpt-4o-mini"):
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise MissingOpenAIKeyError(
                "OPENAI_API_KEY is not set. Set it to enable answer generation."
            )
        self._client = OpenAI(api_key=api_key)
        self._model = model

    def generate_answer(self, question: str, matches: list[RetrievalMatch]) -> str:
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
            "If the context is insufficient, say you don't know. "
            "Be concise and factual. End with a 'Sources:' list of chunk ids used."
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

        return content.strip()

