"""SQLAlchemy engine configuration for PostgreSQL connectivity."""

from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings


def create_database_engine() -> Engine:
    if not settings.DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured.")

    return create_engine(
        settings.DATABASE_URL,
        echo=True,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=1800,
        future=True,
    )


@lru_cache
def get_engine() -> Engine:
    return create_database_engine()


# -----------------------------
# Session Factory
# -----------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=get_engine(),
)