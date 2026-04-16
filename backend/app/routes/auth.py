from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta

router = APIRouter()
SECRET_KEY = "secret"

class User(BaseModel):
    email: str
    password: str

fake_db = {}

@router.post("/register")
def register(user: User):
    fake_db[user.email] = user.password
    return {"msg": "Registered"}

@router.post("/login")
def login(user: User):
    if fake_db.get(user.email) != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {"sub": user.email, "exp": datetime.utcnow() + timedelta(hours=2)},
        SECRET_KEY,
        algorithm="HS256"
    )
    return {"access_token": token}
