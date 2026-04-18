from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    response = Column(String)

    # ✅ NEW FIELD (IMPORTANT)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)