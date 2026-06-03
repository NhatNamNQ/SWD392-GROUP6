import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    database_url: str = os.getenv("DATABASE_URL", "postgresql://orbitdocs_admin:orbitdocs_password@localhost:5432/orbitdocs_db")
    java_backend_url: str = os.getenv("JAVA_BACKEND_URL", "http://localhost:8080")

    # Model configuration (single source of truth)
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "qwen3-embedding:0.6b")
    llm_model: str = os.getenv("LLM_MODEL", "gemini-3.1-flash-lite")

    class Config:
        env_file = "../.env"
        extra = "ignore"

settings = Settings()
