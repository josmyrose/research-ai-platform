import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.dependencies import get_current_user
from app.services.rag import process_pdf

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/")
async def upload_pdf(file: UploadFile = File(...), user=Depends(get_current_user)):
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

    return {
        "message": "PDF processed successfully.",
        **result,
    }
