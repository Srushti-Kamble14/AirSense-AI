"""SQLAlchemy engine configuration for PostgreSQL connectivity.
This module prepares the shared database engine without creating tables.
Model definitions and migrations will be added in a later backend phase.
"""

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.config.settings import settings


def create_database_engine() -> Engine:
    if not settings.DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured.")

    return create_engine(settings.DATABASE_URL, pool_pre_ping=True)


engine = create_database_engine() if settings.DATABASE_URL else None
