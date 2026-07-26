from sqlalchemy import text

from app.db.base import Base
from app.db.engine import engine


def ensure_pgvector_extension() -> None:
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))


def create_tables() -> None:
    # Import models so SQLAlchemy registers tables on Base.metadata.
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def ensure_embedding_vector_column(dimensions: int = 1536) -> None:
    """
    Development-friendly schema helper.

    This project currently uses `create_all` instead of migrations; when the
    embedding column changes from JSON to pgvector, we need a small shim to
    reconcile the existing table.
    """
    with engine.begin() as conn:
        exists = conn.execute(
            text(
                """
                SELECT data_type, udt_name
                FROM information_schema.columns
                WHERE table_name = 'knowledge_chunks' AND column_name = 'embedding'
                """
            )
        ).first()

        if exists is None:
            conn.execute(
                text(f"ALTER TABLE knowledge_chunks ADD COLUMN embedding vector({dimensions});")
            )
            udt_name = "vector"
        else:
            _, udt_name = exists

        if udt_name != "vector":
            conn.execute(text("ALTER TABLE knowledge_chunks DROP COLUMN embedding;"))
            conn.execute(
                text(f"ALTER TABLE knowledge_chunks ADD COLUMN embedding vector({dimensions});")
            )

        conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS ix_knowledge_chunks_embedding_cosine
                ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
                """
            )
        )


def ensure_ask_session_retrieval_settings_column() -> None:
    with engine.begin() as conn:
        exists = conn.execute(
            text(
                """
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'ask_sessions' AND column_name = 'retrieval_settings'
                """
            )
        ).first()

        if exists is None:
            conn.execute(text("ALTER TABLE ask_sessions ADD COLUMN retrieval_settings jsonb;"))
