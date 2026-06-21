from sqlalchemy.orm import Session
from sqlalchemy import select
from models.chunk import DocumentChunk, ChunkEmbedding
from langchain_ollama import OllamaEmbeddings
from services.chunking import BatchedOllamaEmbeddings
from core.config import settings
import uuid

def process_and_store_chunks(db: Session, document_id: str, chunks: list[str], pages_info: list[dict], chapters_info: list[dict]):
    """
    Generate embeddings for each chunk and store them in PostgreSQL (pgvector).
    We also map chunks to pages/chapters via basic heuristic (finding text substring).
    """
    base_embeddings_model = OllamaEmbeddings(
        model=settings.embedding_model,
        base_url=settings.ollama_base_url
    )
    embeddings_model = BatchedOllamaEmbeddings(base_embeddings_model, batch_size=50)
    
    # Generate embeddings for all chunks locally (no rate limits)
    vectors = embeddings_model.embed_documents(chunks)
    doc_uuid = uuid.UUID(document_id)

    # First, let's clean up any existing chunks for this document if re-indexing
    # We must delete ChunkEmbedding first to avoid ForeignKeyViolation
    chunk_ids_stmt = select(DocumentChunk.id).filter(DocumentChunk.document_id == doc_uuid)
    db.query(ChunkEmbedding).filter(ChunkEmbedding.chunk_id.in_(chunk_ids_stmt)).delete(synchronize_session=False)
    db.query(DocumentChunk).filter(DocumentChunk.document_id == doc_uuid).delete(synchronize_session=False)
    db.commit()

    # Sort chapters by startPage to easily find which chapter a page belongs to
    sorted_chapters = sorted(chapters_info, key=lambda x: x['startPage'])

    # First, save all DocumentChunks
    doc_chunks = []
    for i, chunk_text in enumerate(chunks):
        page_num = 1
        for p in pages_info:
            if chunk_text[:50] in p['text']:
                page_num = p['page_num']
                break
        
        chapter_title = "Document Content"
        for chap in sorted_chapters:
            if chap['startPage'] <= page_num:
                chapter_title = chap['title']
            else:
                break
                
        metadata = {
            "page_num": page_num,
            "chapter_title": chapter_title
        }

        doc_chunk = DocumentChunk(
            document_id=doc_uuid,
            chunk_index=i,
            content=chunk_text,
            token_count=len(chunk_text.split()),
            metadata_=metadata
        )
        doc_chunks.append(doc_chunk)

    db.add_all(doc_chunks)
    db.flush() # flush to generate IDs

    # Then save all ChunkEmbeddings
    chunk_embs = []
    for i, doc_chunk in enumerate(doc_chunks):
        chunk_emb = ChunkEmbedding(
            chunk_id=doc_chunk.id,
            embedding=vectors[i],
            model_name=settings.embedding_model
        )
        chunk_embs.append(chunk_emb)
        
    db.add_all(chunk_embs)
    db.commit()
