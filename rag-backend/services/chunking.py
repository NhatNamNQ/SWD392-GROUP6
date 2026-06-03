from langchain_experimental.text_splitter import SemanticChunker
from langchain_ollama import OllamaEmbeddings
from core.config import settings

def chunk_document(full_text: str):
    """
    Chunks a document using Langchain's SemanticChunker with local Ollama embeddings.
    """
    # Initialize Local Ollama Embedding Model
    embeddings = OllamaEmbeddings(
        model=settings.embedding_model,
        base_url=settings.ollama_base_url
    )
    
    # Initialize Semantic Chunker
    text_splitter = SemanticChunker(embeddings, breakpoint_threshold_amount=0.85)
    
    # Split text
    return text_splitter.split_text(full_text)