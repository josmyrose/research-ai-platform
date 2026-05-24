from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.services.chat_modes import DEFAULT_CHAT_MODE, normalize_chat_mode
from app.services.rag import is_answer_generator_unavailable, query_rag
from app.db.database import SessionLocal
from app.db.models import Chat
from app.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])


def sanitize_response_text(response):
    if not response:
        return response

    raw_context_marker = "Relevant context:"
    if raw_context_marker not in response:
        return response

    return response.split(raw_context_marker, 1)[0].strip()


def should_include_in_history(chat):
    return not is_answer_generator_unavailable(sanitize_response_text(chat.response))


def serialize_chat(chat: Chat):
    return {
        "id": chat.id,
        "message": chat.message,
        "response": sanitize_response_text(chat.response),
        "mode": chat.mode or DEFAULT_CHAT_MODE,
        "user_id": chat.user_id,
    }


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def chat(query: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before using chat.")
    
    message = (query.get("message") or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required.")

    mode = normalize_chat_mode(query.get("mode"))
    response = query_rag(message, user_id=user.id, mode=mode)
    if is_answer_generator_unavailable(response):
        return {
            "response": response,
            "chat": None,
            "saved": False,
        }

    # 👇 SAFE MIGRATION LOGIC
    user_id = user.id

    # 👇 Save chat
    new_chat = Chat(
        message=message,
        response=response,
        mode=mode,
        user_id=user_id
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return {"response": response, "chat": serialize_chat(new_chat)}
@router.get("/history")
def get_history(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before viewing chat history.")

    chats = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.id.desc())
        .all()
    )
    return [serialize_chat(chat) for chat in chats if should_include_in_history(chat)]
