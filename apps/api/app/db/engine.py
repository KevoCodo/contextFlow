from sqlalchemy import create_engine

from app.core.settings import settings


def get_engine():
    return create_engine(settings.database_url, pool_pre_ping=True)


engine = get_engine()
