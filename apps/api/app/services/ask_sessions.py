from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ask_session import AskSession


def list_ask_sessions(db: Session) -> list[AskSession]:
    return list(db.scalars(select(AskSession).order_by(AskSession.id.desc())).all())


def get_ask_session(db: Session, session_id: int) -> AskSession | None:
    return db.get(AskSession, session_id)

