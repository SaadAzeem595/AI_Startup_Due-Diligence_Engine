import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Startup Due Diligence Engine"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Database
    # Use SQLite locally by default, or Supabase PostgreSQL if DATABASE_URL is set
    DATABASE_URL: str = "sqlite:///./due_diligence.db"
    
    # API Keys & Third-party Services
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "startup-due-diligence"
    
    # Clerk settings (for production)
    CLERK_SECRET_KEY: str = ""
    
    # Simulation / Mock Mode
    # If True, bypasses actual API calls to Gemini/Pinecone and simulates realistic agent analysis
    MOCK_MODE: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

# Load settings, but allow overrides from environment
settings = Settings()

# Proactively force Mock Mode to True if no keys are found
if not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY:
    settings.MOCK_MODE = True
