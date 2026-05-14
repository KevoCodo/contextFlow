from __future__ import annotations

from dataclasses import dataclass

from openai import OpenAI

from app.core.settings import settings


class MissingOpenAIKeyError(RuntimeError):
    pass


class EmbeddingServiceError(RuntimeError):
    pass


@dataclass(frozen=True)
class EmbeddingConfig:
    model: str = "text-embedding-3-small"
    dimensions: int = 1536


class EmbeddingService:
    def __init__(self, config: EmbeddingConfig | None = None):
        self.config = config or EmbeddingConfig(model=settings.EMBEDDING_MODEL)
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise MissingOpenAIKeyError(
                "OPENAI_API_KEY is not set. Set it to enable embeddings."
            )
        self._client = OpenAI(api_key=api_key)

    def embed_text(self, text: str) -> list[float]:
        try:
            res = self._client.embeddings.create(model=self.config.model, input=text)
            vector = res.data[0].embedding
        except MissingOpenAIKeyError:
            raise
        except Exception as exc:
            raise EmbeddingServiceError("OpenAI embeddings request failed.") from exc

        if not isinstance(vector, list) or not vector:
            raise EmbeddingServiceError("Embedding vector was empty.")

        if len(vector) != self.config.dimensions:
            raise EmbeddingServiceError(
                f"Unexpected embedding dimensions: {len(vector)} (expected {self.config.dimensions})."
            )

        return vector

