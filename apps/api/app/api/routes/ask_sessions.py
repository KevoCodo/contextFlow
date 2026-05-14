from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.ask_sessions import AskSessionList, AskSessionRead
from app.services import ask_sessions as ask_session_service

router = APIRouter(prefix="/ask-sessions")


@router.get("", response_model=AskSessionList)
def list_ask_sessions(db: Session = Depends(get_db)):
    items = ask_session_service.list_ask_sessions(db)
    return {"items": items}


@router.get("/{session_id}", response_model=AskSessionRead)
def get_ask_session(session_id: int, db: Session = Depends(get_db)):
    session = ask_session_service.get_ask_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail=f"AskSession {session_id} not found")
    return session

