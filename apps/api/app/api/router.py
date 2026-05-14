from fastapi import APIRouter

from app.api.routes.ask import router as ask_router
from app.api.routes.ask_sessions import router as ask_sessions_router
from app.api.routes.documents import router as documents_router
from app.api.routes.health import router as health_router
from app.api.routes.retrieve import router as retrieve_router
from app.api.routes.sources import router as sources_router
from app.api.routes.stats import router as stats_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(sources_router, tags=["sources"])
api_router.include_router(documents_router, tags=["documents"])
api_router.include_router(ask_sessions_router, tags=["ask-sessions"])
api_router.include_router(retrieve_router, tags=["retrieval"])
api_router.include_router(stats_router, tags=["stats"])
api_router.include_router(ask_router, tags=["ask"])
