import json
import re

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import LibraryItem
from app.dependencies import get_current_user

router = APIRouter(prefix="/library", tags=["Library"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class LibraryItemCreate(BaseModel):
    source_type: str
    title: str
    detail: str | None = None
    content: str | None = None
    url: str | None = None
    filename: str | None = None


def serialize_library_item(item: LibraryItem):
    return {
        "id": item.id,
        "source_type": item.source_type,
        "title": item.title,
        "detail": item.detail,
        "content": item.content,
        "url": item.url,
        "filename": item.filename,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


def _bibtex_key(title: str, item_id: int):
    words = re.findall(r"[A-Za-z0-9]+", title)
    key = "".join(words[:4]) or "paper"
    return f"{key}{item_id}"


def _parse_manual_content(content: str | None):
    if not content:
        return {}

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {}


def _extract_year(text: str | None):
    if not text:
        return ""

    match = re.search(r"\b(19|20)\d{2}\b", text)
    return match.group(0) if match else ""


def build_bibtex(item: LibraryItem):
    if item.source_type == "BibTeX/RIS" and item.content and item.content.strip().startswith("@"):
        return item.content.strip()

    manual = _parse_manual_content(item.content)
    authors = manual.get("authors") or ""
    year = manual.get("year") or _extract_year(item.detail) or _extract_year(item.content)
    title = item.title
    url = item.url or (item.content if item.source_type == "URL/DOI" and item.content else "")
    doi = ""

    if item.source_type == "URL/DOI" and item.content and not item.content.startswith("http"):
        doi = item.content

    fields = [
        f"  title = {{{title}}}",
    ]

    if authors:
        fields.append(f"  author = {{{authors}}}")

    if year:
        fields.append(f"  year = {{{year}}}")

    if doi:
        fields.append(f"  doi = {{{doi}}}")

    if url and url.startswith("http"):
        fields.append(f"  url = {{{url}}}")

    if item.filename:
        fields.append(f"  file = {{{item.filename}}}")

    if item.detail:
        fields.append(f"  note = {{{item.source_type}: {item.detail}}}")

    body = ",\n".join(fields)
    return f"@article{{{_bibtex_key(title, item.id)},\n{body}\n}}"


@router.get("/")
def list_library_items(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before viewing your library.")

    items = (
        db.query(LibraryItem)
        .filter(LibraryItem.user_id == user.id)
        .order_by(LibraryItem.created_at.desc(), LibraryItem.id.desc())
        .all()
    )

    return [serialize_library_item(item) for item in items]


@router.get("/{item_id}/bibtex")
def get_library_item_bibtex(
    item_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before exporting BibTeX.")

    item = (
        db.query(LibraryItem)
        .filter(LibraryItem.id == item_id, LibraryItem.user_id == user.id)
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Paper not found in your library.")

    return {
        "item": serialize_library_item(item),
        "bibtex": build_bibtex(item),
    }


@router.post("/")
def create_library_item(
    payload: LibraryItemCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before adding library items.")

    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="A title is required.")

    item = LibraryItem(
        user_id=user.id,
        source_type=payload.source_type.strip(),
        title=payload.title.strip(),
        detail=payload.detail.strip() if payload.detail else None,
        content=payload.content,
        url=payload.url.strip() if payload.url else None,
        filename=payload.filename.strip() if payload.filename else None,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return serialize_library_item(item)
