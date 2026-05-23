from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import get_current_user
from app.services.rag import search_documents

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/")
def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(8, ge=1, le=20),
    user=Depends(get_current_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before searching documents.")

    results = search_documents(q, user_id=user.id, limit=limit)

    return {
        "query": q,
        "count": len(results),
        "results": results,
    }
