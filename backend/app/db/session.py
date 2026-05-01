from app.db.database import SessionLocal

def get_db():
    db = None
    try:
        db = SessionLocal()
        yield db
    except Exception as e:
        print("⚠️ DB error:", e)
        yield None   # 👈 fail-safe: app continues
    finally:
        if db:
            db.close()

            