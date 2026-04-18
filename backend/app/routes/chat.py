from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.rag import query_rag
from app.db.database import SessionLocal
from app.db.models import Chat
from app.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def chat(query: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):

    message = query["message"]
    response = query_rag(message)

    # 👇 SAFE MIGRATION LOGIC
    if user:
        user_id = user.id
    else:
        user_id = None   # guest mode (old behavior)

    # 👇 Save chat
    new_chat = Chat(
        message=message,
        response=response,
        user_id=user_id
    )

    db.add(new_chat)
    db.commit()

    return {"response": response}