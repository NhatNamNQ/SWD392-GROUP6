from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from services.document_parser import DocumentParser
from services.chunking import chunk_document
from services.embedding import process_and_store_chunks
from services.webhook import sync_chapters_to_java, notify_failure_to_java
import logging
import os
import traceback

logger = logging.getLogger(__name__)

router = APIRouter()

class IndexRequest(BaseModel):
    documentId: str
    jobId: str
    storagePath: str

def indexing_task(req: IndexRequest, db: Session):
    logger.info(f"Starting indexing task for document: {req.documentId}, job: {req.jobId}")
    
    try:
        # 1. Parse PDF
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../OrbitDocs-backend"))
        file_path = os.path.join(base_dir, req.storagePath)
        
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            notify_failure_to_java(req.documentId, req.jobId, "File not found")
            return

        full_text, chapters_info, pages_info = DocumentParser.parse_pdf(file_path)
        
        # 2. Semantic Chunking
        chunks = chunk_document(full_text)
        
        # 3. Embedding and Store
        process_and_store_chunks(db, req.documentId, chunks, pages_info, chapters_info)
        
        # 4. Webhook to Java
        sync_chapters_to_java(req.documentId, req.jobId, chapters_info, len(chunks))

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Indexing failed for {req.documentId}: {error_msg}")
        logger.error(traceback.format_exc())
        notify_failure_to_java(req.documentId, req.jobId, error_msg)

@router.post("/index")
def index_document(req: IndexRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Receives request from Java to index a document.
    Runs the process in the background.
    """
    background_tasks.add_task(indexing_task, req, db)
    return {"message": "Indexing started", "documentId": req.documentId}
