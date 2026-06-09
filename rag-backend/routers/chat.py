from fastapi import APIRouter, Depends, Header, HTTPException

# ... existing imports
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select
from core.database import get_db
from models.chunk import DocumentChunk, ChunkEmbedding
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import OllamaEmbeddings
from core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def verify_internal_key(x_api_key: str = Header(None)):
    if x_api_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid internal API key")

class ChatRequest(BaseModel):
    document_id: str
    query: str
    chapter_title: str | None = None
    top_k: int = 5

class ChatResponse(BaseModel):
    answer: str
    citations: list[dict]

@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(verify_internal_key)])
def chat_with_document(req: ChatRequest, db: Session = Depends(get_db)):
    """
    RAG Retrieval Endpoint using PgVector + Gemini LLM.
    Filters by document_id and optionally chapter_title via metadata.
    """
    if not settings.gemini_api_key:
        return {"answer": "Error: GEMINI_API_KEY is missing", "citations": []}

    # 1. Embed the query

    embeddings = OllamaEmbeddings(
        model=settings.embedding_model,
        base_url=settings.ollama_base_url
    )
    query_vector = embeddings.embed_query(req.query)

    # 2. Retrieve top_k chunks from pgvector via cosine distance
    stmt = (
        select(DocumentChunk, ChunkEmbedding.embedding.cosine_distance(query_vector).label('distance'))
        .join(ChunkEmbedding, DocumentChunk.id == ChunkEmbedding.chunk_id)
        .where(DocumentChunk.document_id == req.document_id)
    )

    # Metadata filtering (if chapter is specified)
    # Using JSONB contains operator to match metadata
    if req.chapter_title:
        # Match chapter in metadata JSON
        # metadata_ is a JSONB column, so we use the ->> operator to extract chapter_title as text
        stmt = stmt.where(DocumentChunk.metadata_['chapter_title'].astext == req.chapter_title)

    stmt = stmt.order_by('distance').limit(req.top_k)
    
    results = db.execute(stmt).all()

    context_texts = []
    citations = []

    for doc_chunk, distance in results:
        context_texts.append(doc_chunk.content)
        citations.append({
            "chunk_index": doc_chunk.chunk_index,
            "page_num": doc_chunk.metadata_.get("page_num", 1),
            "distance": float(distance)
        })

    context_block = "\n\n---\n\n".join(context_texts)

    # 3. Call Gemini LLM
    llm = ChatGoogleGenerativeAI(
        model=settings.llm_model, 
        temperature=0,
        google_api_key=settings.gemini_api_key
    )
    
    prompt = f"""You are a helpful assistant for answering questions about a document.
        Use the following pieces of retrieved context to answer the question.
        If you don't know the answer based on the context, just say that you don't know.

        Context:
        {context_block}

        Question:
        {req.query}

        Answer:"""

    response = llm.invoke(prompt)
    content = response.content
    
    # Handle cases where LangChain Gemini returns a list of blocks instead of a string
    if isinstance(content, list):
        text_parts = []
        for part in content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                text_parts.append(part["text"])
        content = "".join(text_parts)

    return {
        "answer": str(content),
        "citations": citations
    }
