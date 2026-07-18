"""Centralized runtime settings for the AirSenseAI backend.
Values are loaded from environment variables and the local .env file.
Secrets and deployment-specific values should never be hardcoded in source.
"""

from functools import lru_cache

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "AirSenseAI Backend"
    API_VERSION: str = "0.1.0"
    DATABASE_URL: str = Field(default="", description="PostgreSQL connection URL.")
    OPENAQ_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    SECRET_KEY: str = ""
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
