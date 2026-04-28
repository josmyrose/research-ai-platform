from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "supersecret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# 🔐 Hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# 🔐 Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# 🔐 Create JWT token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)