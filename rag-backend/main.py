from fastapi import FastAPI
from sqlalchemy import text
import logging
from routers import indexer, chat
from core.database import Base, engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create pgvector extension if it doesn't exist
with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    conn.commit()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OrbitDocs Python RAG Backend")

app.include_router(indexer.router, prefix="/api", tags=["indexer"])
app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
