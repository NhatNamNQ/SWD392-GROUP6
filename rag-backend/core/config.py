import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    database_url: str = os.getenv("DATABASE_URL", "")
    java_backend_url: str = os.getenv("JAVA_BACKEND_URL", "")

    # Model configuration (single source of truth)
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "")
    llm_model: str = os.getenv("LLM_MODEL", "")
    
    # Internal auth between Java and Python
    internal_api_key: str = os.getenv("INTERNAL_API_KEY", "")

    class Config:
        env_file = "../.env"
        extra = "ignore"

settings = Settings()
