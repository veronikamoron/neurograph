import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    HOST: str = '0.0.0.0'
    PORT: int = 8000
    LOG_LEVEL: str = 'info'
    CORS_ORIGINS: List[str] = ['*']
    CHROMA_PERSIST_DIR: str = './chroma_db'
    EMBEDDING_MODEL: str = 'all-MiniLM-L6-v2'

settings = Settings()
