import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use env var in production, fallback to SQLite for dev
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./research_ai.db"
)

def _create_engine(url: str):
    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False}
        )
    return create_engine(url, pool_pre_ping=True)  # safer for prod

engine = _create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()