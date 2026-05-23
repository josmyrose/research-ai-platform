import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import LibraryItem
from app.dependencies import get_current_user
from app.services.rag import process_pdf

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def serialize_library_item(item: LibraryItem):
    return {
        "id": item.id,
        "source_type": item.source_type,
        "title": item.title,
        "detail": item.detail,
        "filename": item.filename,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


@router.post("/")
async def upload_pdf(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before uploading documents.")

    if not file.filename:
        raise HTTPException(status_code=400, detail="A filename is required.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    safe_name = Path(file.filename).name
    file_path = UPLOAD_DIR / safe_name

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = process_pdf(file_path, user_id=user.id)

    library_item = LibraryItem(
        user_id=user.id,
        source_type="PDF",
        title=result["filename"],
        detail=f"{result['page_count']} pages, {result['chunk_count']} indexed chunks",
        content=result["summary"],
        filename=result["filename"],
    )
    db.add(library_item)
    db.commit()
    db.refresh(library_item)

    return {
        "message": "PDF processed successfully.",
        "library_item": serialize_library_item(library_item),
        **result,
    }
