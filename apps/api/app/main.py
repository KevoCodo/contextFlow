import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.settings import settings
from app.db.init_db import create_tables, ensure_embedding_vector_column, ensure_pgvector_extension
from app.db.seed import seed_demo_data
from app.db.session import SessionLocal

logger = logging.getLogger("contextflow.api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Phase 1: only DB connectivity + pgvector extension preparation.
    # No embeddings, retrieval, or chunking is implemented here.
    if settings.database_url:
        try:
            ensure_pgvector_extension()
            create_tables()
            ensure_embedding_vector_column()
            if settings.SEED_DEMO_DATA:
                with SessionLocal() as db:
                    seed_demo_data(db)
        except Exception:
            logger.exception("Database init skipped (pgvector extension not ensured).")
    yield


app = FastAPI(title="ContextFlow API", lifespan=lifespan)
app.include_router(api_router)
