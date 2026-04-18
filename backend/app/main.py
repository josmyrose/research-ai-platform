from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, chat,upload
from dotenv import load_dotenv
from app.db.database import Base, engine

load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ✅ create tables safely
Base.metadata.create_all(bind=engine)
app.include_router(auth.router)
app.include_router(chat.router)
#app.include_router(upload.router)
app.include_router(upload.router, prefix="/upload", tags=["Upload"])

@app.get("/")
def root():
    return {"message": "Research AI Platform API"}