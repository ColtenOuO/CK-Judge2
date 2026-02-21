from pydantic_settings import BaseSettings
from typing import List, Optional
import os

def _parse_cors_origins(raw: Optional[str]) -> List[str]:

    if not raw:
        return [
            "http://localhost:3000",
            "http://localhost:8000",
            "http://localhost",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "http://127.0.0.1",
        ]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


class Settings(BaseSettings):
    PROJECT_NAME: str = "NCKU Online Judge"
    API_V1_STR: str = "/api/v1"


    BACKEND_CORS_ORIGINS_RAW: Optional[str] = None

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        return _parse_cors_origins(self.BACKEND_CORS_ORIGINS_RAW)

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str

    REDIS_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ADMIN_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520
    ENV: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()