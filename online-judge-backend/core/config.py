from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Modern Online Judge"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    DATABASE_URL: str

    REDIS_URL: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()