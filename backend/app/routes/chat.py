from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.services.chat_modes import DEFAULT_CHAT_MODE, normalize_chat_mode
from app.services.cache import build_cache_key, get_json_cache, set_json_cache
from app.services.rag import (
    OLLAMA_NOT_RUNNING_MESSAGE,
    generate_rewrite,
    get_document_index_version,
    is_answer_generator_unavailable,
    query_rag_details,
)
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


def cache_enabled(cache_value):
    return (cache_value or "off").strip().lower() in {"on", "smart", "multi_level"}


def build_chat_cache_payload(message, user_id, mode, scope, citation_style, top_k, index_version):
    return {
        "message": message,
        "user_id": user_id,
        "mode": mode,
        "scope": scope,
        "citation_style": citation_style,
        "top_k": top_k,
        "index_version": index_version,
    }


def find_database_cache(db, message, user_id, mode):
    return (
        db.query(Chat)
        .filter(Chat.user_id == user_id, Chat.mode == mode, Chat.message == message)
        .order_by(Chat.id.desc())
        .first()
    )


@router.post("/rewrite")
def rewrite(query: dict, user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before using rewrite.")

    text = (query.get("text") or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")

    tone = (query.get("tone") or "clear academic tone").strip()
    cache_key = build_cache_key(
        "rewrite",
        {
            "text": text,
            "tone": tone,
            "user_id": user.id,
        },
    )

    cached_result = get_json_cache(cache_key)
    if cached_result:
        return {
            **cached_result,
            "cache_hit": True,
            "cache_layer": "backend",
        }

    try:
        rewritten = generate_rewrite(text, tone=tone)
    except Exception:
        return {
            "response": OLLAMA_NOT_RUNNING_MESSAGE,
            "cache_hit": False,
            "cache_layer": "error",
        }

    payload = {
        "response": rewritten or OLLAMA_NOT_RUNNING_MESSAGE,
        "cache_hit": False,
        "cache_layer": "generated",
    }
    set_json_cache(cache_key, {"response": payload["response"]})
    return payload


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
    scope = (query.get("scope") or "hybrid").strip().lower()
    citation_style = (query.get("citation_style") or "numbered").strip().lower()
    top_k = query.get("top_k")
    use_cache = cache_enabled(query.get("cache"))
    index_version = get_document_index_version()
    cache_key = build_cache_key(
        "chat",
        build_chat_cache_payload(message, user.id, mode, scope, citation_style, top_k, index_version),
    )

    if use_cache:
        cached_result = get_json_cache(cache_key)
        if cached_result:
            return {
                **cached_result,
                "chat": None,
                "saved": False,
                "cache_hit": True,
                "cache_layer": "backend",
            }

        cached_chat = find_database_cache(db, message, user.id, mode)
        if cached_chat and should_include_in_history(cached_chat):
            return {
                "response": sanitize_response_text(cached_chat.response),
                "sources": [],
                "scope": scope,
                "citation_style": citation_style,
                "chat": serialize_chat(cached_chat),
                "saved": False,
                "cache_hit": True,
                "cache_layer": "database",
            }

    result = query_rag_details(
        message,
        user_id=user.id,
        mode=mode,
        scope=scope,
        citation_style=citation_style,
        top_k=top_k,
    )
    response = result["answer"]
    if is_answer_generator_unavailable(response):
        return {
            "response": response,
            "sources": result.get("sources", []),
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

    response_payload = {
        "response": response,
        "sources": result.get("sources", []),
        "scope": result.get("scope"),
        "citation_style": result.get("citation_style"),
        "chat": serialize_chat(new_chat),
        "saved": True,
        "cache_hit": False,
        "cache_layer": "generated",
    }
    if use_cache:
        set_json_cache(
            cache_key,
            {
                "response": response_payload["response"],
                "sources": response_payload["sources"],
                "scope": response_payload["scope"],
                "citation_style": response_payload["citation_style"],
            },
        )

    return response_payload


@router.get("/history")
def get_history(search: str = "", user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before viewing chat history.")

    query = db.query(Chat).filter(Chat.user_id == user.id)
    if search:
        term = f"%{search}%"
        query = query.filter((Chat.message.ilike(term)) | (Chat.response.ilike(term)))

    chats = query.order_by(Chat.id.desc()).all()
    return [serialize_chat(chat) for chat in chats if should_include_in_history(chat)]


@router.delete("/history/{chat_id}")
def delete_history_item(chat_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before deleting chat history.")

    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat history item not found.")

    db.delete(chat)
    db.commit()
    return {"message": "Chat history item deleted."}
