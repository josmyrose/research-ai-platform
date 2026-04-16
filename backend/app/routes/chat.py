from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def chat(query: dict):
    return {"response": f"Echo: {query['message']}"}
