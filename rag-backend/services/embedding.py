from sqlalchemy.orm import Session
from sqlalchemy import select
from models.chunk import DocumentChunk, ChunkEmbedding
from langchain_ollama import OllamaEmbeddings
from core.config import settings
import uuid

def process_and_store_chunks(db: Session, document_id: str, chunks: list[str], pages_info: list[dict], chapters_info: list[dict]):
    """
    Generate embeddings for each chunk and store them in PostgreSQL (pgvector).
    We also map chunks to pages/chapters via basic heuristic (finding text substring).
    """
    embeddings_model = OllamaEmbeddings(
        model=settings.embedding_model,
        base_url=settings.ollama_base_url
    )
    
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

    for i, chunk_text in enumerate(chunks):
        # 1. Determine metadata (e.g. which page it belongs to roughly)
        page_num = 1
        for p in pages_info:
            # simple substring check to guess page (not 100% accurate if chunk crosses pages)
            if chunk_text[:50] in p['text']:
                page_num = p['page_num']
                break
        
        # Determine chapter based on page_num
        chapter_title = "Document Content"
        for chap in sorted_chapters:
            if chap['startPage'] <= page_num:
                chapter_title = chap['title']
            else:
                break # Since it's sorted, we can break early
                
        metadata = {
            "page_num": page_num,
            "chapter_title": chapter_title
        }

        # 2. Save DocumentChunk
        doc_chunk = DocumentChunk(
            document_id=doc_uuid,
            chunk_index=i,
            content=chunk_text,
            token_count=len(chunk_text.split()), # rough estimation
            metadata_=metadata
        )
        db.add(doc_chunk)
        db.flush() # get doc_chunk.id

        # 3. Save ChunkEmbedding
        chunk_emb = ChunkEmbedding(
            chunk_id=doc_chunk.id,
            embedding=vectors[i],
            model_name=settings.embedding_model
        )
        db.add(chunk_emb)

    db.commit()
