from fastapi import APIRouter
from app.services.rag import query_rag

router = APIRouter()

@router.post("/")
def chat(query: dict):
    response = query_rag(query["message"])
    return {"response": response}