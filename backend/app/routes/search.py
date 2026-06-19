from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import get_current_user
from app.services.cache import build_cache_key, get_json_cache, set_json_cache
from app.services.rag import get_document_index_version, search_documents

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/")
def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(8, ge=1, le=20),
    user=Depends(get_current_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="Login is required before searching documents.")

    cleaned_query = q.strip()
    cache_key = build_cache_key(
        "search",
        {
            "query": cleaned_query.lower(),
            "user_id": user.id,
            "limit": limit,
            "index_version": get_document_index_version(),
        },
    )
    cached_results = get_json_cache(cache_key)
    if cached_results is not None:
        return {
            "query": q,
            "count": len(cached_results),
            "results": cached_results,
            "cache_hit": True,
        }

    results = search_documents(cleaned_query, user_id=user.id, limit=limit)
    set_json_cache(cache_key, results)

    return {
        "query": q,
        "count": len(results),
        "results": results,
        "cache_hit": False,
    }
