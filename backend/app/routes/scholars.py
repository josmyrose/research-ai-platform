from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import ScholarEntry
from app.dependencies import get_current_user

router = APIRouter(prefix="/scholars", tags=["Scholars"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ScholarEntryCreate(BaseModel):
    entry_type: str
    title: str
    detail: str | None = None
    content: str | None = None


def serialize_scholar_entry(entry: ScholarEntry):
    return {
        "id": entry.id,
        "entry_type": entry.entry_type,
        "title": entry.title,
        "detail": entry.detail,
        "content": entry.content,
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
    }


@router.get("/")
def list_scholar_entries(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before viewing scholar entries.")

    entries = (
        db.query(ScholarEntry)
        .filter(ScholarEntry.user_id == user.id)
        .order_by(ScholarEntry.created_at.desc(), ScholarEntry.id.desc())
        .all()
    )

    return [serialize_scholar_entry(entry) for entry in entries]


@router.post("/")
def create_scholar_entry(
    payload: ScholarEntryCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before adding scholar entries.")

    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="A title is required.")

    entry = ScholarEntry(
        user_id=user.id,
        entry_type=payload.entry_type.strip(),
        title=payload.title.strip(),
        detail=payload.detail.strip() if payload.detail else None,
        content=payload.content,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return serialize_scholar_entry(entry)
