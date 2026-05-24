from sqlalchemy import inspect, text

from app.db.database import engine


def ensure_runtime_schema():
    inspector = inspect(engine)
    if "chats" not in inspector.get_table_names():
        return

    chat_columns = {column["name"] for column in inspector.get_columns("chats")}
    if "mode" in chat_columns:
        return

    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE chats ADD COLUMN mode VARCHAR NOT NULL DEFAULT 'lite'")
        )
