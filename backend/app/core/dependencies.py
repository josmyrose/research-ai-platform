from fastapi import Request
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM

def get_current_user_optional(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        return None
    try:
        token = auth.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None