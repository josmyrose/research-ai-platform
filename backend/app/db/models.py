from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)


class LibraryItem(Base):
    __tablename__ = "library_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    source_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    detail = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    filename = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ScholarEntry(Base):
    __tablename__ = "scholar_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    entry_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    detail = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
